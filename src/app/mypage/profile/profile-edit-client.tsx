"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { updateProfileAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { EMPTY_FORM_STATE } from "@/lib/form-state";

type ProfileEditClientProps = {
  initialData: { nickname: string; email: string; avatarUrl: string | null; bio: string; profileTheme: string };
};

const PROFILE_THEMES = {
  ocean: {
    label: "오션",
    card: "from-sky-50 via-white to-blue-100",
    avatar: "from-sky-500 to-blue-600",
    ring: "ring-sky-200",
  },
  sunset: {
    label: "선셋",
    card: "from-orange-50 via-white to-rose-100",
    avatar: "from-orange-500 to-rose-500",
    ring: "ring-orange-200",
  },
  forest: {
    label: "포레스트",
    card: "from-emerald-50 via-white to-lime-100",
    avatar: "from-emerald-500 to-green-600",
    ring: "ring-emerald-200",
  },
  violet: {
    label: "바이올렛",
    card: "from-violet-50 via-white to-fuchsia-100",
    avatar: "from-violet-500 to-fuchsia-500",
    ring: "ring-violet-200",
  },
} as const;

type CropState = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

const DEFAULT_CROP: CropState = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

function AvatarPreview({
  src,
  fallback,
  crop,
  editable = false,
  onPointerDown,
}: {
  src: string | null;
  fallback: string;
  crop: CropState;
  editable?: boolean;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
}) {
  if (!src) {
    return (
      <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl font-medium shadow-sm ring-4 ring-white">
        {fallback.charAt(0)}
      </div>
    );
  }

  return (
    <div
      className={`relative h-36 w-36 overflow-hidden rounded-full bg-slate-100 ring-4 ring-white shadow-sm ${editable ? "cursor-grab active:cursor-grabbing" : ""}`}
      onPointerDown={onPointerDown}
    >
      <img
        src={src}
        alt="프로필"
        draggable={false}
        className="absolute left-1/2 top-1/2 h-full w-full max-w-none object-cover"
        style={{
          transform: `translate(calc(-50% + ${crop.offsetX}px), calc(-50% + ${crop.offsetY}px)) scale(${crop.zoom})`,
          transformOrigin: "center center",
        }}
      />
    </div>
  );
}

async function uploadCroppedAvatar(file: File, crop: CropState) {
  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });

    const canvas = document.createElement("canvas");
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("이미지 편집을 시작할 수 없습니다.");
    }

    const baseScale = Math.max(size / image.width, size / image.height);
    const drawWidth = image.width * baseScale * crop.zoom;
    const drawHeight = image.height * baseScale * crop.zoom;
    const dx = (size - drawWidth) / 2 + crop.offsetX * 2;
    const dy = (size - drawHeight) / 2 + crop.offsetY * 2;

    ctx.drawImage(image, dx, dy, drawWidth, drawHeight);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((created) => {
        if (created) resolve(created);
        else reject(new Error("프로필 사진 생성에 실패했습니다."));
      }, "image/png", 0.92);
    });

    const formData = new FormData();
    formData.append("file", new File([blob], `avatar-${Date.now()}.png`, { type: "image/png" }));

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || "프로필 사진 업로드에 실패했습니다.");
    }

    return res.json();
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export default function ProfileEditClient({ initialData }: ProfileEditClientProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfileAction, {
    ...EMPTY_FORM_STATE,
  });
  const [nickname, setNickname] = useState(initialData.nickname);
  const [email, setEmail] = useState(initialData.email);
  const [bio, setBio] = useState(initialData.bio);
  const [profileTheme, setProfileTheme] = useState(initialData.profileTheme);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData.avatarUrl);
  const [showEditor, setShowEditor] = useState(false);
  const [editImageSrc, setEditImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropState>(DEFAULT_CROP);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isApplyingAvatar, setIsApplyingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    return () => {
      if (editImageSrc) {
        URL.revokeObjectURL(editImageSrc);
      }
    };
  }, [editImageSrc]);

  useEffect(() => {
    if (state.message?.includes("수정")) {
      router.refresh();
    }
  }, [router, state.message]);

  const activeTheme = PROFILE_THEMES[profileTheme as keyof typeof PROFILE_THEMES] ?? PROFILE_THEMES.ocean;
  const hasProfileChanges = nickname !== initialData.nickname || email !== initialData.email || bio !== initialData.bio || profileTheme !== initialData.profileTheme || avatarPreview !== initialData.avatarUrl;
  const profileCompletion = [nickname.trim(), email.trim(), bio.trim()].filter(Boolean).length;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("이미지 파일만 프로필 사진으로 사용할 수 있습니다.");
      return;
    }

    if (editImageSrc) {
      URL.revokeObjectURL(editImageSrc);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setCrop(DEFAULT_CROP);
    setAvatarError(null);
    setEditImageSrc(objectUrl);
    setShowEditor(true);
    e.target.value = "";
  };

  const applyAvatarCrop = async () => {
    if (!selectedFile || !editImageSrc) return;

    setIsApplyingAvatar(true);
    setAvatarError(null);

    try {
      const uploaded = await uploadCroppedAvatar(selectedFile, crop);
      setAvatarPreview(uploaded.url);
      if (editImageSrc) {
        URL.revokeObjectURL(editImageSrc);
      }
      setEditImageSrc(null);
      setSelectedFile(null);
      setCrop(DEFAULT_CROP);
      setShowEditor(false);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : "프로필 사진 업로드에 실패했습니다.");
    } finally {
      setIsApplyingAvatar(false);
    }
  };

  const resetEditingAvatar = () => {
    if (editImageSrc) {
      URL.revokeObjectURL(editImageSrc);
    }
    setEditImageSrc(null);
    setSelectedFile(null);
    setCrop(DEFAULT_CROP);
    setAvatarError(null);
    setShowEditor(false);
  };

  const removeAvatar = () => {
    if (editImageSrc) {
      URL.revokeObjectURL(editImageSrc);
    }
    setEditImageSrc(null);
    setSelectedFile(null);
    setCrop(DEFAULT_CROP);
    setAvatarPreview(null);
    setAvatarError(null);
    setShowEditor(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setCrop((prev) => ({
      ...prev,
      zoom: Math.max(1, Math.min(2.5, prev.zoom + delta)),
    }));
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    const drag = dragStartRef.current;
    if (!drag || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const deltaX = (clientX - drag.x) * (150 / rect.width);
    const deltaY = (clientY - drag.y) * (150 / rect.height);

    setCrop((prev) => ({
      ...prev,
      offsetX: Math.max(-100, Math.min(100, Math.round(drag.offsetX + deltaX))),
      offsetY: Math.max(-100, Math.min(100, Math.round(drag.offsetY + deltaY))),
    }));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: crop.offsetX,
      offsetY: crop.offsetY,
    };

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    handleDragMove(event.clientX, event.clientY);
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      {showEditor && editImageSrc ? (
        <div className="animate-fadeIn">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">프로필 사진 편집</h1>
            <button
              onClick={resetEditingAvatar}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div
              ref={imageContainerRef}
              className="relative aspect-square w-full cursor-move select-none bg-slate-900 overflow-hidden"
              onWheel={handleWheelZoom}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <img
                src={editImageSrc}
                alt="편집할 이미지"
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain"
                style={{
                  transform: `translate(calc(-50% + ${crop.offsetX}px), calc(-50% + ${crop.offsetY}px)) scale(${crop.zoom})`,
                  transformOrigin: "center center",
                }}
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 m-auto h-32 w-32 rounded-full border-2 border-white/50 shadow-lg" />
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">확대</div>
                  <div className="text-lg font-semibold text-slate-900">{Math.round(crop.zoom * 100)}%</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">좌우</div>
                  <div className="text-lg font-semibold text-slate-900">{crop.offsetX}px</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">상하</div>
                  <div className="text-lg font-semibold text-slate-900">{crop.offsetY}px</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">크기 조절</span>
                    <span className="text-slate-500">{crop.zoom.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.05"
                    value={crop.zoom}
                    onChange={(e) => setCrop((prev) => ({ ...prev, zoom: Number(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">← →</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={crop.offsetX}
                      onChange={(e) => setCrop((prev) => ({ ...prev, offsetX: Number(e.target.value) }))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">↑ ↓</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={crop.offsetY}
                      onChange={(e) => setCrop((prev) => ({ ...prev, offsetY: Number(e.target.value) }))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetEditingAvatar}
                  className="flex-1 rounded-2xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={applyAvatarCrop}
                  disabled={isApplyingAvatar}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl disabled:opacity-60"
                >
                  {isApplyingAvatar ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      적용 중...
                    </span>
                  ) : "적용하기"}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            마우스 드래그로 위치 조절, 스크롤로 확대/축소
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">프로필 수정</h1>
              <p className="mt-2 text-sm text-slate-500">프로필 사진과 닉네임을 수정할 수 있습니다.</p>
            </div>

            <div className={`overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br ${activeTheme.card} p-5 shadow-sm`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {!avatarPreview ? (
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${activeTheme.avatar} text-2xl font-medium text-white shadow-md ring-4 ring-white`}>
                      {nickname.charAt(0) || initialData.nickname.charAt(0)}
                    </div>
                  ) : (
                    <div className={`h-16 w-16 overflow-hidden rounded-full bg-slate-100 ring-4 ${activeTheme.ring} shadow-md`}>
                      <img src={avatarPreview} alt="프로필 미리보기" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-700">Live Preview</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{nickname || "닉네임"}</p>
                    <p className="mt-1 text-sm text-slate-500">{email || "이메일 주소"}</p>
                    {bio ? <p className="mt-2 text-sm text-slate-600">{bio}</p> : null}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${hasProfileChanges ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {hasProfileChanges ? "변경됨" : "최신 상태"}
                  </span>
                  <span className="text-xs text-slate-500">입력 완성도 {profileCompletion}/3</span>
                </div>
              </div>
            </div>
          </div>

          {state.message ? (
            <div className={`rounded-2xl px-4 py-3 text-sm ${state.message.includes("수정") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {state.message}
            </div>
          ) : null}

          <form action={formAction} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-5">
              <div className="group relative">
                {!avatarPreview ? (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-5xl font-medium shadow-md ring-4 ring-white">
                    {initialData.nickname.charAt(0)}
                  </div>
                ) : (
                  <div className="h-28 w-28 overflow-hidden rounded-full bg-slate-100 ring-4 ring-white shadow-md">
                    <img src={avatarPreview} alt="프로필" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
                  >
                    <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.76-.9l.814-1.114A2 2 0 0111.07 4h2.86a2 2 0 011.76.9l.814 1.114A2 2 0 0019.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13h3m-3 4h2" />
                    </svg>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    이미지 변경
                  </span>
                </button>
                {avatarPreview ? (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      삭제
                    </span>
                  </button>
                ) : null}
              </div>

              {avatarError ? <p className="text-sm text-rose-600">{avatarError}</p> : null}
            </div>

            <input type="hidden" name="avatarUrl" value={avatarPreview ?? ""} />
            <input type="hidden" name="profileTheme" value={profileTheme} />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="nickname">
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                required
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{nickname !== initialData.nickname ? "변경 예정" : "현재 닉네임"}</span>
                <span>{nickname.length}자</span>
              </div>
              {state.errors?.nickname?.[0] && (
                <p className="text-sm text-rose-600">{state.errors.nickname[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                required
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{email !== initialData.email ? "변경 예정" : "현재 이메일"}</span>
                <span>{email.includes("@") ? "형식 확인" : "입력 필요"}</span>
              </div>
              {state.errors?.email?.[0] && (
                <p className="text-sm text-rose-600">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="bio">
                소개 한 줄
              </label>
              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={60}
                className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                placeholder="간단한 소개를 적어보세요"
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{bio ? "미리보기에 반영됨" : "선택 입력"}</span>
                <span>{bio.length}/60</span>
              </div>
              {state.errors?.bio?.[0] && (
                <p className="text-sm text-rose-600">{state.errors.bio[0]}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">프로필 테마</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(PROFILE_THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProfileTheme(key)}
                    className={`rounded-2xl border p-3 text-left transition ${profileTheme === key ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/15" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className={`h-10 rounded-xl bg-gradient-to-r ${theme.avatar}`} />
                    <p className="mt-2 text-sm font-medium text-slate-700">{theme.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/mypage" className="flex-1 rounded-2xl border border-slate-300 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                목록으로 가기
              </Link>
              <SubmitButton className="flex-1 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-xl hover:-translate-y-0.5">
                {hasProfileChanges ? "변경 저장하기" : "수정하기"}
              </SubmitButton>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

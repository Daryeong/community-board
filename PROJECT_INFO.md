# 커뮤니티 게시판 프로젝트

## 기술 스택 (핵심 요소 요약)

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2.1 |
| UI | React 19 + Tailwind CSS 4 |
| DB | Prisma + SQLite |
| 검증 | Zod |
| 테스트 | Vitest |

## 한 줄 요약

**Next.js + React + Tailwind + Prisma + SQLite**

---

## 프로젝트 구조

```text
src/
├── app/                    # Next.js App Router
│   ├── actions.ts         # 서버 액션 (로그인, 글작성, 프로필 수정 등)
│   ├── page.tsx           # 홈 페이지
│   ├── login/             # 로그인
│   ├── register/          # 회원가입
│   ├── write/             # 글쓰기
│   ├── posts/             # 게시글 상세, 수정
│   ├── mypage/            # 마이페이지 (프로필, 북마크, 알림, 설정 등)
│   ├── password/           # 비밀번호 변경
│   └── admin/             # 관리자 페이지
│
├── components/            # React UI 컴포넌트
│   ├── header.tsx         # 헤더
│   ├── auth-form.tsx      # 로그인/회원가입 폼
│   ├── post-form.tsx      # 글쓰기 폼
│   ├── comment-thread.tsx # 댓글/답글
│   ├── submit-button.tsx  # 제출 버튼
│   └── ...
│
└── lib/                   # 핵심 로직
    ├── db.ts              # Prisma DB 연결
    ├── session.ts          # 세션/인증
    ├── permissions.ts      # 권한 체크
    ├── board-data.ts      # DB 조회/수정
    ├── board.ts            # Zod 검증 스키마
    ├── sanitize.ts        # XSS 방어
    └── utils.ts           # 유틸 함수
```

## 데이터 흐름 예시

### 글 작성
```
사용자 폼 입력
→ PostForm
→ createPostAction
→ board-data.ts
→ Prisma
→ SQLite 저장
```

### 프로필 수정
```
프로필 수정 화면
→ updateProfileAction
→ updateUserProfile
→ Prisma
→ User 테이블 수정
```

### 로그인
```
로그인 폼
→ loginAction
→ loginUser
→ 세션 생성
→ Session 테이블 저장
```

## DB 테이블

1. **User** - 회원 정보 (username, nickname, email, passwordHash, avatarUrl, bio, profileTheme, notifyComment, notifyLike, isAdmin)
2. **Post** - 게시글
3. **Comment** - 댓글/답글 (parentId 기반 트리 구조)
4. **Notification** - 알림
5. **Bookmark** - 북마크
6. **BookmarkFolder** - 북마크 폴더
7. **Session** - 로그인 세션
8. **ActionLog** - 사용자 행동 기록 (감사용)
9. **Report** - 신고
10. **UserBlock** - 사용자 차단

## 배포 정보

- 현재 로컬 SQLite (`dev.db`) 사용 중
- Vercel 배포 시 PostgreSQL (Neon 또는 Supabase)으로 마이그레이션 필요

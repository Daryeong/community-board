import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getViewer } from "@/lib/session";
import ProfileEditClient from "./profile-edit-client";

export default async function ProfilePage() {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fmypage%2Fprofile");
  }

  const user = await prisma.user.findUnique({
    where: { id: viewer.id },
    select: { nickname: true, email: true, avatarUrl: true },
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfileEditClient initialData={{ nickname: user.nickname, email: user.email, avatarUrl: user.avatarUrl }} />;
}
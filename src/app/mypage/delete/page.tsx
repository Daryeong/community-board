import { redirect } from "next/navigation";

import { getViewer } from "@/lib/session";
import DeleteAccountClient from "./page";

export default async function DeleteAccountPage() {
  const viewer = await getViewer();
  if (!viewer) {
    redirect("/login?next=%2Fmypage%2Fdelete");
  }

  return <DeleteAccountClient />;
}
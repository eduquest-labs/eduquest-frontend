import type { Metadata } from "next";

import { StudentProfilePage } from "@/components/student";

export const metadata: Metadata = { title: "Profil Siswa | EduQuest" };

export default function ProfilePage() {
  return <StudentProfilePage />;
}

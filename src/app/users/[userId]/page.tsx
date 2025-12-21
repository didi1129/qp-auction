"use client";

import { useParams } from "next/navigation";
import { UserProfileViewer } from "@/components/UserProfileViewer";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  return <UserProfileViewer userId={userId} />;
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfileViewer } from "@/components/UserProfileViewer";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        // Not logged in, redirect to home or show error
        alert("로그인이 필요합니다.");
        router.push("/");
      }
      setIsLoading(false);
    });
  }, [router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#222] text-white">로딩 중...</div>;
  }

  if (!user) {
    return null; // Redirecting
  }

  return <UserProfileViewer userId={user.id} />;
}

"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const onClick = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  return (
    <button onClick={onClick} style={{ textDecoration:"underline", background:"none", border:"none", cursor:"pointer" }}>
      Logout
    </button>
  );
}
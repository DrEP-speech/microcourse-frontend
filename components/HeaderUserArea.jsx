"use client";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import useUser from "../hooks/useUser";

export default function HeaderUserArea() {
  const { user, loading } = useUser();
  return (
    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
      <Link href="/dashboard">Dashboard</Link>
      {!loading && user ? <span style={{ opacity:0.8 }}>Hi, {user.name || user.fullName || user.email}</span> : null}
      <LogoutButton />
    </div>
  );
}
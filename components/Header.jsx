import Link from "next/link";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";
const HeaderUserArea = dynamic(() => import("./HeaderUserArea"), { ssr: false });

export default function Header() {
  const token = cookies().get("mc_token")?.value;
  return (
    <header style={{ display:"flex", justifyContent:"space-between", padding:"12px 16px", borderBottom:"1px solid #eee" }}>
      <Link href="/" style={{ fontWeight:600, textDecoration:"underline" }}>MicroCourse LMS</Link>
      <nav style={{ display:"flex", gap:16 }}>
        {token ? (
          <HeaderUserArea />
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
"use client";
import { useEffect, useState } from "react";
import { API_BASE, fetchJson } from "../../lib/api";

export default function DebugPage() {
  const [health, setHealth] = useState(null);
  const [badges, setBadges] = useState([]);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [token, setToken] = useState("");
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => { setToken(localStorage.getItem("jwt") || ""); }, []);
  useEffect(() => { (async () => {
    try { setHealth(await fetch(`${API_BASE}/healthz`).then(r=>r.json())); } catch {}
    try { const b = await fetchJson("/badges"); setBadges(b.data || b); } catch {}
  })(); }, []);

  async function login() {
    setErr("");
    try {
      const r = await fetchJson("/auth/login", { method:"POST", body:{ email, password } });
      const t = r?.data?.token || r?.token; if (!t) throw new Error("No token");
      setToken(t); localStorage.setItem("jwt", t);
    } catch(e){ setErr(e.message); }
  }
  async function signup() {
    setErr("");
    try {
      await fetchJson("/auth/signup", { method:"POST", body:{ email, password, name: email.split("@")[0]||"User" }});
      await login();
    } catch(e){ setErr(e.message); }
  }
  async function createBadge() {
    setErr("");
    try {
      await fetchJson("/badges", { method:"POST", token, body:{ key, name } });
      const b = await fetchJson("/badges"); setBadges(b.data || b);
      setKey(""); setName("");
    } catch(e){ setErr(e.message); }
  }

  return (
    <main style={{maxWidth:900,margin:"2rem auto",padding:16,fontFamily:"system-ui"}}>
      <h1>Debug</h1>
      <div style={{color:"#666"}}>API_BASE: {API_BASE}</div>

      <h2>Health</h2>
      <pre style={{background:"#fafafa",padding:12}}>{JSON.stringify(health,null,2)}</pre>

      <h2>Auth</h2>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <div style={{display:"flex",gap:8,margin:"8px 0"}}>
        <button onClick={login}>Login</button>
        <button onClick={signup}>Signup</button>
        <button onClick={()=>{localStorage.removeItem("jwt");setToken("");}}>Logout</button>
      </div>
      <div style={{fontSize:12,wordBreak:"break-all"}}><b>Token:</b> {token?token.slice(0,24)+"…":"—"}</div>

      <h2>Badges</h2>
      <div style={{display:"flex",gap:8,margin:"8px 0"}}>
        <input placeholder="key (unique)" value={key} onChange={e=>setKey(e.target.value)} />
        <input placeholder="name" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={createBadge} disabled={!token}>Create</button>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><th>_id</th><th>key</th><th>name</th></tr></thead>
        <tbody>
          {badges?.map?.(b=>(
            <tr key={b._id}><td>{b._id}</td><td>{b.key}</td><td>{b.name}</td></tr>
          )) || null}
          {(!badges || badges.length===0) && <tr><td colSpan="3">No badges</td></tr>}
        </tbody>
      </table>
      {err && <div style={{color:"#b00",marginTop:12}}>{err}</div>}
    </main>
  );
}


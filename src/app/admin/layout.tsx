"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ─── Auth Context ─── */
const AuthCtx = createContext<{ authenticated: boolean; logout: () => void }>({ authenticated: false, logout: () => {} });

export function useAdminAuth() { return useContext(AuthCtx); }

/* ─── Shared Styles ─── */
export const A = {
  bg: "#0d0d0d",
  card: "#1a1a1a",
  cardHover: "#222",
  border: "#2a2a2a",
  gold: "#c5a47e",
  goldDim: "#8a7a5b",
  textPrimary: "#f0f0f0",
  textMuted: "#888",
  danger: "#ef4444",
  success: "#22c55e",
  blue: "#3b82f6",
};

const NAV_ITEMS = [
  { href: "/admin", label: "總覽", icon: "fa-tachometer-alt" },
  { href: "/admin/plans", label: "方案管理", icon: "fa-clipboard-list" },
  { href: "/admin/addons", label: "加購管理", icon: "fa-cart-plus" },
  { href: "/admin/catalog", label: "品項清單", icon: "fa-database" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [logging, setLogging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/admin/auth").then((r) => r.json()).then((d) => setAuthenticated(d.authenticated)).catch(() => setAuthenticated(false));
  }, []);

  const login = async () => {
    setLogging(true); setLoginError("");
    const r = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const d = await r.json();
    if (d.status === "success") setAuthenticated(true);
    else setLoginError(d.message || "密碼錯誤");
    setLogging(false);
  };

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
  };

  // Loading
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: A.bg }}>
        <i className="fas fa-spinner fa-spin text-3xl" style={{ color: A.gold }} />
      </div>
    );
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: A.bg }}>
        <div className="w-full max-w-sm rounded-2xl p-8" style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${A.gold}15`, border: `1px solid ${A.gold}40` }}>
              <i className="fas fa-lock text-xl" style={{ color: A.gold }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: A.textPrimary, fontFamily: "'Noto Serif TC', serif" }}>RUINS BAR</h1>
            <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: A.goldDim }}>Admin Panel</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); login(); }}>
            <input type="password" placeholder="管理密碼" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus
              className="w-full mb-4 px-4 py-3 rounded-lg text-sm outline-none transition"
              style={{ backgroundColor: A.bg, border: `1px solid ${A.border}`, color: A.textPrimary }}
            />
            {loginError && <p className="text-xs mb-3 text-center" style={{ color: A.danger }}><i className="fas fa-exclamation-circle mr-1" />{loginError}</p>}
            <button type="submit" disabled={logging || !password}
              className="w-full py-3 rounded-lg font-bold text-sm transition disabled:opacity-40"
              style={{ backgroundColor: A.gold, color: "#0d0d0d" }}
            >
              {logging ? <><i className="fas fa-spinner fa-spin mr-2" />驗證中...</> : "登入"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated — sidebar + content
  return (
    <AuthCtx.Provider value={{ authenticated: true, logout }}>
      <div className="flex min-h-screen" style={{ backgroundColor: A.bg }}>
        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 md:hidden" style={{ backgroundColor: A.card, borderBottom: `1px solid ${A.border}` }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: A.textMuted }}><i className="fas fa-bars text-lg" /></button>
          <span className="font-bold text-sm" style={{ color: A.gold }}>RUINS ADMIN</span>
          <button onClick={logout} style={{ color: A.textMuted }}><i className="fas fa-sign-out-alt" /></button>
        </div>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`fixed md:sticky top-0 left-0 z-40 h-screen w-56 shrink-0 flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ backgroundColor: A.card, borderRight: `1px solid ${A.border}` }}
        >
          <div className="p-5 text-center" style={{ borderBottom: `1px solid ${A.border}` }}>
            <h2 className="font-bold tracking-widest text-sm" style={{ color: A.gold, fontFamily: "'Noto Serif TC', serif" }}>RUINS BAR</h2>
            <p className="text-xs mt-0.5" style={{ color: A.textMuted }}>後台管理系統</p>
          </div>
          <nav className="flex-1 py-4">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm transition-colors"
                  style={{ backgroundColor: active ? `${A.gold}15` : "transparent", color: active ? A.gold : A.textMuted, borderRight: active ? `3px solid ${A.gold}` : "3px solid transparent" }}
                >
                  <i className={`fas ${item.icon} w-5 text-center`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4" style={{ borderTop: `1px solid ${A.border}` }}>
            <Link href="/" className="flex items-center gap-2 text-xs mb-3 transition hover:opacity-80" style={{ color: A.textMuted }}>
              <i className="fas fa-external-link-alt" /> 前往前台
            </Link>
            <button onClick={logout} className="flex items-center gap-2 text-xs transition hover:opacity-80" style={{ color: A.danger }}>
              <i className="fas fa-sign-out-alt" /> 登出
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 pt-14 md:pt-0 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </div>
    </AuthCtx.Provider>
  );
}

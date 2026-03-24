"use client";

import { useState, useEffect, useCallback } from "react";
import { A } from "../layout";

interface Plan {
  id: string; slug: string; name: string; shortName: string; icon: string; accentColor: string;
  coverImage: string; galleryImages: string[]; tagline: string; description: string;
  highlights: string[]; priceWeekday: number; priceWeekend: number; priceUnit: string;
  leadDays: number; suitableFor: string; duration: string; includes: string[];
  allowedAddons: string[]; faq: { q: string; a: string }[];
}

interface CatalogItem {
  id: string; name: string; unit: string;
  pricePackage: number; priceDirect: number;
  weekendPricePackage?: number; weekendPriceDirect?: number;
  description: string; tags: string[];
}
interface CatalogCategory { id: string; name: string; icon: string; items: CatalogItem[]; }
interface CatalogData { categories: CatalogCategory[]; }

const EMPTY_PLAN: Plan = {
  id: "", slug: "", name: "", shortName: "", icon: "fas fa-star", accentColor: "#c5a47e",
  coverImage: "/images/gallery-vibe-1.jpg", galleryImages: [], tagline: "", description: "",
  highlights: [], priceWeekday: 0, priceWeekend: 0, priceUnit: "起",
  leadDays: 14, suitableFor: "10-50 人", duration: "3 小時", includes: [],
  allowedAddons: [], faq: [],
};

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [pickerTarget, setPickerTarget] = useState<"includes" | "allowedAddons" | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [plansRes, catRes] = await Promise.all([
      fetch("/api/admin/plans").then((r) => r.ok ? r.json() : []),
      fetch("/api/admin/catalog").then((r) => r.ok ? r.json() : null),
    ]);
    setPlans(plansRes);
    setCatalog(catRes);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const allCatalogItems = catalog?.categories.flatMap((c) => c.items.map((item) => ({ ...item, categoryName: c.name, categoryIcon: c.icon }))) || [];
  const findItem = (id: string) => allCatalogItems.find((i) => i.id === id);

  const savePlan = async () => {
    if (!editing) return;
    if (!editing.id || !editing.name) { showToast("❌ ID 和名稱必填"); return; }
    setSaving(true);
    const method = isNew ? "POST" : "PUT";
    const r = await fetch("/api/admin/plans", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    const d = await r.json();
    if (r.ok) { showToast("✅ 儲存成功"); setEditing(null); fetchData(); }
    else showToast(`❌ ${d.error}`);
    setSaving(false);
  };

  const deletePlan = async (id: string) => {
    if (!confirm(`確定刪除「${plans.find((p) => p.id === id)?.name}」？`)) return;
    const r = await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
    if (r.ok) { showToast("✅ 已刪除"); fetchData(); } else showToast("❌ 刪除失敗");
  };

  const openNew = () => { setEditing({ ...EMPTY_PLAN }); setIsNew(true); };
  const openEdit = (p: Plan) => { setEditing({ ...p }); setIsNew(false); };
  const closeModal = () => { setEditing(null); setIsNew(false); setPickerTarget(null); };

  const updateField = <K extends keyof Plan>(key: K, val: Plan[K]) => setEditing((e) => e ? { ...e, [key]: val } : e);
  const addHighlight = () => updateField("highlights", [...(editing?.highlights || []), ""]);
  const removeHighlight = (i: number) => updateField("highlights", (editing?.highlights || []).filter((_, j) => j !== i));
  const setHighlight = (i: number, v: string) => { const h = [...(editing?.highlights || [])]; h[i] = v; updateField("highlights", h); };
  const addFaq = () => updateField("faq", [...(editing?.faq || []), { q: "", a: "" }]);
  const removeFaq = (i: number) => updateField("faq", (editing?.faq || []).filter((_, j) => j !== i));
  const setFaq = (i: number, field: "q" | "a", v: string) => { const f = [...(editing?.faq || [])]; f[i] = { ...f[i], [field]: v }; updateField("faq", f); };

  /* ─── Toggle catalog item in includes or allowedAddons ─── */
  const toggleItem = (itemId: string) => {
    if (!editing || !pickerTarget) return;
    const arr = editing[pickerTarget];
    const newArr = arr.includes(itemId) ? arr.filter((id) => id !== itemId) : [...arr, itemId];
    updateField(pickerTarget, newArr);
  };

  /* ─── Calc included items total ─── */
  const calcIncludesTotal = (ids: string[], isWeekend: boolean) => {
    return ids.reduce((sum, id) => {
      const item = findItem(id);
      if (!item) return sum;
      return sum + (isWeekend ? (item.weekendPriceDirect ?? item.priceDirect) : item.priceDirect);
    }, 0);
  };

  const inputCls: React.CSSProperties = { width: "100%", backgroundColor: A.bg, border: `1px solid ${A.border}`, borderRadius: "0.5rem", padding: "0.6rem 0.75rem", color: A.textPrimary, fontSize: "0.85rem", outline: "none" };
  const labelCls: React.CSSProperties = { display: "block", fontSize: "0.7rem", fontWeight: 600, color: A.textMuted, marginBottom: "4px", textTransform: "uppercase" as const, letterSpacing: "0.5px" };

  return (
    <div className="p-6 md:p-10 relative">
      {toast && <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, color: A.textPrimary, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>{toast}</div>}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: A.textPrimary, fontFamily: "'Noto Serif TC', serif" }}>方案管理</h1>
          <p className="text-sm mt-1" style={{ color: A.textMuted }}>{plans.length} 個方案</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition hover:opacity-90" style={{ backgroundColor: A.gold, color: "#0d0d0d" }}>
          <i className="fas fa-plus" /> 新增方案
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: A.gold }} /></div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id} className="flex items-center gap-4 p-4 rounded-xl transition-colors group" style={{ backgroundColor: A.card, border: `1px solid ${A.border}` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${plan.accentColor}20` }}>
                <i className={plan.icon} style={{ color: plan.accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-sm truncate" style={{ color: A.textPrimary }}>{plan.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: A.bg, color: A.textMuted }}>{plan.id}</span>
                </div>
                <p className="text-xs truncate" style={{ color: A.textMuted }}>
                  {plan.suitableFor} · {plan.duration} · 平日 NT${plan.priceWeekday.toLocaleString()} / 假日 NT${plan.priceWeekend.toLocaleString()}
                  · 含 {plan.includes.length} 項 · 可加購 {plan.allowedAddons.length} 項
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 opacity-50 group-hover:opacity-100 transition">
                <button onClick={() => openEdit(plan)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: A.bg, color: A.gold }}><i className="fas fa-pen text-xs" /></button>
                <button onClick={() => deletePlan(plan.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: A.bg, color: A.danger }}><i className="fas fa-trash text-xs" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ Edit Modal ═══ */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" style={{ backgroundColor: "rgba(0,0,0,0.7)", paddingTop: "3rem", paddingBottom: "3rem" }}>
          <div className="w-full max-w-2xl mx-4 rounded-2xl" style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <h2 className="font-bold" style={{ color: A.gold }}>{isNew ? "新增方案" : `編輯：${editing.name}`}</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: A.textMuted }}><i className="fas fa-times" /></button>
            </div>

            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Basic */}
              <div>
                <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: A.gold }}>基本資訊</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><label style={labelCls}>方案 ID *</label><input value={editing.id} onChange={(e) => updateField("id", e.target.value)} disabled={!isNew} style={{ ...inputCls, opacity: isNew ? 1 : 0.5 }} /></div>
                  <div><label style={labelCls}>Slug (URL)</label><input value={editing.slug} onChange={(e) => updateField("slug", e.target.value)} style={inputCls} /></div>
                  <div><label style={labelCls}>方案全名 *</label><input value={editing.name} onChange={(e) => updateField("name", e.target.value)} style={inputCls} /></div>
                  <div><label style={labelCls}>簡短名稱</label><input value={editing.shortName} onChange={(e) => updateField("shortName", e.target.value)} style={inputCls} /></div>
                  <div><label style={labelCls}>Icon (FA class)</label><input value={editing.icon} onChange={(e) => updateField("icon", e.target.value)} style={inputCls} /></div>
                  <div><label style={labelCls}>主色</label><input type="color" value={editing.accentColor} onChange={(e) => updateField("accentColor", e.target.value)} style={{ ...inputCls, padding: "4px", height: "38px" }} /></div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: A.gold }}>圖片</h3>
                <div><label style={labelCls}>封面圖路徑</label><input value={editing.coverImage} onChange={(e) => updateField("coverImage", e.target.value)} placeholder="/images/xxx.jpg" style={inputCls} /></div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: A.gold }}>內容</h3>
                <div className="space-y-3">
                  <div><label style={labelCls}>一行標語</label><input value={editing.tagline} onChange={(e) => updateField("tagline", e.target.value)} style={inputCls} /></div>
                  <div><label style={labelCls}>完整描述</label><textarea value={editing.description} onChange={(e) => updateField("description", e.target.value)} rows={3} style={{ ...inputCls, resize: "vertical" as const }} /></div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: A.gold }}>價格與規格</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><label style={labelCls}>平日價</label><input type="number" value={editing.priceWeekday} onChange={(e) => updateField("priceWeekday", +e.target.value)} style={inputCls} /></div>
                  <div><label style={labelCls}>假日價</label><input type="number" value={editing.priceWeekend} onChange={(e) => updateField("priceWeekend", +e.target.value)} style={inputCls} /></div>
                  <div><label style={labelCls}>價格單位</label><input value={editing.priceUnit} onChange={(e) => updateField("priceUnit", e.target.value)} placeholder="起 / 依報價" style={inputCls} /></div>
                  <div><label style={labelCls}>最少提前天數</label><input type="number" value={editing.leadDays} onChange={(e) => updateField("leadDays", +e.target.value)} style={inputCls} /></div>
                  <div><label style={labelCls}>適合人數</label><input value={editing.suitableFor} onChange={(e) => updateField("suitableFor", e.target.value)} style={inputCls} /></div>
                  <div><label style={labelCls}>時長</label><input value={editing.duration} onChange={(e) => updateField("duration", e.target.value)} style={inputCls} /></div>
                </div>
                {/* Auto-calc hint */}
                {editing.includes.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg text-xs" style={{ backgroundColor: A.bg, border: `1px solid ${A.border}` }}>
                    <div className="flex justify-between" style={{ color: A.textMuted }}>
                      <span><i className="fas fa-calculator mr-1" />內含品項直購價合計</span>
                      <span>平日 <b style={{ color: A.gold }}>NT${calcIncludesTotal(editing.includes, false).toLocaleString()}</b> / 假日 <b style={{ color: A.gold }}>NT${calcIncludesTotal(editing.includes, true).toLocaleString()}</b></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Highlights */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: A.gold }}>方案亮點</h3>
                  <button onClick={addHighlight} className="text-xs flex items-center gap-1" style={{ color: A.gold }}><i className="fas fa-plus" /> 新增</button>
                </div>
                <div className="space-y-2">
                  {editing.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={h} onChange={(e) => setHighlight(i, e.target.value)} style={inputCls} />
                      <button onClick={() => removeHighlight(i)} className="shrink-0 w-7 h-7 rounded flex items-center justify-center" style={{ color: A.danger }}><i className="fas fa-times text-xs" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ═══ Includes — catalog item picker ═══ */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: A.gold }}>
                    <i className="fas fa-box-open mr-1" />套餐內含品項
                    <span className="font-normal ml-2" style={{ color: A.textMuted }}>({editing.includes.length} 項)</span>
                  </h3>
                  <button onClick={() => { setPickerTarget("includes"); setPickerSearch(""); }} className="text-xs flex items-center gap-1 px-3 py-1 rounded-full transition" style={{ color: "#0d0d0d", backgroundColor: A.gold }}>
                    <i className="fas fa-database" /> 從清單選取
                  </button>
                </div>
                {editing.includes.length === 0 ? (
                  <p className="text-xs py-3 text-center" style={{ color: A.textMuted }}>尚未選擇，點「從清單選取」加入</p>
                ) : (
                  <div className="space-y-1.5">
                    {editing.includes.map((id) => {
                      const item = findItem(id);
                      return (
                        <div key={id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: A.bg, border: `1px solid ${A.border}` }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs" style={{ color: "#22c55e" }}>✓</span>
                            <span className="text-sm truncate" style={{ color: A.textPrimary }}>{item?.name || id}</span>
                            {item && <span className="text-xs" style={{ color: A.textMuted }}>/{item.unit}</span>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {item && <span className="text-xs font-mono" style={{ color: A.gold }}>直購${item.priceDirect.toLocaleString()}</span>}
                            <button onClick={() => updateField("includes", editing.includes.filter((x) => x !== id))} style={{ color: A.danger }}><i className="fas fa-times text-xs" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ═══ AllowedAddons — catalog item picker ═══ */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: A.gold }}>
                    <i className="fas fa-cart-plus mr-1" />可加購品項
                    <span className="font-normal ml-2" style={{ color: A.textMuted }}>({editing.allowedAddons.length} 項)</span>
                  </h3>
                  <button onClick={() => { setPickerTarget("allowedAddons"); setPickerSearch(""); }} className="text-xs flex items-center gap-1 px-3 py-1 rounded-full transition" style={{ color: "#0d0d0d", backgroundColor: A.gold }}>
                    <i className="fas fa-database" /> 從清單選取
                  </button>
                </div>
                {editing.allowedAddons.length === 0 ? (
                  <p className="text-xs py-3 text-center" style={{ color: A.textMuted }}>尚未選擇</p>
                ) : (
                  <div className="space-y-1.5">
                    {editing.allowedAddons.map((id) => {
                      const item = findItem(id);
                      return (
                        <div key={id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: A.bg, border: `1px solid ${A.border}` }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs" style={{ color: "#f59e0b" }}>+</span>
                            <span className="text-sm truncate" style={{ color: A.textPrimary }}>{item?.name || id}</span>
                            {item && <span className="text-xs" style={{ color: A.textMuted }}>/{item.unit}</span>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {item && <span className="text-xs font-mono" style={{ color: A.textMuted }}>加購${item.pricePackage.toLocaleString()}</span>}
                            <button onClick={() => updateField("allowedAddons", editing.allowedAddons.filter((x) => x !== id))} style={{ color: A.danger }}><i className="fas fa-times text-xs" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* FAQ */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: A.gold }}>FAQ</h3>
                  <button onClick={addFaq} className="text-xs flex items-center gap-1" style={{ color: A.gold }}><i className="fas fa-plus" /> 新增</button>
                </div>
                <div className="space-y-3">
                  {editing.faq.map((f, i) => (
                    <div key={i} className="p-3 rounded-lg relative" style={{ backgroundColor: A.bg, border: `1px solid ${A.border}` }}>
                      <button onClick={() => removeFaq(i)} className="absolute top-2 right-2 w-6 h-6 rounded flex items-center justify-center" style={{ color: A.danger }}><i className="fas fa-times text-xs" /></button>
                      <div className="mb-2"><label style={labelCls}>問題</label><input value={f.q} onChange={(e) => setFaq(i, "q", e.target.value)} style={inputCls} /></div>
                      <div><label style={labelCls}>答案</label><textarea value={f.a} onChange={(e) => setFaq(i, "a", e.target.value)} rows={2} style={{ ...inputCls, resize: "vertical" as const }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${A.border}` }}>
              <button onClick={closeModal} className="px-5 py-2 rounded-lg text-sm" style={{ color: A.textMuted, border: `1px solid ${A.border}` }}>取消</button>
              <button onClick={savePlan} disabled={saving} className="px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-40" style={{ backgroundColor: A.gold, color: "#0d0d0d" }}>
                {saving ? <><i className="fas fa-spinner fa-spin mr-2" />儲存中...</> : <><i className="fas fa-save mr-2" />儲存</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Catalog Picker Overlay ═══ */}
      {pickerTarget && editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-xl mx-4 rounded-2xl" style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <h2 className="font-bold text-sm" style={{ color: A.gold }}>
                <i className="fas fa-database mr-2" />
                {pickerTarget === "includes" ? "選擇套餐內含品項" : "選擇可加購品項"}
              </h2>
              <button onClick={() => setPickerTarget(null)} style={{ color: A.textMuted }}><i className="fas fa-times" /></button>
            </div>

            {/* Search */}
            <div className="px-6 pt-4">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: A.textMuted }} />
                <input placeholder="搜尋品項..." value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-8" style={{ ...inputCls, backgroundColor: A.bg }} autoFocus />
              </div>
            </div>

            <div className="p-4 max-h-[55vh] overflow-y-auto space-y-4">
              {catalog?.categories.map((cat) => {
                const filtered = pickerSearch
                  ? cat.items.filter((i) => i.name.includes(pickerSearch) || i.id.includes(pickerSearch))
                  : cat.items;
                if (filtered.length === 0) return null;
                const selectedArr = editing[pickerTarget];

                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <span>{cat.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: A.textMuted }}>{cat.name}</span>
                    </div>
                    <div className="space-y-1">
                      {filtered.map((item) => {
                        const isSelected = selectedArr.includes(item.id);
                        return (
                          <button key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                            style={{
                              backgroundColor: isSelected ? `${A.gold}15` : "transparent",
                              border: `1px solid ${isSelected ? A.gold + "50" : "transparent"}`,
                            }}
                          >
                            {/* Checkbox */}
                            <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-xs" style={{
                              backgroundColor: isSelected ? A.gold : A.bg,
                              border: `1px solid ${isSelected ? A.gold : A.border}`,
                              color: isSelected ? "#0d0d0d" : "transparent",
                            }}>✓</span>

                            {/* Name */}
                            <span className="flex-1 min-w-0">
                              <span className="text-sm block truncate" style={{ color: A.textPrimary }}>{item.name}</span>
                              <span className="text-xs block" style={{ color: A.textMuted }}>{item.description}</span>
                            </span>

                            {/* Price */}
                            <span className="text-right shrink-0">
                              <span className="text-xs block font-mono" style={{ color: A.gold }}>加購 ${item.pricePackage.toLocaleString()}</span>
                              <span className="text-xs block font-mono" style={{ color: A.textMuted }}>直購 ${item.priceDirect.toLocaleString()}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${A.border}` }}>
              <span className="text-xs" style={{ color: A.textMuted }}>已選 {editing[pickerTarget].length} 項</span>
              <button onClick={() => setPickerTarget(null)} className="px-6 py-2 rounded-lg font-bold text-sm" style={{ backgroundColor: A.gold, color: "#0d0d0d" }}>
                <i className="fas fa-check mr-2" />完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

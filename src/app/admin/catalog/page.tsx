"use client";

import { useState, useEffect, useCallback } from "react";
import { A } from "../layout";

interface CatalogItem {
  id: string; name: string; unit: string;
  pricePackage: number; priceDirect: number;
  weekendPricePackage?: number; weekendPriceDirect?: number;
  description: string; tags: string[];
  counterMax?: number; minOrder?: number; group?: string;
}
interface CatalogCategory { id: string; name: string; icon: string; items: CatalogItem[]; }
interface CatalogData { categories: CatalogCategory[]; }

const EMPTY_ITEM: CatalogItem = { id: "", name: "", unit: "式", pricePackage: 0, priceDirect: 0, description: "", tags: ["addon"] };
const TAG_OPTIONS = [
  { id: "base", label: "基本設備", color: "#6366f1" },
  { id: "included", label: "套餐內含", color: "#22c55e" },
  { id: "addon", label: "加購項目", color: "#f59e0b" },
];

export default function AdminCatalog() {
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [editingItem, setEditingItem] = useState<{ catIdx: number; itemIdx: number; item: CatalogItem } | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/catalog");
    if (r.ok) setData(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const saveAll = async (newData: CatalogData) => {
    setSaving(true);
    const r = await fetch("/api/admin/catalog", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newData) });
    if (r.ok) { showToast("✅ 儲存成功"); setData(newData); } else showToast("❌ 儲存失敗");
    setSaving(false);
  };

  const openEdit = (catIdx: number, itemIdx: number) => {
    if (!data) return;
    setEditingItem({ catIdx, itemIdx, item: { ...data.categories[catIdx].items[itemIdx] } });
    setIsNewItem(false);
  };
  const openNew = (catIdx: number) => {
    setEditingItem({ catIdx, itemIdx: -1, item: { ...EMPTY_ITEM } });
    setIsNewItem(true);
  };
  const closeModal = () => { setEditingItem(null); setIsNewItem(false); };

  const saveItem = async () => {
    if (!data || !editingItem) return;
    if (!editingItem.item.id || !editingItem.item.name) { showToast("❌ ID 和名稱必填"); return; }
    const nd = JSON.parse(JSON.stringify(data)) as CatalogData;
    if (isNewItem) nd.categories[editingItem.catIdx].items.push(editingItem.item);
    else nd.categories[editingItem.catIdx].items[editingItem.itemIdx] = editingItem.item;
    await saveAll(nd);
    closeModal();
  };

  const deleteItem = async (catIdx: number, itemIdx: number) => {
    if (!data) return;
    if (!confirm(`確定刪除「${data.categories[catIdx].items[itemIdx].name}」？`)) return;
    const nd = JSON.parse(JSON.stringify(data)) as CatalogData;
    nd.categories[catIdx].items.splice(itemIdx, 1);
    await saveAll(nd);
  };

  const updateField = <K extends keyof CatalogItem>(key: K, val: CatalogItem[K]) => {
    setEditingItem((e) => e ? { ...e, item: { ...e.item, [key]: val } } : e);
  };

  const toggleTag = (tag: string) => {
    if (!editingItem) return;
    const tags = editingItem.item.tags.includes(tag)
      ? editingItem.item.tags.filter((t) => t !== tag)
      : [...editingItem.item.tags, tag];
    updateField("tags", tags);
  };

  const inputCls: React.CSSProperties = { width: "100%", backgroundColor: A.bg, border: `1px solid ${A.border}`, borderRadius: "0.5rem", padding: "0.6rem 0.75rem", color: A.textPrimary, fontSize: "0.85rem", outline: "none" };
  const labelCls: React.CSSProperties = { display: "block", fontSize: "0.7rem", fontWeight: 600, color: A.textMuted, marginBottom: "4px", textTransform: "uppercase" as const, letterSpacing: "0.5px" };

  const totalItems = data?.categories.reduce((s, c) => s + c.items.length, 0) || 0;

  return (
    <div className="p-6 md:p-10 relative">
      {toast && <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, color: A.textPrimary, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>{toast}</div>}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: A.textPrimary, fontFamily: "'Noto Serif TC', serif" }}>品項清單</h1>
          <p className="text-sm mt-1" style={{ color: A.textMuted }}>所有品項的套餐加購價 / 直購價一覽 · 共 {totalItems} 項</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: A.textMuted }} />
        <input placeholder="搜尋品項..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9" style={{ ...inputCls, backgroundColor: A.card }} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {TAG_OPTIONS.map((t) => (
          <span key={t.id} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} /> {t.label}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: A.gold }} /></div>
      ) : data && (
        <div className="space-y-6">
          {data.categories.map((cat, catIdx) => {
            const filtered = searchTerm
              ? cat.items.filter((i) => i.name.includes(searchTerm) || i.id.includes(searchTerm) || i.description.includes(searchTerm))
              : cat.items;
            if (searchTerm && filtered.length === 0) return null;

            return (
              <div key={cat.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: A.card, border: `1px solid ${A.border}` }}>
                <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${A.border}` }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <h3 className="font-bold text-sm" style={{ color: A.textPrimary }}>{cat.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: A.bg, color: A.textMuted }}>{filtered.length}</span>
                  </div>
                  <button onClick={() => openNew(catIdx)} className="text-xs flex items-center gap-1" style={{ color: A.gold }}><i className="fas fa-plus" /> 新增</button>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 px-5 py-2 text-xs font-bold" style={{ color: A.textMuted, borderBottom: `1px solid ${A.border}`, backgroundColor: `${A.bg}80` }}>
                  <div className="col-span-4">品項名稱</div>
                  <div className="col-span-1 text-center">單位</div>
                  <div className="col-span-2 text-right">套餐加購價</div>
                  <div className="col-span-2 text-right">直購價</div>
                  <div className="col-span-2 text-center">標籤</div>
                  <div className="col-span-1"></div>
                </div>

                {filtered.map((item, itemIdx) => {
                  const realIdx = cat.items.indexOf(item);
                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-2 px-5 py-2.5 items-center group transition-colors hover:bg-white/[0.02]" style={{ borderBottom: `1px solid ${A.border}` }}>
                      <div className="col-span-4 min-w-0">
                        <span className="text-sm font-medium block truncate" style={{ color: A.textPrimary }}>{item.name}</span>
                        <span className="text-xs block truncate" style={{ color: A.textMuted }}>{item.description}</span>
                      </div>
                      <div className="col-span-1 text-center text-xs" style={{ color: A.textMuted }}>{item.unit}</div>
                      <div className="col-span-2 text-right text-sm font-mono" style={{ color: item.pricePackage === 0 ? A.textMuted : A.gold }}>
                        {item.pricePackage === 0 ? "—" : `$${item.pricePackage.toLocaleString()}`}
                      </div>
                      <div className="col-span-2 text-right text-sm font-mono font-bold" style={{ color: A.textPrimary }}>
                        {item.priceDirect === 0 ? "—" : `$${item.priceDirect.toLocaleString()}`}
                      </div>
                      <div className="col-span-2 text-center flex flex-wrap justify-center gap-1">
                        {item.tags.map((t) => {
                          const tag = TAG_OPTIONS.find((o) => o.id === t);
                          return tag ? <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${tag.color}15`, color: tag.color }}>{tag.label.slice(0, 2)}</span> : null;
                        })}
                      </div>
                      <div className="col-span-1 flex items-center justify-end gap-1 opacity-30 group-hover:opacity-100 transition">
                        <button onClick={() => openEdit(catIdx, realIdx)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: A.gold }}><i className="fas fa-pen text-xs" /></button>
                        <button onClick={() => deleteItem(catIdx, realIdx)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: A.danger }}><i className="fas fa-trash text-xs" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Edit Modal ═══ */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-lg mx-4 rounded-2xl" style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <h2 className="font-bold" style={{ color: A.gold }}>{isNewItem ? "新增品項" : `編輯：${editingItem.item.name}`}</h2>
              <button onClick={closeModal} style={{ color: A.textMuted }}><i className="fas fa-times" /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div><label style={labelCls}>品項 ID *</label><input value={editingItem.item.id} onChange={(e) => updateField("id", e.target.value)} disabled={!isNewItem} style={{ ...inputCls, opacity: isNewItem ? 1 : 0.5 }} /></div>
                <div><label style={labelCls}>品項名稱 *</label><input value={editingItem.item.name} onChange={(e) => updateField("name", e.target.value)} style={inputCls} /></div>
              </div>
              <div><label style={labelCls}>描述</label><input value={editingItem.item.description} onChange={(e) => updateField("description", e.target.value)} style={inputCls} /></div>
              <div><label style={labelCls}>單位</label><input value={editingItem.item.unit} onChange={(e) => updateField("unit", e.target.value)} style={inputCls} /></div>

              {/* Pricing — the key feature */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: A.bg, border: `1px solid ${A.border}` }}>
                <h4 className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: A.gold }}>價格設定</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelCls}>🏷️ 套餐加購價 (平日)</label>
                    <input type="number" value={editingItem.item.pricePackage} onChange={(e) => updateField("pricePackage", +e.target.value)} style={inputCls} />
                  </div>
                  <div>
                    <label style={labelCls}>💰 直購價 (平日)</label>
                    <input type="number" value={editingItem.item.priceDirect} onChange={(e) => updateField("priceDirect", +e.target.value)} style={inputCls} />
                  </div>
                  <div>
                    <label style={labelCls}>🏷️ 套餐加購價 (假日)</label>
                    <input type="number" value={editingItem.item.weekendPricePackage ?? editingItem.item.pricePackage} onChange={(e) => updateField("weekendPricePackage", +e.target.value)} style={inputCls} />
                  </div>
                  <div>
                    <label style={labelCls}>💰 直購價 (假日)</label>
                    <input type="number" value={editingItem.item.weekendPriceDirect ?? editingItem.item.priceDirect} onChange={(e) => updateField("weekendPriceDirect", +e.target.value)} style={inputCls} />
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: A.textMuted }}>套餐加購價 = 搭配方案購買的優惠價 · 直購價 = 單獨購買</p>
              </div>

              {/* Tags */}
              <div>
                <label style={labelCls}>品項標籤</label>
                <div className="flex gap-2 mt-1">
                  {TAG_OPTIONS.map((t) => (
                    <button key={t.id} onClick={() => toggleTag(t.id)}
                      className="text-xs px-3 py-1.5 rounded-full transition"
                      style={{
                        backgroundColor: editingItem.item.tags.includes(t.id) ? `${t.color}25` : "transparent",
                        color: editingItem.item.tags.includes(t.id) ? t.color : A.textMuted,
                        border: `1px solid ${editingItem.item.tags.includes(t.id) ? t.color : A.border}`,
                      }}
                    >{t.label}</button>
                  ))}
                </div>
              </div>

              {/* Counter settings */}
              <div className="grid grid-cols-3 gap-3">
                <div><label style={labelCls}>計數上限</label><input type="number" value={editingItem.item.counterMax ?? ""} onChange={(e) => updateField("counterMax", e.target.value ? +e.target.value : undefined)} placeholder="無限" style={inputCls} /></div>
                <div><label style={labelCls}>最低數量</label><input type="number" value={editingItem.item.minOrder ?? ""} onChange={(e) => updateField("minOrder", e.target.value ? +e.target.value : undefined)} placeholder="0" style={inputCls} /></div>
                <div><label style={labelCls}>群組</label><input value={editingItem.item.group ?? ""} onChange={(e) => updateField("group", e.target.value || undefined)} placeholder="例: bartender" style={inputCls} /></div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${A.border}` }}>
              <button onClick={closeModal} className="px-5 py-2 rounded-lg text-sm" style={{ color: A.textMuted, border: `1px solid ${A.border}` }}>取消</button>
              <button onClick={saveItem} disabled={saving} className="px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-40" style={{ backgroundColor: A.gold, color: "#0d0d0d" }}>
                {saving ? <><i className="fas fa-spinner fa-spin mr-2" />儲存中...</> : <><i className="fas fa-save mr-2" />儲存</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

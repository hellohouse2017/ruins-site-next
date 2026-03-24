"use client";

import { useState, useEffect, useCallback } from "react";
import { A } from "../layout";

interface AddonItem {
  id: string; name: string; unit: string; priceWeekday: number; priceWeekend: number;
  type: "toggle" | "counter"; max?: number; minOrder?: number; description: string; group?: string;
}
interface AddonCategory { id: string; name: string; icon: string; items: AddonItem[]; }
interface AddonsData { categories: AddonCategory[]; }

const EMPTY_ITEM: AddonItem = { id: "", name: "", unit: "式", priceWeekday: 0, priceWeekend: 0, type: "toggle", description: "" };

export default function AdminAddons() {
  const [data, setData] = useState<AddonsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [editingItem, setEditingItem] = useState<{ catIdx: number; itemIdx: number; item: AddonItem } | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/addons");
    if (r.ok) setData(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const saveAll = async (newData: AddonsData) => {
    setSaving(true);
    const r = await fetch("/api/admin/addons", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newData) });
    if (r.ok) { showToast("✅ 儲存成功"); setData(newData); }
    else showToast("❌ 儲存失敗");
    setSaving(false);
  };

  const openEditItem = (catIdx: number, itemIdx: number) => {
    if (!data) return;
    setEditingItem({ catIdx, itemIdx, item: { ...data.categories[catIdx].items[itemIdx] } });
    setIsNewItem(false);
  };
  const openNewItem = (catIdx: number) => {
    setEditingItem({ catIdx, itemIdx: -1, item: { ...EMPTY_ITEM } });
    setIsNewItem(true);
  };
  const closeModal = () => { setEditingItem(null); setIsNewItem(false); };

  const saveItem = async () => {
    if (!data || !editingItem) return;
    if (!editingItem.item.id || !editingItem.item.name) { showToast("❌ ID 和名稱必填"); return; }
    const newData = JSON.parse(JSON.stringify(data)) as AddonsData;
    if (isNewItem) {
      newData.categories[editingItem.catIdx].items.push(editingItem.item);
    } else {
      newData.categories[editingItem.catIdx].items[editingItem.itemIdx] = editingItem.item;
    }
    await saveAll(newData);
    closeModal();
  };

  const deleteItem = async (catIdx: number, itemIdx: number) => {
    if (!data) return;
    const item = data.categories[catIdx].items[itemIdx];
    if (!confirm(`確定刪除「${item.name}」？`)) return;
    const newData = JSON.parse(JSON.stringify(data)) as AddonsData;
    newData.categories[catIdx].items.splice(itemIdx, 1);
    await saveAll(newData);
  };

  const updateItemField = <K extends keyof AddonItem>(key: K, val: AddonItem[K]) => {
    setEditingItem((e) => e ? { ...e, item: { ...e.item, [key]: val } } : e);
  };

  const inputCls: React.CSSProperties = { width: "100%", backgroundColor: A.bg, border: `1px solid ${A.border}`, borderRadius: "0.5rem", padding: "0.6rem 0.75rem", color: A.textPrimary, fontSize: "0.85rem", outline: "none" };
  const labelCls: React.CSSProperties = { display: "block", fontSize: "0.7rem", fontWeight: 600, color: A.textMuted, marginBottom: "4px", textTransform: "uppercase" as const, letterSpacing: "0.5px" };

  return (
    <div className="p-6 md:p-10 relative">
      {toast && <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, color: A.textPrimary, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>{toast}</div>}

      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: A.textPrimary, fontFamily: "'Noto Serif TC', serif" }}>加購管理</h1>
        <p className="text-sm mt-1" style={{ color: A.textMuted }}>管理所有加購項目的名稱、價格、設定</p>
      </div>

      {loading ? (
        <div className="text-center py-20"><i className="fas fa-spinner fa-spin text-2xl" style={{ color: A.gold }} /></div>
      ) : data && (
        <div className="space-y-6">
          {data.categories.map((cat, catIdx) => (
            <div key={cat.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: A.card, border: `1px solid ${A.border}` }}>
              {/* Category header */}
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${A.border}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <h3 className="font-bold text-sm" style={{ color: A.textPrimary }}>{cat.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: A.bg, color: A.textMuted }}>{cat.items.length}</span>
                </div>
                <button onClick={() => openNewItem(catIdx)} className="text-xs flex items-center gap-1 transition" style={{ color: A.gold }}>
                  <i className="fas fa-plus" /> 新增
                </button>
              </div>

              {/* Items */}
              {cat.items.length === 0 ? (
                <div className="p-5 text-center text-sm" style={{ color: A.textMuted }}>尚無項目</div>
              ) : (
                <div>
                  {cat.items.map((item, itemIdx) => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-3 group transition-colors" style={{ borderBottom: `1px solid ${A.border}` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm" style={{ color: A.textPrimary }}>{item.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: item.type === "counter" ? `${A.blue}20` : `${A.gold}20`, color: item.type === "counter" ? A.blue : A.gold }}>
                            {item.type === "counter" ? "計數" : "開關"}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: A.textMuted }}>
                          NT${item.priceWeekday.toLocaleString()}/{item.unit}
                          {item.type === "counter" && item.max ? ` · 上限 ${item.max}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 opacity-40 group-hover:opacity-100 transition">
                        <button onClick={() => openEditItem(catIdx, itemIdx)} className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: A.bg, color: A.gold }}><i className="fas fa-pen text-xs" /></button>
                        <button onClick={() => deleteItem(catIdx, itemIdx)} className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: A.bg, color: A.danger }}><i className="fas fa-trash text-xs" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ Edit Modal ═══ */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md mx-4 rounded-2xl" style={{ backgroundColor: A.card, border: `1px solid ${A.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${A.border}` }}>
              <h2 className="font-bold" style={{ color: A.gold }}>{isNewItem ? "新增加購項目" : `編輯：${editingItem.item.name}`}</h2>
              <button onClick={closeModal} style={{ color: A.textMuted }}><i className="fas fa-times" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label style={labelCls}>ID *</label><input value={editingItem.item.id} onChange={(e) => updateItemField("id", e.target.value)} disabled={!isNewItem} style={{ ...inputCls, opacity: isNewItem ? 1 : 0.5 }} /></div>
                <div><label style={labelCls}>名稱 *</label><input value={editingItem.item.name} onChange={(e) => updateItemField("name", e.target.value)} style={inputCls} /></div>
              </div>
              <div><label style={labelCls}>描述</label><input value={editingItem.item.description} onChange={(e) => updateItemField("description", e.target.value)} style={inputCls} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label style={labelCls}>單位</label><input value={editingItem.item.unit} onChange={(e) => updateItemField("unit", e.target.value)} style={inputCls} /></div>
                <div><label style={labelCls}>平日價</label><input type="number" value={editingItem.item.priceWeekday} onChange={(e) => updateItemField("priceWeekday", +e.target.value)} style={inputCls} /></div>
                <div><label style={labelCls}>假日價</label><input type="number" value={editingItem.item.priceWeekend} onChange={(e) => updateItemField("priceWeekend", +e.target.value)} style={inputCls} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label style={labelCls}>類型</label>
                  <select value={editingItem.item.type} onChange={(e) => updateItemField("type", e.target.value as "toggle" | "counter")} style={inputCls}>
                    <option value="toggle">開關 (toggle)</option>
                    <option value="counter">計數 (counter)</option>
                  </select>
                </div>
                {editingItem.item.type === "counter" && (
                  <>
                    <div><label style={labelCls}>上限</label><input type="number" value={editingItem.item.max || 0} onChange={(e) => updateItemField("max", +e.target.value)} style={inputCls} /></div>
                    <div><label style={labelCls}>最少數量</label><input type="number" value={editingItem.item.minOrder || 0} onChange={(e) => updateItemField("minOrder", +e.target.value)} style={inputCls} /></div>
                  </>
                )}
                <div><label style={labelCls}>群組 (選填)</label><input value={editingItem.item.group || ""} onChange={(e) => updateItemField("group", e.target.value || undefined)} style={inputCls} placeholder="例: bartender" /></div>
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { A } from "../ui";
import type {
  AddonCatalogConfig,
  AddonItemConfig,
  BundleCatalogConfig,
  BundleConfig,
  ScenarioConfig,
} from "@/types/v2";

interface EditingBundleState {
  originalId: string;
  bundle: BundleConfig;
}

const EMPTY_BUNDLE: BundleConfig = {
  id: "",
  name: "",
  scenarioId: "proposal",
  badge: "",
  summary: "",
  items: [],
  listPrice: 0,
  bundlePrice: 0,
  savings: 0,
  active: true,
  sortOrder: 10,
};

function formatCurrency(value: number) {
  return `NT$${value.toLocaleString()}`;
}

export default function AdminBundlesPage() {
  const [catalog, setCatalog] = useState<BundleCatalogConfig | null>(null);
  const [addons, setAddons] = useState<AddonCatalogConfig | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<EditingBundleState | null>(null);
  const [isNewBundle, setIsNewBundle] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [bundlesRes, addonsRes, scenariosRes] = await Promise.all([
      fetch("/api/admin/bundles").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/admin/addons").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/admin/scenarios").then((res) => (res.ok ? res.json() : [])),
    ]);

    setCatalog(bundlesRes);
    setAddons(addonsRes);
    setScenarios(Array.isArray(scenariosRes) ? scenariosRes : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const allAddons = useMemo(
    () => addons?.categories.flatMap((category) => category.items) ?? [],
    [addons]
  );

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const saveAll = async (nextCatalog: BundleCatalogConfig) => {
    setSaving(true);
    const response = await fetch("/api/admin/bundles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextCatalog),
    });

    if (response.ok) {
      setCatalog(nextCatalog);
      showToast("✅ 儲存成功");
    } else {
      showToast("❌ 儲存失敗");
    }

    setSaving(false);
  };

  const openNew = () => {
    const fallbackScenario = scenarios[0]?.id ?? "proposal";
    setEditing({
      originalId: "",
      bundle: {
        ...EMPTY_BUNDLE,
        scenarioId: fallbackScenario,
      },
    });
    setIsNewBundle(true);
  };

  const openEdit = (bundle: BundleConfig) => {
    setEditing({
      originalId: bundle.id,
      bundle: {
        ...bundle,
        items: bundle.items.map((item) => ({ ...item })),
      },
    });
    setIsNewBundle(false);
  };

  const closeModal = () => {
    setEditing(null);
    setIsNewBundle(false);
  };

  const updateField = <K extends keyof BundleConfig>(
    key: K,
    value: BundleConfig[K]
  ) => {
    setEditing((current) =>
      current
        ? {
            ...current,
            bundle: {
              ...current.bundle,
              [key]: value,
            },
          }
        : current
    );
  };

  const updateItem = (index: number, field: "addonId" | "qty", value: string | number) => {
    setEditing((current) => {
      if (!current) return current;
      const items = [...current.bundle.items];
      items[index] = {
        ...items[index],
        [field]:
          field === "qty" ? Number(value) : value,
      };

      return {
        ...current,
        bundle: {
          ...current.bundle,
          items,
        },
      };
    });
  };

  const addBundleItem = () => {
    const availableAddons = filteredAddonsForScenario(
      editing?.bundle.scenarioId ?? "proposal",
      allAddons
    );
    const fallbackAddonId = availableAddons[0]?.id ?? allAddons[0]?.id ?? "";

    setEditing((current) =>
      current
        ? {
            ...current,
            bundle: {
              ...current.bundle,
              items: [
                ...current.bundle.items,
                { addonId: fallbackAddonId, qty: 1 },
              ],
            },
          }
        : current
    );
  };

  const removeBundleItem = (index: number) => {
    setEditing((current) =>
      current
        ? {
            ...current,
            bundle: {
              ...current.bundle,
              items: current.bundle.items.filter((_, itemIndex) => itemIndex !== index),
            },
          }
        : current
    );
  };

  const saveBundle = async () => {
    if (!catalog || !editing) return;

    if (!editing.bundle.id.trim() || !editing.bundle.name.trim()) {
      showToast("❌ 組合 ID 和名稱必填");
      return;
    }

    if (editing.bundle.items.length === 0) {
      showToast("❌ 至少要加入一個加購項目");
      return;
    }

    const duplicate = catalog.bundles.some(
      (bundle) =>
        bundle.id === editing.bundle.id &&
        (isNewBundle || bundle.id !== editing.originalId)
    );

    if (duplicate) {
      showToast("❌ 組合 ID 已存在");
      return;
    }

    const normalizedBundle: BundleConfig = {
      ...editing.bundle,
      id: editing.bundle.id.trim(),
      name: editing.bundle.name.trim(),
      badge: editing.bundle.badge.trim(),
      summary: editing.bundle.summary.trim(),
      listPrice: Number(editing.bundle.listPrice) || 0,
      bundlePrice: Number(editing.bundle.bundlePrice) || 0,
      savings: Math.max(
        0,
        (Number(editing.bundle.listPrice) || 0) -
          (Number(editing.bundle.bundlePrice) || 0)
      ),
      sortOrder: Number(editing.bundle.sortOrder) || 0,
      items: editing.bundle.items.map((item) => ({
        addonId: item.addonId,
        qty: Math.max(1, Number(item.qty) || 1),
      })),
    };

    const nextCatalog: BundleCatalogConfig = {
      bundles: isNewBundle
        ? [...catalog.bundles, normalizedBundle]
        : catalog.bundles.map((bundle) =>
            bundle.id === editing.originalId ? normalizedBundle : bundle
          ),
    };

    nextCatalog.bundles.sort((a, b) => a.sortOrder - b.sortOrder);

    await saveAll(nextCatalog);
    closeModal();
  };

  const deleteBundle = async (bundleId: string) => {
    if (!catalog) return;
    const target = catalog.bundles.find((bundle) => bundle.id === bundleId);
    if (!target || !confirm(`確定刪除「${target.name}」？`)) return;

    const nextCatalog: BundleCatalogConfig = {
      bundles: catalog.bundles.filter((bundle) => bundle.id !== bundleId),
    };

    await saveAll(nextCatalog);
  };

  const bundleCount = catalog?.bundles.length ?? 0;
  const activeBundleCount =
    catalog?.bundles.filter((bundle) => bundle.active).length ?? 0;

  const inputCls: React.CSSProperties = {
    width: "100%",
    backgroundColor: A.bg,
    border: `1px solid ${A.border}`,
    borderRadius: "0.5rem",
    padding: "0.6rem 0.75rem",
    color: A.textPrimary,
    fontSize: "0.85rem",
    outline: "none",
  };

  const labelCls: React.CSSProperties = {
    display: "block",
    fontSize: "0.7rem",
    fontWeight: 600,
    color: A.textMuted,
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  return (
    <div className="p-6 md:p-10 relative">
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: A.card,
            border: `1px solid ${A.border}`,
            color: A.textPrimary,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          {toast}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: A.textPrimary, fontFamily: "'Noto Serif TC', serif" }}
          >
            組合管理
          </h1>
          <p className="text-sm mt-1" style={{ color: A.textMuted }}>
            推薦組合是導購層，不是底層售價真相。單品價格仍以 addons 為準。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: A.card, border: `1px solid ${A.border}` }}
          >
            <div className="text-xs" style={{ color: A.textMuted }}>
              啟用 / 全部
            </div>
            <div className="text-xl font-bold" style={{ color: A.textPrimary }}>
              {activeBundleCount} / {bundleCount}
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition hover:opacity-90"
            style={{ backgroundColor: A.gold, color: "#0d0d0d" }}
          >
            <i className="fas fa-plus" /> 新增組合
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <i
            className="fas fa-spinner fa-spin text-2xl"
            style={{ color: A.gold }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {catalog?.bundles.map((bundle) => {
            const scenarioName =
              scenarios.find((scenario) => scenario.id === bundle.scenarioId)?.name ??
              bundle.scenarioId;

            return (
              <div
                key={bundle.id}
                className="rounded-xl p-6"
                style={{
                  backgroundColor: A.card,
                  border: `1px solid ${A.border}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: A.bg, color: A.gold }}
                      >
                        {scenarioName}
                      </span>
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: bundle.active
                            ? "rgba(34,197,94,0.18)"
                            : "rgba(239,68,68,0.18)",
                          color: bundle.active ? A.success : A.danger,
                        }}
                      >
                        {bundle.active ? "啟用" : "停用"}
                      </span>
                    </div>
                    <h2 className="font-bold text-lg" style={{ color: A.textPrimary }}>
                      {bundle.name}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: A.textMuted }}>
                      {bundle.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(bundle)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: A.bg, color: A.gold }}
                    >
                      <i className="fas fa-pen text-xs" />
                    </button>
                    <button
                      onClick={() => deleteBundle(bundle.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: A.bg, color: A.danger }}
                    >
                      <i className="fas fa-trash text-xs" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {bundle.items.map((item) => {
                    const addon = allAddons.find(
                      (candidate) => candidate.id === item.addonId
                    );
                    return (
                      <div
                        key={`${bundle.id}-${item.addonId}`}
                        className="flex items-center justify-between text-sm"
                        style={{ color: A.textMuted }}
                      >
                        <span>{addon?.name ?? item.addonId}</span>
                        <span>x {item.qty}</span>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="flex items-end justify-between pt-4"
                  style={{ borderTop: `1px solid ${A.border}` }}
                >
                  <div>
                    <div className="text-xs" style={{ color: A.textMuted }}>
                      原價 {formatCurrency(bundle.listPrice)}
                    </div>
                    <div className="text-xl font-bold" style={{ color: A.textPrimary }}>
                      {formatCurrency(bundle.bundlePrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs" style={{ color: A.textMuted }}>
                      組合優惠
                    </div>
                    <div className="font-bold" style={{ color: "#ec4899" }}>
                      {formatCurrency(bundle.savings)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <BundleModal
          editing={editing}
          scenarios={scenarios}
          allAddons={allAddons}
          inputCls={inputCls}
          labelCls={labelCls}
          saving={saving}
          closeModal={closeModal}
          updateField={updateField}
          updateItem={updateItem}
          addBundleItem={addBundleItem}
          removeBundleItem={removeBundleItem}
          saveBundle={saveBundle}
        />
      )}
    </div>
  );
}

function filteredAddonsForScenario(
  scenarioId: ScenarioConfig["id"],
  allAddons: AddonItemConfig[]
) {
  return allAddons.filter((addon) => addon.scenarioTags.includes(scenarioId));
}

function BundleModal({
  editing,
  scenarios,
  allAddons,
  inputCls,
  labelCls,
  saving,
  closeModal,
  updateField,
  updateItem,
  addBundleItem,
  removeBundleItem,
  saveBundle,
}: {
  editing: EditingBundleState;
  scenarios: ScenarioConfig[];
  allAddons: AddonItemConfig[];
  inputCls: React.CSSProperties;
  labelCls: React.CSSProperties;
  saving: boolean;
  closeModal: () => void;
  updateField: <K extends keyof BundleConfig>(key: K, value: BundleConfig[K]) => void;
  updateItem: (index: number, field: "addonId" | "qty", value: string | number) => void;
  addBundleItem: () => void;
  removeBundleItem: (index: number) => void;
  saveBundle: () => void;
}) {
  const availableAddons =
    filteredAddonsForScenario(editing.bundle.scenarioId, allAddons).length > 0
      ? filteredAddonsForScenario(editing.bundle.scenarioId, allAddons)
      : allAddons;

  const estimatedListPrice = editing.bundle.items.reduce((sum, item) => {
    const addon = allAddons.find((candidate) => candidate.id === item.addonId);
    return sum + (addon?.priceWeekday ?? 0) * item.qty;
  }, 0);

  const savings = Math.max(0, editing.bundle.listPrice - editing.bundle.bundlePrice);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="w-full max-w-3xl mx-4 rounded-2xl"
        style={{
          backgroundColor: A.card,
          border: `1px solid ${A.border}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${A.border}` }}
        >
          <h2 className="font-bold" style={{ color: A.gold }}>
            {editing.originalId ? `編輯組合：${editing.bundle.name}` : "新增組合"}
          </h2>
          <button onClick={closeModal} style={{ color: A.textMuted }}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelCls}>組合 ID</label>
              <input
                value={editing.bundle.id}
                onChange={(event) => updateField("id", event.target.value)}
                style={inputCls}
              />
            </div>
            <div>
              <label style={labelCls}>情境</label>
              <select
                value={editing.bundle.scenarioId}
                onChange={(event) =>
                  updateField(
                    "scenarioId",
                    event.target.value as BundleConfig["scenarioId"]
                  )
                }
                style={inputCls}
              >
                {scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelCls}>組合名稱</label>
              <input
                value={editing.bundle.name}
                onChange={(event) => updateField("name", event.target.value)}
                style={inputCls}
              />
            </div>
            <div>
              <label style={labelCls}>Badge</label>
              <input
                value={editing.bundle.badge}
                onChange={(event) => updateField("badge", event.target.value)}
                style={inputCls}
              />
            </div>
          </div>

          <div>
            <label style={labelCls}>摘要</label>
            <textarea
              value={editing.bundle.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              rows={3}
              style={{ ...inputCls, resize: "vertical" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelCls}>顯示原價</label>
              <input
                type="number"
                value={editing.bundle.listPrice}
                onChange={(event) =>
                  updateField("listPrice", Number(event.target.value))
                }
                style={inputCls}
              />
            </div>
            <div>
              <label style={labelCls}>組合價</label>
              <input
                type="number"
                value={editing.bundle.bundlePrice}
                onChange={(event) =>
                  updateField("bundlePrice", Number(event.target.value))
                }
                style={inputCls}
              />
            </div>
          </div>

          <div
            className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: A.bg, border: `1px solid ${A.border}` }}
          >
            <div className="flex flex-wrap gap-4" style={{ color: A.textMuted }}>
              <span>估算單買總價：{formatCurrency(estimatedListPrice)}</span>
              <span>目前顯示原價：{formatCurrency(editing.bundle.listPrice)}</span>
              <span>組合優惠：{formatCurrency(savings)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label style={labelCls}>排序</label>
              <input
                type="number"
                value={editing.bundle.sortOrder}
                onChange={(event) =>
                  updateField("sortOrder", Number(event.target.value))
                }
                style={inputCls}
              />
            </div>
            <label
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{
                backgroundColor: A.bg,
                border: `1px solid ${A.border}`,
                color: A.textPrimary,
              }}
            >
              <span className="text-sm">啟用</span>
              <input
                type="checkbox"
                checked={editing.bundle.active}
                onChange={(event) => updateField("active", event.target.checked)}
              />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: A.gold }}>
                組合內容
              </h3>
              <button
                type="button"
                onClick={addBundleItem}
                className="text-xs flex items-center gap-1"
                style={{ color: A.gold }}
              >
                <i className="fas fa-plus" /> 新增項目
              </button>
            </div>

            <div className="space-y-3">
              {editing.bundle.items.map((item, index) => (
                <div
                  key={`${item.addonId}-${index}`}
                  className="grid grid-cols-[1fr,120px,48px] gap-3 items-end"
                >
                  <div>
                    <label style={labelCls}>加購項目</label>
                    <select
                      value={item.addonId}
                      onChange={(event) =>
                        updateItem(index, "addonId", event.target.value)
                      }
                      style={inputCls}
                    >
                      {availableAddons.map((addon) => (
                        <option key={addon.id} value={addon.id}>
                          {addon.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelCls}>數量</label>
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(event) =>
                        updateItem(index, "qty", Number(event.target.value))
                      }
                      style={inputCls}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBundleItem(index)}
                    className="w-12 h-11 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: A.bg, color: A.danger }}
                  >
                    <i className="fas fa-trash text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: `1px solid ${A.border}` }}
        >
          <button
            onClick={closeModal}
            className="px-5 py-2 rounded-lg text-sm"
            style={{ color: A.textMuted, border: `1px solid ${A.border}` }}
          >
            取消
          </button>
          <button
            onClick={saveBundle}
            disabled={saving}
            className="px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-40"
            style={{ backgroundColor: A.gold, color: "#0d0d0d" }}
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2" />
                儲存中...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2" />
                儲存
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

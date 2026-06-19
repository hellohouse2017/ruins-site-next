"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { A } from "../ui";
import type {
  AddonCatalogConfig,
  AddonCategoryConfig,
  AddonItemConfig,
  ScenarioConfig,
} from "@/types/v2";

interface EditingItemState {
  originalCategoryId: string;
  categoryId: string;
  itemIndex: number;
  item: AddonItemConfig;
}

const EMPTY_ITEM: AddonItemConfig = {
  id: "",
  name: "",
  unit: "式",
  priceWeekday: 0,
  priceWeekend: 0,
  type: "toggle",
  description: "",
  scenarioTags: [],
  popular: false,
  active: true,
  sortOrder: 10,
};

export default function AdminAddonsPage() {
  const [data, setData] = useState<AddonCatalogConfig | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState<EditingItemState | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [addonsRes, scenariosRes] = await Promise.all([
      fetch("/api/admin/addons").then((res) => (res.ok ? res.json() : null)),
      fetch("/api/admin/scenarios").then((res) => (res.ok ? res.json() : [])),
    ]);

    setData(addonsRes);
    setScenarios(Array.isArray(scenariosRes) ? scenariosRes : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const saveAll = async (nextData: AddonCatalogConfig) => {
    setSaving(true);
    const response = await fetch("/api/admin/addons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextData),
    });

    if (response.ok) {
      setData(nextData);
      showToast("✅ 儲存成功");
    } else {
      showToast("❌ 儲存失敗");
    }

    setSaving(false);
  };

  const openNewItem = (categoryId: string) => {
    setEditing({
      originalCategoryId: categoryId,
      categoryId,
      itemIndex: -1,
      item: {
        ...EMPTY_ITEM,
        scenarioTags: scenarios.length > 0 ? [scenarios[0].id] : [],
      },
    });
    setIsNewItem(true);
  };

  const openEditItem = (
    categoryId: string,
    itemIndex: number,
    item: AddonItemConfig
  ) => {
    setEditing({
      originalCategoryId: categoryId,
      categoryId,
      itemIndex,
      item: { ...item, scenarioTags: [...item.scenarioTags] },
    });
    setIsNewItem(false);
  };

  const closeModal = () => {
    setEditing(null);
    setIsNewItem(false);
  };

  const updateItemField = <K extends keyof AddonItemConfig>(
    key: K,
    value: AddonItemConfig[K]
  ) => {
    setEditing((current) =>
      current
        ? {
            ...current,
            item: {
              ...current.item,
              [key]: value,
            },
          }
        : current
    );
  };

  const updateCategoryId = (categoryId: string) => {
    setEditing((current) => (current ? { ...current, categoryId } : current));
  };

  const toggleScenarioTag = (scenarioId: ScenarioConfig["id"]) => {
    if (!editing) return;

    const scenarioTags = editing.item.scenarioTags.includes(scenarioId)
      ? editing.item.scenarioTags.filter((id) => id !== scenarioId)
      : [...editing.item.scenarioTags, scenarioId];

    updateItemField("scenarioTags", scenarioTags);
  };

  const saveItem = async () => {
    if (!data || !editing) return;

    if (!editing.item.id || !editing.item.name) {
      showToast("❌ ID 和名稱必填");
      return;
    }

    if (editing.item.scenarioTags.length === 0) {
      showToast("❌ 至少要指定一個適用情境");
      return;
    }

    const duplicate = data.categories.some((category) =>
      category.items.some(
        (item, index) =>
          item.id === editing.item.id &&
          !(
            !isNewItem &&
            category.id === editing.originalCategoryId &&
            index === editing.itemIndex
          )
      )
    );

    if (duplicate) {
      showToast("❌ 加購 ID 已存在");
      return;
    }

    const nextData: AddonCatalogConfig = {
      categories: data.categories.map((category) => ({
        ...category,
        items: [...category.items],
      })),
    };

    const sourceCategory = nextData.categories.find(
      (category) => category.id === editing.originalCategoryId
    );
    const targetCategory = nextData.categories.find(
      (category) => category.id === editing.categoryId
    );

    if (!targetCategory) {
      showToast("❌ 找不到目標分類");
      return;
    }

    if (!isNewItem && sourceCategory) {
      sourceCategory.items.splice(editing.itemIndex, 1);
    }

    targetCategory.items.push({
      ...editing.item,
      scenarioTags: [...editing.item.scenarioTags],
      sortOrder: Number(editing.item.sortOrder) || 0,
      max:
        editing.item.type === "counter" && editing.item.max !== undefined
          ? Number(editing.item.max)
          : undefined,
      minOrder:
        editing.item.type === "counter" && editing.item.minOrder !== undefined
          ? Number(editing.item.minOrder)
          : undefined,
      group: editing.item.group?.trim() || undefined,
    });

    nextData.categories.forEach((category) => {
      category.items.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    await saveAll(nextData);
    closeModal();
  };

  const deleteItem = async (categoryId: string, itemId: string) => {
    if (!data) return;

    const category = data.categories.find((item) => item.id === categoryId);
    const item = category?.items.find((candidate) => candidate.id === itemId);

    if (!item || !confirm(`確定刪除「${item.name}」？`)) return;

    const nextData: AddonCatalogConfig = {
      categories: data.categories.map((category) => ({
        ...category,
        items:
          category.id === categoryId
            ? category.items.filter((candidate) => candidate.id !== itemId)
            : [...category.items],
      })),
    };

    await saveAll(nextData);
  };

  const filteredCategories = useMemo(() => {
    if (!data) return [];

    const keyword = searchTerm.trim();

    return data.categories
      .map((category) => ({
        ...category,
        items: keyword
          ? category.items.filter(
              (item) =>
                item.name.includes(keyword) ||
                item.id.includes(keyword) ||
                item.description.includes(keyword)
            )
          : category.items,
      }))
      .filter((category) => category.items.length > 0 || !keyword);
  }, [data, searchTerm]);

  const totalItems =
    data?.categories.reduce((sum, category) => sum + category.items.length, 0) ||
    0;

  const activeItems =
    data?.categories.reduce(
      (sum, category) =>
        sum + category.items.filter((item) => item.active).length,
      0
    ) || 0;

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

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: A.textPrimary, fontFamily: "'Noto Serif TC', serif" }}
          >
            加購管理
          </h1>
          <p className="text-sm mt-1" style={{ color: A.textMuted }}>
            v2 單品真相來源，共 {totalItems} 項，其中 {activeItems} 項啟用中
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: A.card, border: `1px solid ${A.border}` }}
          >
            <div className="text-xs" style={{ color: A.textMuted }}>
              類別數
            </div>
            <div className="text-xl font-bold" style={{ color: A.textPrimary }}>
              {data?.categories.length ?? "—"}
            </div>
          </div>
          <div
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: A.card, border: `1px solid ${A.border}` }}
          >
            <div className="text-xs" style={{ color: A.textMuted }}>
              熱門加購
            </div>
            <div className="text-xl font-bold" style={{ color: A.textPrimary }}>
              {data?.categories.reduce(
                (sum, category) =>
                  sum + category.items.filter((item) => item.popular).length,
                0
              ) ?? "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <i
          className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: A.textMuted }}
        />
        <input
          placeholder="搜尋加購名稱 / ID / 描述..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full pl-9"
          style={{ ...inputCls, backgroundColor: A.card }}
        />
      </div>

      {loading ? (
        <div className="text-center py-20">
          <i
            className="fas fa-spinner fa-spin text-2xl"
            style={{ color: A.gold }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const liveCount = category.items.filter((item) => item.active).length;

            return (
              <div
                key={category.id}
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: A.card,
                  border: `1px solid ${A.border}`,
                }}
              >
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ borderBottom: `1px solid ${A.border}` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <h3
                      className="font-bold text-sm"
                      style={{ color: A.textPrimary }}
                    >
                      {category.name}
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: A.bg, color: A.textMuted }}
                    >
                      {category.items.length} / 啟用 {liveCount}
                    </span>
                  </div>
                  <button
                    onClick={() => openNewItem(category.id)}
                    className="text-xs flex items-center gap-1 transition"
                    style={{ color: A.gold }}
                  >
                    <i className="fas fa-plus" /> 新增加購
                  </button>
                </div>

                {category.items.length === 0 ? (
                  <div className="p-5 text-center text-sm" style={{ color: A.textMuted }}>
                    目前沒有符合搜尋條件的品項
                  </div>
                ) : (
                  <div>
                    {category.items.map((item, itemIndex) => {
                      const scenarioLabels = item.scenarioTags
                        .map(
                          (scenarioId) =>
                            scenarios.find((scenario) => scenario.id === scenarioId)
                              ?.name ?? scenarioId
                        )
                        .join("、");

                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 px-5 py-4 group transition-colors"
                          style={{ borderBottom: `1px solid ${A.border}` }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span
                                className="font-medium text-sm"
                                style={{ color: A.textPrimary }}
                              >
                                {item.name}
                              </span>
                              <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor:
                                    item.type === "counter"
                                      ? `${A.blue}20`
                                      : `${A.gold}20`,
                                  color:
                                    item.type === "counter" ? A.blue : A.gold,
                                }}
                              >
                                {item.type === "counter" ? "計數" : "開關"}
                              </span>
                              {item.popular && (
                                <span
                                  className="text-xs px-1.5 py-0.5 rounded"
                                  style={{
                                    backgroundColor: "rgba(236,72,153,0.18)",
                                    color: "#ec4899",
                                  }}
                                >
                                  熱門
                                </span>
                              )}
                              <span
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: item.active
                                    ? "rgba(34,197,94,0.18)"
                                    : "rgba(239,68,68,0.18)",
                                  color: item.active ? A.success : A.danger,
                                }}
                              >
                                {item.active ? "啟用" : "停用"}
                              </span>
                            </div>
                            <p className="text-xs mb-1" style={{ color: A.textMuted }}>
                              {item.description}
                            </p>
                            <div
                              className="flex flex-wrap gap-x-4 gap-y-1 text-xs"
                              style={{ color: A.textMuted }}
                            >
                              <span>
                                ID: <span style={{ color: A.textPrimary }}>{item.id}</span>
                              </span>
                              <span>
                                平日 {item.priceWeekday.toLocaleString()} / 假日{" "}
                                {item.priceWeekend.toLocaleString()}
                              </span>
                              <span>單位：{item.unit}</span>
                              <span>情境：{scenarioLabels}</span>
                              <span>排序：{item.sortOrder}</span>
                              {item.type === "counter" && item.max !== undefined && (
                                <span>上限：{item.max}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 opacity-40 group-hover:opacity-100 transition">
                            <button
                              onClick={() =>
                                openEditItem(category.id, itemIndex, item)
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: A.bg, color: A.gold }}
                            >
                              <i className="fas fa-pen text-xs" />
                            </button>
                            <button
                              onClick={() => deleteItem(category.id, item.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: A.bg, color: A.danger }}
                            >
                              <i className="fas fa-trash text-xs" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="w-full max-w-2xl mx-4 rounded-2xl"
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
                {isNewItem ? "新增加購項目" : `編輯：${editing.item.name}`}
              </h2>
              <button onClick={closeModal} style={{ color: A.textMuted }}>
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelCls}>ID *</label>
                  <input
                    value={editing.item.id}
                    onChange={(event) => updateItemField("id", event.target.value)}
                    disabled={!isNewItem}
                    style={{ ...inputCls, opacity: isNewItem ? 1 : 0.5 }}
                  />
                </div>
                <div>
                  <label style={labelCls}>名稱 *</label>
                  <input
                    value={editing.item.name}
                    onChange={(event) => updateItemField("name", event.target.value)}
                    style={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelCls}>所屬分類</label>
                  <select
                    value={editing.categoryId}
                    onChange={(event) => updateCategoryId(event.target.value)}
                    style={inputCls}
                  >
                    {data.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelCls}>排序</label>
                  <input
                    type="number"
                    value={editing.item.sortOrder}
                    onChange={(event) =>
                      updateItemField("sortOrder", Number(event.target.value))
                    }
                    style={inputCls}
                  />
                </div>
              </div>

              <div>
                <label style={labelCls}>描述</label>
                <textarea
                  value={editing.item.description}
                  onChange={(event) =>
                    updateItemField("description", event.target.value)
                  }
                  rows={3}
                  style={{ ...inputCls, resize: "vertical" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label style={labelCls}>單位</label>
                  <input
                    value={editing.item.unit}
                    onChange={(event) => updateItemField("unit", event.target.value)}
                    style={inputCls}
                  />
                </div>
                <div>
                  <label style={labelCls}>平日價</label>
                  <input
                    type="number"
                    value={editing.item.priceWeekday}
                    onChange={(event) =>
                      updateItemField("priceWeekday", Number(event.target.value))
                    }
                    style={inputCls}
                  />
                </div>
                <div>
                  <label style={labelCls}>假日價</label>
                  <input
                    type="number"
                    value={editing.item.priceWeekend}
                    onChange={(event) =>
                      updateItemField("priceWeekend", Number(event.target.value))
                    }
                    style={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelCls}>類型</label>
                  <select
                    value={editing.item.type}
                    onChange={(event) =>
                      updateItemField(
                        "type",
                        event.target.value as AddonItemConfig["type"]
                      )
                    }
                    style={inputCls}
                  >
                    <option value="toggle">開關</option>
                    <option value="counter">計數</option>
                  </select>
                </div>
                <div>
                  <label style={labelCls}>群組（選填）</label>
                  <input
                    value={editing.item.group || ""}
                    onChange={(event) =>
                      updateItemField("group", event.target.value || undefined)
                    }
                    placeholder="例：bartender"
                    style={inputCls}
                  />
                </div>
              </div>

              {editing.item.type === "counter" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelCls}>上限</label>
                    <input
                      type="number"
                      value={editing.item.max ?? 0}
                      onChange={(event) =>
                        updateItemField("max", Number(event.target.value))
                      }
                      style={inputCls}
                    />
                  </div>
                  <div>
                    <label style={labelCls}>最低數量</label>
                    <input
                      type="number"
                      value={editing.item.minOrder ?? 0}
                      onChange={(event) =>
                        updateItemField("minOrder", Number(event.target.value))
                      }
                      style={inputCls}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={labelCls}>適用情境</label>
                <div className="flex flex-wrap gap-2">
                  {scenarios.map((scenario) => {
                    const active = editing.item.scenarioTags.includes(scenario.id);
                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        onClick={() => toggleScenarioTag(scenario.id)}
                        className="text-xs px-3 py-1.5 rounded-full transition"
                        style={{
                          backgroundColor: active ? `${A.gold}20` : "transparent",
                          color: active ? A.gold : A.textMuted,
                          border: `1px solid ${active ? A.gold : A.border}`,
                        }}
                      >
                        {scenario.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label
                  className="flex items-center justify-between rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: A.bg,
                    border: `1px solid ${A.border}`,
                    color: A.textPrimary,
                  }}
                >
                  <span className="text-sm">首頁熱門加購</span>
                  <input
                    type="checkbox"
                    checked={editing.item.popular}
                    onChange={(event) =>
                      updateItemField("popular", event.target.checked)
                    }
                  />
                </label>
                <label
                  className="flex items-center justify-between rounded-lg px-4 py-3"
                  style={{
                    backgroundColor: A.bg,
                    border: `1px solid ${A.border}`,
                    color: A.textPrimary,
                  }}
                >
                  <span className="text-sm">啟用販售</span>
                  <input
                    type="checkbox"
                    checked={editing.item.active}
                    onChange={(event) =>
                      updateItemField("active", event.target.checked)
                    }
                  />
                </label>
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
                onClick={saveItem}
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
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listPopularAddons } from "@/lib/addons/repository";
import { v2ScenarioConfigs, v2VenueConfig } from "@/lib/booking/config";
import { listActiveBundles, resolveBundleItems } from "@/lib/bundles/repository";
import { getLegacyPlanPage } from "@/lib/v2/legacy-pages";
import {
  buildBookingHref,
  getLegacyPlanBookingTarget,
  legacyPlanSlugs,
} from "@/lib/v2/navigation";
import { getScenarioPresentation } from "@/lib/v2/presentation";

function formatCurrency(value: number): string {
  return `NT$${value.toLocaleString()}`;
}

export async function generateStaticParams() {
  return legacyPlanSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegacyPlanPage(slug);
  const bookingTarget = getLegacyPlanBookingTarget(slug);
  const scenario = bookingTarget
    ? v2ScenarioConfigs.find((item) => item.id === bookingTarget.scenarioId)
    : null;

  if (!page || !scenario) {
    return {};
  }

  return {
    title: `${page.shortName}｜高雄包場場地`,
    description: page.intro,
    openGraph: {
      title: `${page.shortName} - RUINS BAR 廢墟`,
      description: page.heroSummary,
      images: [{ url: page.coverImage ?? getScenarioPresentation(page.scenarioId).image }],
    },
  };
}

export default async function PlanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLegacyPlanPage(slug);
  const bookingTarget = getLegacyPlanBookingTarget(slug);

  if (!page || !bookingTarget) {
    return notFound();
  }

  const scenario = v2ScenarioConfigs.find(
    (item) => item.id === bookingTarget.scenarioId
  );

  if (!scenario) {
    return notFound();
  }

  const visual = getScenarioPresentation(scenario.id);
  const bookingHref = buildBookingHref(bookingTarget);
  const heroImage = page.coverImage ?? visual.image;
  const primaryActionLabel = bookingTarget.bundleId
    ? "直接查看推薦組合"
    : "開始配置場地";

  const bundles = listActiveBundles({ scenarioId: scenario.id }).map((bundle) => ({
    ...bundle,
    items: resolveBundleItems(bundle.id).map((item) => item.addon.name),
  }));

  const popularAddons = listPopularAddons({
    scenarioId: scenario.id,
    limit: 6,
  });

  const faqItems = page.faqs;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${page.shortName}｜RUINS BAR 廢墟`,
    description: page.intro,
    image: heroImage,
    areaServed: "高雄市",
    provider: {
      "@type": "LocalBusiness",
      name: "RUINS BAR 廢墟",
    },
  };

  const faqJsonLd =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <section className="relative h-[50vh] min-h-[420px] flex items-end">
        <Image
          src={heroImage}
          alt={`${page.shortName} - 高雄場地租借`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pb-12 w-full">
          <div className="flex items-center gap-2 mb-3">
            <Link
              href="/"
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              首頁
            </Link>
            <i className="fas fa-chevron-right text-gray-500 text-xs" />
            <span className="text-sm" style={{ color: visual.accentColor }}>
              {scenario.name}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                color: visual.accentColor,
                backgroundColor: `${visual.accentColor}22`,
                borderColor: `${visual.accentColor}55`,
              }}
            >
              {visual.eyebrow}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black/40 text-white">
              {visual.suitableFor}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black/40 text-white">
              同時段僅接待一組
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            高雄{scenario.name}包場
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl">{page.heroSummary}</p>
        </div>
      </section>

      <section
        className="max-w-6xl mx-auto px-4 md:px-8 py-16"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <p
              className="text-base leading-relaxed mb-8"
              style={{ color: "var(--text-secondary)" }}
            >
              {page.intro}
            </p>

            <div
              className="p-6 mb-8 rounded-2xl"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-sm mb-2" style={{ color: "var(--text-faint)" }}>
                    場地基本價格
                  </p>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    3 小時場地租借
                  </h2>
                </div>
                <div
                  className="rounded-full px-4 py-2 text-sm font-bold"
                  style={{
                    backgroundColor: `${visual.accentColor}18`,
                    color: visual.accentColor,
                  }}
                >
                  最晚需於活動前 {v2VenueConfig.leadDays} 天預約
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div
                  className="rounded-xl p-5 border"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-primary)",
                  }}
                >
                  <p className="text-sm mb-1" style={{ color: "var(--text-faint)" }}>
                    平日
                  </p>
                  <p className="text-3xl font-bold" style={{ color: "var(--accent-blue)" }}>
                    {formatCurrency(v2VenueConfig.weekdayPrice)}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    加時每小時 {formatCurrency(v2VenueConfig.weekdayExtraHourPrice)}
                  </p>
                </div>

                <div
                  className="rounded-xl p-5 border"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-primary)",
                  }}
                >
                  <p className="text-sm mb-1" style={{ color: "var(--text-faint)" }}>
                    假日
                  </p>
                  <p className="text-3xl font-bold" style={{ color: "var(--accent-pink)" }}>
                    {formatCurrency(v2VenueConfig.weekendPrice)}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    加時每小時 {formatCurrency(v2VenueConfig.weekendExtraHourPrice)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {v2VenueConfig.baseIncludes.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl px-4 py-3 border text-sm"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <i
                      className="fas fa-check mr-2"
                      style={{ color: "var(--accent-blue)" }}
                    />
                    {item}
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl px-4 py-4 border text-sm mt-5"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-muted)",
                }}
              >
                建議人數 {v2VenueConfig.capacity.min} - {v2VenueConfig.capacity.max} 人，
                一個時段只接待一組，實際總額依組合與加購內容計算。
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <p className="text-sm mb-2" style={{ color: "var(--text-faint)" }}>
                    推薦組合
                  </p>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    先從常見配置開始
                  </h2>
                </div>
                <Link
                  href={bookingHref}
                  className="text-sm font-bold"
                  style={{ color: visual.accentColor }}
                >
                  查看完整預約流程
                </Link>
              </div>

              {bundles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {bundles.map((bundle) => (
                    <Link
                      key={bundle.id}
                      href={buildBookingHref({
                        scenarioId: bundle.scenarioId,
                        bundleId: bundle.id,
                      })}
                      className="block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--border-primary)",
                        boxShadow: "var(--card-shadow)",
                      }}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border mb-3"
                              style={{
                                backgroundColor: `${visual.accentColor}18`,
                                borderColor: `${visual.accentColor}40`,
                                color: visual.accentColor,
                              }}
                            >
                              {bundle.badge}
                            </span>
                            <h3
                              className="text-xl font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {bundle.name}
                            </h3>
                            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                              {bundle.summary}
                            </p>
                          </div>
                        </div>

                        <ul className="space-y-2 mb-5">
                          {bundle.items.slice(0, 4).map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-sm"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <i
                                className="fas fa-check mt-1"
                                style={{ color: visual.accentColor, fontSize: "10px" }}
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        <div
                          className="flex items-end justify-between pt-4"
                          style={{ borderTop: "1px solid var(--border-primary)" }}
                        >
                          <div>
                            <p className="text-xs line-through" style={{ color: "var(--text-faint)" }}>
                              單買 {formatCurrency(bundle.listPrice)}
                            </p>
                            <p
                              className="text-xl font-bold"
                              style={{ color: visual.accentColor }}
                            >
                              {formatCurrency(bundle.bundlePrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                              組合優惠
                            </p>
                            <p className="font-bold" style={{ color: "var(--accent-pink)" }}>
                              {formatCurrency(bundle.savings)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-2xl p-6 border"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-primary)",
                    boxShadow: "var(--card-shadow)",
                  }}
                >
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    這類活動通常從純場地開始配置
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                    先確認時段與場地租金，再依需要加入餐飲、飲品、主持、拍照或佈置內容。
                  </p>
                  <Link
                    href={bookingHref}
                    className="inline-flex items-center text-sm py-2.5 px-6 rounded-lg font-bold transition"
                    style={{ backgroundColor: "var(--accent-pink)", color: "#fff" }}
                  >
                    前往預約頁面
                  </Link>
                </div>
              )}
            </div>

            {popularAddons.length > 0 && (
              <div className="mb-8">
                <p className="text-sm mb-2" style={{ color: "var(--text-faint)" }}>
                  熱門加購項目
                </p>
                <h2
                  className="text-2xl font-bold mb-5"
                  style={{ color: "var(--text-primary)" }}
                >
                  常一起搭配的服務
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className="rounded-2xl p-5 border"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        borderColor: "var(--border-primary)",
                        boxShadow: "var(--card-shadow)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3
                            className="font-bold text-lg"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {addon.name}
                          </h3>
                          <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
                            {addon.unit}
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `${visual.accentColor}18`,
                            color: visual.accentColor,
                          }}
                        >
                          熱門
                        </span>
                      </div>
                      <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                        {addon.description}
                      </p>
                      <p
                        className="font-bold text-lg"
                        style={{ color: "var(--accent-blue)" }}
                      >
                        {formatCurrency(addon.priceWeekday)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {faqItems.length > 0 && (
              <div className="mt-12">
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  常見問題
                </h2>
                <div className="space-y-4">
                  {faqItems.map((item) => (
                    <div
                      key={item.q}
                      className="p-5 rounded-2xl"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                      }}
                    >
                      <h3 className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                        <i
                          className="fas fa-circle-question mr-2 text-sm"
                          style={{ color: "var(--accent-blue)" }}
                        />
                        {item.q}
                      </h3>
                      <p className="text-sm leading-relaxed pl-6" style={{ color: "var(--text-muted)" }}>
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div
                className="p-6 text-center rounded-2xl"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <h2 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  想預約這類活動？
                </h2>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  先選日期，再帶入推薦組合與加購內容，即可看到即時報價。
                </p>
                <Link
                  href={bookingHref}
                  className="w-full flex items-center justify-center text-sm font-bold py-3 rounded-lg transition"
                  style={{ backgroundColor: "var(--accent-pink)", color: "#fff" }}
                >
                  <i className="fas fa-calendar-check mr-2" />
                  {primaryActionLabel}
                </Link>
              </div>

              <div
                className="p-6 rounded-2xl"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <h3 className="font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                  預約前先看
                </h3>
                <ul className="space-y-3 text-sm" style={{ color: "var(--text-muted)" }}>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check mt-1" style={{ color: visual.accentColor }} />
                    <span>基本場租為 3 小時，可再依需求加時。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check mt-1" style={{ color: visual.accentColor }} />
                    <span>同一時段僅接待一組，活動流程不與其他客人共用。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check mt-1" style={{ color: visual.accentColor }} />
                    <span>預收金額依總額計算，付款完成後才會保留時段與服務內容。</span>
                  </li>
                </ul>
              </div>

              <div
                className="p-6 text-center rounded-2xl"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  需要更多資訊？
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  可先用 LINE 告訴我們日期、用途與大概人數。
                </p>
                <a
                  href="https://line.me/R/ti/p/@529ldsir"
                  target="_blank"
                  rel="noopener"
                  className="w-full flex items-center justify-center text-sm font-medium py-3 rounded-lg transition"
                  style={{
                    border: "1px solid var(--border-primary)",
                    color: "var(--text-muted)",
                  }}
                >
                  <i className="fab fa-line mr-2" />
                  LINE 詢問檔期
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

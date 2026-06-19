import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import siteConfig from "@/data/site-config.json";
import { BrandStory } from "@/components/BrandStory";
import { FAQ } from "@/components/FAQ";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { MediaLogos } from "@/components/MediaLogos";
import { Reviews } from "@/components/Reviews";
import { listPopularAddons } from "@/lib/addons/repository";
import { v2ScenarioConfigs, v2VenueConfig } from "@/lib/booking/config";
import { listActiveBundles, resolveBundleItems } from "@/lib/bundles/repository";
import { getScenarioPresentation } from "@/lib/v2/presentation";

export const metadata: Metadata = {
  title: siteConfig.seo.defaultTitle,
  description: siteConfig.seo.defaultDescription,
};

const popularAddons = listPopularAddons({ limit: 6 });

const bundleViews = listActiveBundles().map((bundle) => ({
  ...bundle,
  items: resolveBundleItems(bundle.id).map((item) => item.addon.name),
  visual: getScenarioPresentation(bundle.scenarioId),
  scenarioName:
    v2ScenarioConfigs.find((scenario) => scenario.id === bundle.scenarioId)?.name ??
    bundle.scenarioId,
}));

export default function HomePage() {
  return (
    <>
      <Hero />

      <section
        id="booking"
        className="py-20 px-4"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-3xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              <i
                className="fas fa-calendar-check mr-3"
                style={{ color: "var(--accent-blue)" }}
              />
              先選活動用途
            </h2>
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
              求婚、生日、抓周、企業活動、商業拍攝，先選用途再看推薦組合與加購。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {v2ScenarioConfigs.map((scenario) => {
              const visual = getScenarioPresentation(scenario.id);

              return (
                <Link
                  key={scenario.id}
                  href={`/book?scenario=${scenario.id}`}
                  className="group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-primary)",
                    boxShadow: "var(--card-shadow)",
                  }}
                >
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={visual.image}
                      alt={`${scenario.name}場地提案`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
                        style={{
                          backgroundColor: `${visual.accentColor}22`,
                          borderColor: `${visual.accentColor}55`,
                          color: visual.accentColor,
                        }}
                      >
                        {visual.eyebrow}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <i className={scenario.icon} style={{ color: visual.accentColor }} />
                        <h3 className="font-bold text-xl text-white">{scenario.name}</h3>
                      </div>
                      <p className="text-sm text-white/80">{visual.suitableFor}</p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p
                      className="text-sm mb-4 line-clamp-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {scenario.description}
                    </p>
                    <div
                      className="flex items-center justify-between pt-3"
                      style={{ borderTop: "1px solid var(--border-primary)" }}
                    >
                      <div>
                        <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                          場地 3 小時
                        </span>
                        <p className="font-bold" style={{ color: visual.accentColor }}>
                          NT${v2VenueConfig.weekdayPrice.toLocaleString()} 起
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold transition-transform group-hover:translate-x-1"
                        style={{ color: visual.accentColor }}
                      >
                        開始配置 <i className="fas fa-arrow-right ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="py-20 px-4"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-3xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              包場價格與包含內容
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              先看基本場租，再決定要不要搭推薦組合或單品加購。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr,1.1fr] gap-6">
            <div
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-primary)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <p className="text-sm mb-2" style={{ color: "var(--text-faint)" }}>
                RUINS 廢墟主場
              </p>
              <h3
                className="text-2xl font-bold mb-5"
                style={{ color: "var(--text-primary)" }}
              >
                3 小時場租
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
                    NT${v2VenueConfig.weekdayPrice.toLocaleString()}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    加時每小時 NT${v2VenueConfig.weekdayExtraHourPrice.toLocaleString()}
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
                    NT${v2VenueConfig.weekendPrice.toLocaleString()}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    加時每小時 NT${v2VenueConfig.weekendExtraHourPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              <Link
                href="/book?scenario=venue"
                className="inline-flex items-center font-bold py-3 px-6 rounded-full transition"
                style={{ backgroundColor: "var(--accent-pink)", color: "#fff" }}
              >
                先看檔期與報價
              </Link>
            </div>

            <div
              className="rounded-2xl p-6 border"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-primary)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                基本包含
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
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
                className="rounded-xl px-4 py-4 border text-sm"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--text-muted)",
                }}
              >
                建議人數 {v2VenueConfig.capacity.min} - {v2VenueConfig.capacity.max} 人，
                最晚需於活動前 {v2VenueConfig.leadDays} 天完成預約。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="bundles"
        className="py-20 px-4"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-3xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              常見活動組合
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              想快一點做決定，可以先從常見搭配開始，再微調成你要的活動內容。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bundleViews.map((bundle) => (
              <Link
                key={bundle.id}
                href={`/book?scenario=${bundle.scenarioId}&bundle=${bundle.id}`}
                className="group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: "var(--border-primary)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={bundle.visual.image}
                    alt={bundle.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
                      style={{
                        backgroundColor: `${bundle.visual.accentColor}22`,
                        borderColor: `${bundle.visual.accentColor}55`,
                        color: bundle.visual.accentColor,
                      }}
                    >
                      {bundle.badge}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-black/40 text-white">
                      {bundle.scenarioName}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{bundle.name}</h3>
                    <p className="text-sm text-white/75">{bundle.summary}</p>
                  </div>
                </div>

                <div className="p-5">
                  <ul className="space-y-2 mb-5">
                    {bundle.items.slice(0, 4).map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <i
                          className="fas fa-check mt-1"
                          style={{ color: bundle.visual.accentColor, fontSize: "10px" }}
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
                        單買 NT${bundle.listPrice.toLocaleString()}
                      </p>
                      <p
                        className="text-xl font-bold"
                        style={{ color: bundle.visual.accentColor }}
                      >
                        NT${bundle.bundlePrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                        現省
                      </p>
                      <p className="font-bold" style={{ color: "var(--accent-pink)" }}>
                        NT${bundle.savings.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="addons"
        className="py-20 px-4"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-3xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              熱門加購項目
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              花藝、背板、拍照、主持與餐飲酒水，都可以依活動用途往上加。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                      backgroundColor: "rgba(255, 0, 85, 0.12)",
                      color: "var(--accent-pink)",
                    }}
                  >
                    熱門
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  {addon.description}
                </p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                      平日 / 假日同價
                    </p>
                    <p
                      className="font-bold text-lg"
                      style={{ color: "var(--accent-blue)" }}
                    >
                      NT${addon.priceWeekday.toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/book?scenario=${addon.scenarioTags[0] ?? "venue"}`}
                    className="text-sm font-bold"
                    style={{ color: "var(--accent-blue)" }}
                  >
                    直接加購
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MediaLogos />
      <BrandStory />
      <Gallery />
      <Reviews />
      <FAQ />

      <section
        className="py-20 px-4 text-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-xl mx-auto">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            想先確認你的活動適不適合嗎？
          </h2>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>
            先選日期，再決定用途、推薦組合和單品加購，就能快速看到完整報價。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={siteConfig.contact.lineUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center px-6 py-3 rounded-full border transition hover:opacity-80"
              style={{ color: "#fff", borderColor: "var(--accent-pink)", backgroundColor: "var(--accent-pink)" }}
            >
              <i className="fab fa-line text-xl mr-2" />
              LINE 詢問檔期
            </a>
            <Link
              href="/book"
              className="inline-block font-bold py-3 px-8 rounded-full transition border"
              style={{ backgroundColor: "transparent", color: "var(--text-primary)", borderColor: "var(--border-primary)" }}
            >
              查看檔期與價格
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/faq"
              className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-bold transition"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
            >
              常見問題
            </Link>
            <Link
              href="/location"
              className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-bold transition"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
            >
              交通停車
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

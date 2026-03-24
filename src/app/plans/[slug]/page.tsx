import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import plans from "@/data/plans.json";
import addonsData from "@/data/addons.json";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = [...new Set(plans.map((p) => p.slug))];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plan = plans.find((p) => p.slug === slug);
  if (!plan) return {};
  return {
    title: `${plan.name} | 高雄場地租借`,
    description: plan.description,
    openGraph: {
      title: `${plan.name} - RUINS BAR 廢墟`,
      description: plan.tagline,
      images: [{ url: plan.coverImage }],
    },
  };
}

export default async function PlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugPlans = plans.filter((p) => p.slug === slug);
  if (slugPlans.length === 0) return notFound();
  const primary = slugPlans[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: primary.name,
    description: primary.description,
    image: primary.coverImage,
    offers: primary.priceWeekday > 0
      ? { "@type": "Offer", priceCurrency: "TWD", price: primary.priceWeekday, availability: "https://schema.org/InStock" }
      : undefined,
  };

  const faqJsonLd = primary.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: primary.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const planAddonIds = primary.allowedAddons;
  const relevantAddons = addonsData.categories.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => planAddonIds.includes(item.id)),
  })).filter((cat) => cat.items.length > 0);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end">
        <Image src={primary.coverImage} alt={`${primary.name} - 高雄場地租借`} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pb-12 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-gray-400 text-sm hover:text-white transition-colors">首頁</Link>
            <i className="fas fa-chevron-right text-gray-500 text-xs" />
            <span className="text-sm" style={{ color: "var(--accent-blue)" }}>{primary.shortName}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
            {primary.name}
          </h1>
          <p className="text-gray-300 text-lg">{primary.tagline}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-16" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2">
            <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>{primary.description}</p>

            {slugPlans.map((plan) => (
              <div key={plan.id} className="p-6 mb-6 rounded-2xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", boxShadow: "var(--card-shadow)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{plan.name}</h3>
                  <div className="text-right">
                    {plan.priceWeekday > 0 ? (
                      <>
                        <div className="text-sm" style={{ color: "var(--text-muted)" }}>平日</div>
                        <div className="text-xl font-bold" style={{ color: "var(--accent-gold)" }}>
                          NT${plan.priceWeekday.toLocaleString()}
                          <span className="text-sm ml-1" style={{ color: "var(--text-muted)" }}>{plan.priceUnit}</span>
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>假日 NT${plan.priceWeekend.toLocaleString()}</div>
                      </>
                    ) : (
                      <span className="font-bold" style={{ color: "var(--accent-gold)" }}>{plan.priceUnit || "另行報價"}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
                  <span><i className="fas fa-users mr-1" />{plan.suitableFor}</span>
                  <span><i className="fas fa-clock mr-1" />{plan.duration}</span>
                  <span><i className="fas fa-calendar mr-1" />需提前 {plan.leadDays} 天</span>
                </div>

                <h4 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>方案內含</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {plan.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <i className="fas fa-check mt-0.5 text-xs" style={{ color: "#15803d" }} />
                      <span style={{ color: "var(--text-secondary)" }}>{h}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/book?plan=${plan.id}`}
                  className="inline-flex items-center text-sm py-2.5 px-6 rounded-lg font-bold transition"
                  style={{ backgroundColor: "var(--accent-pink)", color: "#fff" }}
                >
                  <i className="fas fa-calendar-check mr-2" />立即預約此方案
                </Link>
              </div>
            ))}

            {/* Addons */}
            {relevantAddons.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>可選加購服務</h3>
                {relevantAddons.map((cat) => (
                  <div key={cat.id} className="mb-4">
                    <h4 className="text-sm font-bold mb-2" style={{ color: "var(--text-muted)" }}>{cat.icon} {cat.name}</h4>
                    <div className="space-y-2">
                      {cat.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                        >
                          <div>
                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                            <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>{item.description}</span>
                          </div>
                          <span className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--accent-gold)" }}>
                            NT${item.priceWeekday.toLocaleString()}/{item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FAQ */}
            {primary.faq.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>常見問題</h3>
                <div className="space-y-4">
                  {primary.faq.map((f, i) => (
                    <div key={i} className="p-5 rounded-2xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                      <h4 className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                        <i className="fas fa-circle-question mr-2 text-sm" style={{ color: "var(--accent-blue)" }} />{f.q}
                      </h4>
                      <p className="text-sm leading-relaxed pl-6" style={{ color: "var(--text-muted)" }}>{f.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="p-6 text-center rounded-2xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", boxShadow: "var(--card-shadow)" }}>
                <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>想預約這個方案？</h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>查詢檔期、選擇加購、即時報價</p>
                <Link href={`/book?plan=${primary.id}`}
                  className="w-full flex items-center justify-center text-sm font-bold py-3 rounded-lg transition"
                  style={{ backgroundColor: "var(--accent-pink)", color: "#fff" }}
                >
                  <i className="fas fa-calendar-check mr-2" />開始預約流程
                </Link>
              </div>
              <div className="p-6 text-center rounded-2xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-primary)", boxShadow: "var(--card-shadow)" }}>
                <h3 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>需要更多資訊？</h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>歡迎 LINE 諮詢，我們會盡快回覆</p>
                <a href="https://line.me/R/ti/p/@529ldsir" target="_blank" rel="noopener"
                  className="w-full flex items-center justify-center text-sm font-medium py-3 rounded-lg transition"
                  style={{ border: "1px solid var(--border-primary)", color: "var(--text-muted)" }}
                >
                  <i className="fab fa-line mr-2" />LINE 聯繫
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

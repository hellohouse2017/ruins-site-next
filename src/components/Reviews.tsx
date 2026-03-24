import siteConfig from "@/data/site-config.json";

export function Reviews() {
  return (
    <section
      id="reviews"
      className="py-20 border-t"
      style={{ backgroundColor: "var(--section-alt-bg)", borderColor: "var(--border-primary)" }}
    >
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
          五星好評見證
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {siteConfig.reviews.map((review, i) => (
            <div
              key={i}
              className="rounded-xl p-6 border text-left flex flex-col transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-primary)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <i key={j} className="fas fa-star text-sm" style={{ color: "var(--accent-gold)" }} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "var(--text-secondary)" }}>
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                  style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}
                >
                  <i className="fas fa-user" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{review.author}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{review.plan}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <a
          href={siteConfig.contact.googleReviewUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: "var(--text-muted)" }}
        >
          <i className="fab fa-google" />
          查看更多 Google 評論
          <i className="fas fa-external-link-alt text-xs" />
        </a>
      </div>
    </section>
  );
}

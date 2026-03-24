import Link from "next/link";
import siteConfig from "@/data/site-config.json";

export function Footer() {
  return (
    <footer className="border-t" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3
              className="text-2xl font-bold tracking-wider mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              RUINS <span style={{ color: "var(--accent-pink)" }}>BAR</span>
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
              {siteConfig.brand.tagline}
            </p>
            <div className="flex gap-4">
              <a href={siteConfig.contact.instagram} target="_blank" rel="noopener"
                className="text-xl transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}
                aria-label="Instagram"><i className="fab fa-instagram" /></a>
              <a href={siteConfig.contact.lineUrl} target="_blank" rel="noopener"
                className="text-xl text-green-500 transition-colors hover:opacity-80"
                aria-label="LINE"><i className="fab fa-line" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider uppercase" style={{ color: "var(--text-primary)" }}>
              快速導覽
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/plans/proposal", label: "求婚包場" },
                { href: "/plans/wedding", label: "婚禮派對" },
                { href: "/plans/baby", label: "抓周 / 性別派對" },
                { href: "/plans/party", label: "慶生 / 各式派對" },
                { href: "/plans/meeting", label: "會議包場" },
                { href: "/book", label: "立即預約" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors hover:opacity-70"
                    style={{ color: "var(--text-muted)" }}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider uppercase" style={{ color: "var(--text-primary)" }}>
              聯絡我們
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: "var(--text-muted)" }}>
              <li className="flex items-start gap-2">
                <i className="fas fa-map-marker-alt mt-1" style={{ color: "var(--accent-pink)" }} />
                <a href={siteConfig.contact.googleMapsUrl} target="_blank" rel="noopener"
                  className="hover:opacity-70 transition-colors">{siteConfig.location.address}</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-phone" style={{ color: "var(--accent-blue)" }} />
                <a href={`tel:${siteConfig.contact.phoneRaw}`} className="hover:opacity-70 transition-colors">
                  {siteConfig.contact.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fab fa-line text-green-500" />
                <a href={siteConfig.contact.lineUrl} target="_blank" rel="noopener"
                  className="hover:opacity-70 transition-colors">LINE {siteConfig.contact.lineId}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-xs tracking-wider"
          style={{ borderColor: "var(--border-primary)", color: "var(--text-faint)" }}>
          © {siteConfig.brand.year} {siteConfig.brand.name}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import Image from "next/image";

interface Plan {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  accentColor: string;
  coverImage: string;
  tagline: string;
  highlights: string[];
  priceWeekday: number;
  priceWeekend: number;
  priceUnit: string;
  suitableFor: string;
  duration: string;
}

/* Uniform card — original layout style */
export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Link
      href={`/book?plan=${plan.id}`}
      className="group block rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-primary)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={plan.coverImage}
          alt={`高雄${plan.shortName}場地`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-20" />
        <div className="absolute top-3 right-3">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: plan.accentColor + "22",
              color: plan.accentColor,
              border: `1px solid ${plan.accentColor}44`,
            }}
          >
            {plan.suitableFor}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <i className={plan.icon} style={{ color: plan.accentColor }} />
          <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            {plan.shortName}
          </h3>
        </div>

        <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--text-muted)" }}>
          {plan.tagline}
        </p>

        {/* Highlights */}
        <ul className="space-y-1 mb-4">
          {plan.highlights.slice(0, 3).map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <i className="fas fa-check mt-0.5" style={{ color: plan.accentColor, fontSize: "10px" }} />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-primary)" }}>
          <div>
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>平日起</span>
            <p className="font-bold" style={{ color: plan.accentColor }}>
              {plan.priceWeekday > 0
                ? `NT$${plan.priceWeekday.toLocaleString()}`
                : "依報價"}
            </p>
          </div>
          <span
            className="text-xs font-bold group-hover:translate-x-1 transition-transform"
            style={{ color: plan.accentColor }}
          >
            了解更多 <i className="fas fa-arrow-right ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

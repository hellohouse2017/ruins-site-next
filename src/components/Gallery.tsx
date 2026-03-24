import Image from "next/image";

/* 15 gallery images matching live site */
const galleryImages = [
  { src: "/images/venue-outdoor-vibe.jpg", alt: "廢墟建築外觀" },
  { src: "/images/gallery-vibe-1.jpg", alt: "工業風內部空間" },
  { src: "/images/gallery-decor-1.jpg", alt: "紅磚牆面細節" },
  { src: "/images/proposal-cover.jpg", alt: "光影交錯的角落" },
  { src: "/images/proposal-romantic-light.jpg", alt: "浪漫求婚佈置" },
  { src: "/images/venue-decor-wedding.jpg", alt: "求婚場景氛圍" },
  { src: "/images/party-cover.jpg", alt: "派對現場實況" },
  { src: "/images/party-dj-crowd.jpg", alt: "派對燈光設計" },
  { src: "/images/gallery-food-1.jpg", alt: "活動佈置全景" },
  { src: "/images/food-buffet.jpg", alt: "活動細節特寫" },
  { src: "/images/wedding-cover.jpg", alt: "婚禮儀式場景" },
  { src: "/images/baby-cover.jpg", alt: "戶外區域佈置" },
  { src: "/images/baby-party-setup.jpg", alt: "夜間派對氛圍" },
  { src: "/images/meeting-cover.jpg", alt: "廢墟風格攝影" },
  { src: "/images/venue-empty.jpg", alt: "場地全景概覽" },
];

export function Gallery() {
  return (
    <section id="gallery" className="py-20" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-3 text-center" style={{ color: "var(--text-primary)" }}>
          場地實景
        </h2>
        <p className="text-center text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          廢墟的每個角落，都是你故事的舞台
        </p>

        {/* 3-col masonry-like grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {galleryImages.map((img, i) => {
            // Make first 2 images span 2 cols on larger screens
            const isLarge = i < 2;
            return (
              <div
                key={i}
                className={`gallery-card relative overflow-hidden rounded-xl group cursor-pointer ${
                  isLarge ? "md:col-span-2 h-64 md:h-80" : "h-48 md:h-56"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                  loading="lazy"
                />
                {/* Hover overlay with caption */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                  <span className="text-white text-sm px-4 pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    {img.alt}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

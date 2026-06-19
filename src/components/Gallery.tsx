"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type GalleryCategory =
  | "場地空間"
  | "求婚佈置"
  | "生日派對"
  | "抓周 / 性別揭曉"
  | "企業活動"
  | "商業拍攝"
  | "吧台與餐飲"
  | "夜間氛圍";

interface GalleryItem {
  src: string;
  alt: string;
  category: GalleryCategory;
  title: string;
  description: string;
  suitablePeople: string;
  extras: string;
  href: string;
}

const filters: Array<"全部" | GalleryCategory> = [
  "全部",
  "場地空間",
  "求婚佈置",
  "生日派對",
  "抓周 / 性別揭曉",
  "企業活動",
  "商業拍攝",
  "吧台與餐飲",
  "夜間氛圍",
];

const galleryImages: GalleryItem[] = [
  {
    src: "/images/venue-outdoor-vibe.jpg",
    alt: "廢墟建築外觀",
    category: "場地空間",
    title: "場地外觀與入口",
    description: "先看動線、到場方式與第一眼氛圍，適合評估整場活動的進場感受。",
    suitablePeople: "適合先確認整體空間感",
    extras: "交通、接待、進場動線",
    href: "/book?scenario=venue",
  },
  {
    src: "/images/gallery-vibe-1.jpg",
    alt: "工業風內部空間",
    category: "場地空間",
    title: "室內主空間",
    description: "廢墟風、紅磚牆與工業感結合，適合先判斷桌椅、佈置與拍照視角。",
    suitablePeople: "約 20-60 人",
    extras: "桌椅配置、拍照、投影",
    href: "/book?scenario=venue",
  },
  {
    src: "/images/gallery-decor-1.jpg",
    alt: "紅磚牆面細節",
    category: "商業拍攝",
    title: "紅磚與牆面細節",
    description: "細節畫面很適合品牌形象照、短影音與作品集拍攝。",
    suitablePeople: "適合單拍或小組拍攝",
    extras: "商攝、短影音、平面拍攝",
    href: "/book?scenario=business",
  },
  {
    src: "/images/proposal-cover.jpg",
    alt: "光影交錯的角落",
    category: "求婚佈置",
    title: "求婚進場角落",
    description: "可安排埋伏、燈光與影片播放，讓進場橋段更完整。",
    suitablePeople: "約 10-30 人",
    extras: "花藝、燈串、投影、攝影",
    href: "/book?scenario=proposal",
  },
  {
    src: "/images/proposal-romantic-light.jpg",
    alt: "浪漫求婚佈置",
    category: "求婚佈置",
    title: "求婚主畫面",
    description: "適合需要浪漫主牆、氣氛燈與親友在場的求婚安排。",
    suitablePeople: "約 10-40 人",
    extras: "花藝、氣球、進場流程",
    href: "/book?scenario=proposal",
  },
  {
    src: "/images/venue-decor-wedding.jpg",
    alt: "求婚場景氛圍",
    category: "求婚佈置",
    title: "儀式感佈置",
    description: "偏向正式告白、簡單儀式與近距離拍照的畫面配置。",
    suitablePeople: "約 15-40 人",
    extras: "投影、攝影、花藝",
    href: "/book?scenario=proposal",
  },
  {
    src: "/images/party-cover.jpg",
    alt: "派對現場實況",
    category: "生日派對",
    title: "生日派對主場",
    description: "適合慶生、朋友聚會與主題派對，整場只接待一組客人。",
    suitablePeople: "約 15-50 人",
    extras: "自帶酒水、蛋糕、佈置",
    href: "/book?scenario=party",
  },
  {
    src: "/images/party-dj-crowd.jpg",
    alt: "派對燈光設計",
    category: "夜間氛圍",
    title: "夜間燈光場景",
    description: "更適合晚場、音樂與節奏感強的活動。",
    suitablePeople: "約 20-60 人",
    extras: "調酒、音響、燈光",
    href: "/book?scenario=party",
  },
  {
    src: "/images/gallery-food-1.jpg",
    alt: "活動佈置全景",
    category: "吧台與餐飲",
    title: "餐飲與擺盤",
    description: "適合想看外燴、餐盒或桌面安排會不會影響活動的客人。",
    suitablePeople: "約 10-40 人",
    extras: "外燴、茶點、酒水",
    href: "/book?scenario=venue",
  },
  {
    src: "/images/food-buffet.jpg",
    alt: "活動細節特寫",
    category: "吧台與餐飲",
    title: "餐飲細節",
    description: "可先判斷食物、飲品與取餐動線是否適合你的活動。",
    suitablePeople: "適合多人共享餐飲",
    extras: "外燴、自助吧、調酒",
    href: "/book?scenario=business",
  },
  {
    src: "/images/wedding-cover.jpg",
    alt: "婚禮儀式場景",
    category: "場地空間",
    title: "婚禮或正式活動",
    description: "若需要較完整的儀式感、流程與座位安排，可先看這類實景。",
    suitablePeople: "約 20-80 人",
    extras: "主持、投影、座位",
    href: "/book?scenario=wedding",
  },
  {
    src: "/images/baby-cover.jpg",
    alt: "戶外區域佈置",
    category: "抓周 / 性別揭曉",
    title: "家庭活動區",
    description: "適合抓周、性別揭曉與家族聚會，先看空間是否方便長輩與小孩移動。",
    suitablePeople: "約 10-40 人",
    extras: "抓周、蛋糕、拍照",
    href: "/book?scenario=family",
  },
  {
    src: "/images/baby-party-setup.jpg",
    alt: "夜間派對氛圍",
    category: "抓周 / 性別揭曉",
    title: "親友包場感",
    description: "若希望活動更像家庭聚會又保有畫面感，這類配置會比較直覺。",
    suitablePeople: "約 10-30 人",
    extras: "佈置、甜點、攝影",
    href: "/book?scenario=family",
  },
  {
    src: "/images/meeting-cover.jpg",
    alt: "廢墟風格攝影",
    category: "商業拍攝",
    title: "品牌拍攝與影片",
    description: "適合商攝、MV、短影音與品牌發表，現場風格夠強，畫面辨識度高。",
    suitablePeople: "適合小團隊到中型拍攝",
    extras: "器材、燈光、拍攝時段",
    href: "/book?scenario=business",
  },
  {
    src: "/images/venue-empty.jpg",
    alt: "場地全景概覽",
    category: "場地空間",
    title: "空場狀態",
    description: "不先看佈置，只看場地本身的尺度、位置與可變化性。",
    suitablePeople: "適合先評估容納與動線",
    extras: "桌椅、投影、吧台",
    href: "/book?scenario=venue",
  },
];

export function Gallery() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("全部");

  const visibleItems =
    activeFilter === "全部"
      ? galleryImages
      : galleryImages.filter((item) => item.category === activeFilter);

  return (
    <section id="gallery" className="py-20" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            場地照片與活動實景
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            先看空間，再看這裡能不能承接你的活動。照片依用途分類，方便你快速判斷。
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {filters.map((filter) => {
              const active = filter === activeFilter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition"
                  style={{
                    backgroundColor: active ? "var(--accent-pink)" : "transparent",
                    color: active ? "#fff" : "var(--text-muted)",
                    borderColor: active ? "var(--accent-pink)" : "var(--border-primary)",
                  }}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleItems.map((img) => (
            <div
              key={`${img.src}-${img.title}`}
              className="group overflow-hidden rounded-2xl border"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-primary)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.45)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  >
                    {img.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{img.title}</h3>
                  <p className="text-sm text-white/80">{img.description}</p>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--text-faint)" }}>
                      適合人數
                    </p>
                    <p style={{ color: "var(--text-primary)" }}>{img.suitablePeople}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "var(--text-faint)" }}>
                      可加購
                    </p>
                    <p style={{ color: "var(--text-primary)" }}>{img.extras}</p>
                  </div>
                </div>

                <Link
                  href={img.href}
                  className="inline-flex items-center text-sm font-bold"
                  style={{ color: "var(--accent-pink)" }}
                >
                  詢問類似佈置
                  <i className="fas fa-arrow-right ml-2" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

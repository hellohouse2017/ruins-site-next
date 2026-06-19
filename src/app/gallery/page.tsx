import type { Metadata } from "next";
import { Gallery } from "@/components/Gallery";

export const metadata: Metadata = {
  title: "場地照片｜Ruins Bar 高雄鹽埕包場場地",
  description:
    "Ruins Bar 場地照片與活動實景，依求婚、慶生派對、抓周、企業活動、商業拍攝與夜間氛圍分類，方便快速判斷是否適合你的活動。",
};

export default function GalleryPage() {
  return (
    <main className="pt-20">
      <section
        className="max-w-6xl mx-auto px-4 md:px-8 py-16"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            場地照片與活動實景
          </h1>
          <p className="text-base" style={{ color: "var(--text-muted)" }}>
            先看空間，也看它能不能承接你的活動。照片依用途分類，方便你快速判斷求婚、慶生、抓周、企業活動、商業拍攝或夜間派對適不適合。
          </p>
        </div>

        <Gallery />
      </section>
    </main>
  );
}

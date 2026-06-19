"use client";

import Image from "next/image";

export function BrandStory() {
  return (
    <section className="py-20 px-4 fade-in-section" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: "var(--text-primary)" }}>
          這裡為什麼適合包場
        </h2>

        <div className="space-y-6 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
            <div className="relative h-80 rounded-2xl overflow-hidden">
              <Image
                src="/images/venue-outdoor-vibe.jpg"
                alt="Ruins Bar 高雄鹽埕包場場地外觀"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--accent-pink)" }}>
                Ruins Bar 在鹽埕
              </h3>
              <p>
                位於高雄市鹽埕區瀨南街 205 號，保留老屋紅磚、樹影與廢墟感，第一眼就有畫面，拍照也有辨識度。
              </p>
            </div>
          </div>

          <p>
            我們把它從「只有氣氛」的地方，整理成「真的能辦活動」的場地。你可以在這裡安排求婚、慶生、抓周、企業活動、商業拍攝或輕婚禮。
          </p>

          <p>
            同一時段只接待一組客人，現場流程、桌椅、佈置、外燴、調酒與拍攝都能依需求一起處理，讓你不用自己拼湊各個供應商。
          </p>

          <p>
            如果你想找的是一個先講人話、再講氛圍的包場空間，這裡就是為這件事準備的。
          </p>

          <blockquote
            className="border-l-4 pl-6 my-8 italic text-lg"
            style={{ borderColor: "var(--accent-pink)", color: "var(--text-muted)" }}
          >
            「先把需求講清楚，場地才有機會真的幫到你。」
          </blockquote>
        </div>
      </div>
    </section>
  );
}

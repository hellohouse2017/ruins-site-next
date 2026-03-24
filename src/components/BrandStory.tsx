"use client";

import Image from "next/image";

export function BrandStory() {
  return (
    <section className="py-20 px-4 fade-in-section" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: "var(--text-primary)" }}>
          廢墟的故事
        </h2>

        <div className="space-y-6 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
            <div className="relative h-80 rounded-2xl overflow-hidden">
              <Image
                src="/images/venue-outdoor-vibe.jpg"
                alt="Ruins Bar 廢墟酒吧外觀"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--accent-pink)" }}>
                Ruins Bar 廢墟
              </h3>
              <p>
                位於高雄市鹽埕區瀨南街 205 號，前身是民國四十年（1951年）創立的「致美齋飯店」，曾是高雄最氣派的宴客場所之一。時過境遷，這棟日治時期紅磚建築歷經「振聲無線電傳習所」的短暫進駐後，荒廢了整整三十年，一度成為當地人口中的「鬼屋」。
              </p>
            </div>
          </div>

          <p>
            直到攝影師<strong style={{ color: "var(--text-primary)" }}>高堂祐</strong>出現。他說：「透過鏡頭，我看到老屋的美和一切的可能。」於是他掏盡積蓄買下這棟老屋，一層層剝去殘破的牆面，讓日治時期的紅磚外露，展露時光洗鍊過的滄桑韻味。屋頂的雀榕恣意生長，樹根順著牆面向下蔓延攀爬，維持老屋與榕樹的相依共生。
          </p>

          <p>
            我們從咖啡廳起步，白天沖煮手沖、氣泡飲，夜晚化身調酒吧，同時累積了大量婚禮錄影、活動企劃、派對執行的實戰經驗。這些年來，我們發現客人真正需要的，不只是一個空間 —— 而是一支懂餐飲、懂氛圍、懂攝影、懂流程的團隊，幫他們把想像變成現實。
          </p>

          <p>
            於是我們做了決定：<strong style={{ color: "var(--text-primary)" }}>全面轉型為專業活動場地</strong>。把多年咖啡、酒吧、婚錄的經驗化為養分，打造更貼近需求的整合式服務。從場地佈置到餐飲規劃，從攝影紀錄到活動流程，每一個環節都由我們自己的團隊一手包辦。
          </p>

          <blockquote
            className="border-l-4 pl-6 my-8 italic text-lg"
            style={{ borderColor: "var(--accent-pink)", color: "var(--text-muted)" }}
          >
            「因為走過每一步，所以更知道怎麼幫你走好這一步。」
          </blockquote>
        </div>
      </div>
    </section>
  );
}

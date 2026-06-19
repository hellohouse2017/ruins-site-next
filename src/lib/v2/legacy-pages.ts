import type { ScenarioId } from "@/types/v2";

export interface LegacyPlanFaq {
  q: string;
  a: string;
}

export interface LegacyPlanPageConfig {
  slug: string;
  scenarioId: ScenarioId;
  title: string;
  shortName: string;
  heroSummary: string;
  intro: string;
  coverImage?: string;
  faqs: LegacyPlanFaq[];
}

export const legacyPlanPages: Record<string, LegacyPlanPageConfig> = {
  proposal: {
    slug: "proposal",
    scenarioId: "proposal",
    title: "求婚活動",
    shortName: "求婚活動",
    heroSummary: "驚喜求婚、浪漫告白與小型儀式感活動，都能從場租、花藝、背板與拍照服務自由搭配。",
    intro:
      "求婚類型的預約，建議先確認日期與場地時段，再從花束、客製燈條、拍照背板與氣球佈置挑出適合的畫面配置。",
    faqs: [
      {
        q: "求婚可以提前進場佈置嗎？",
        a: "可以，通常會把佈置時間一起納入整體流程安排；若需要更長前置時間，可直接加時。",
      },
      {
        q: "可以自帶戒指與驚喜橋段嗎？",
        a: "可以，流程內容可由你自行安排，我們主要協助場地、佈置與現場服務配合。",
      },
    ],
  },
  wedding: {
    slug: "wedding",
    scenarioId: "wedding",
    title: "婚禮活動",
    shortName: "婚禮活動",
    heroSummary: "證婚、婚禮派對與 After Party 可依賓客數、花藝需求與酒水形式彈性配置。",
    intro:
      "婚禮類型的預約，不再拆成舊式固定方案，而是以場地基本租金為核心，再搭配證婚花藝、主持、拍照、酒水與餐飲內容。",
    faqs: [
      {
        q: "婚禮活動適合多少人？",
        a: "依動線與桌椅配置不同，通常可支援中小型證婚與婚禮派對，詳細人數可依活動型態確認。",
      },
      {
        q: "證婚與派對可以安排在同一時段嗎？",
        a: "可以，常見做法是同一場次內完成證婚、拍照與派對流程，再依時間需求加時。",
      },
    ],
  },
  baby: {
    slug: "baby",
    scenarioId: "family",
    title: "家庭慶典",
    shortName: "家庭慶典",
    heroSummary: "抓周、性別派對、家庭聚餐與親友慶祝，都可以用同一個場地彈性安排。",
    intro:
      "家庭慶典的重點通常在人數舒適度、拍照畫面與餐飲形式，因此前台會先帶你看常用組合，再補上抓周道具、背板與餐飲加購。",
    faqs: [
      {
        q: "長輩與小朋友一起參加合適嗎？",
        a: "合適，現場可依人數與需求安排桌椅、動線與拍照區，兼顧家庭聚會的舒適度。",
      },
      {
        q: "抓周道具需要自備嗎？",
        a: "不一定，需要的話可以直接在加購項目中選用抓周道具組。",
      },
    ],
  },
  party: {
    slug: "party",
    scenarioId: "party",
    title: "派對包場",
    shortName: "派對包場",
    heroSummary: "生日、朋友聚會、主題派對或尾牙活動，可從場租、酒水、主持與音樂內容自由組合。",
    intro:
      "派對類型的預約以氣氛、酒水與流程節奏為主，前台推薦組合會先幫你快速抓到常見搭配，再往上加調酒、歌手或餐飲。",
    faqs: [
      {
        q: "可以只租場地自己辦派對嗎？",
        a: "可以，若你已有自己的活動內容，可直接從純場地或派對情境開始配置。",
      },
      {
        q: "酒水服務一定要搭調酒師嗎？",
        a: "不用，自助式無酒精與雞尾酒都可單獨加購；需要現場調酒再另外選駐場調酒方案。",
      },
    ],
  },
  meeting: {
    slug: "meeting",
    scenarioId: "business",
    title: "企業活動",
    shortName: "企業活動",
    heroSummary: "會議、簡報、講座、工作坊與品牌交流活動，都可以用 v2 流程直接試算場租與餐飲。",
    intro:
      "企業活動通常更在意場地時段、投影音響與餐盒安排，所以這類預約會優先呈現場地、桌椅、餐盒與飲品等可售單位。",
    faqs: [
      {
        q: "企業活動有投影和音響嗎？",
        a: "有，基本場租已含投影、音響與空調，若需要額外桌椅可再加購。",
      },
      {
        q: "可以安排餐盒或茶點嗎？",
        a: "可以，企業活動情境可直接搭配餐盒、點心與飲品加購。",
      },
    ],
  },
  rental: {
    slug: "rental",
    scenarioId: "venue",
    title: "純場地租借",
    shortName: "純場地租借",
    heroSummary: "只租空間，不綁固定組合；由你自己決定流程、內容與是否另外加購服務。",
    intro:
      "純場租是 v2 的核心商品之一。你可以只先確認時段與場地租金，再視需要補上桌椅、酒水、餐飲或其他現場服務。",
    faqs: [
      {
        q: "純場地可以另外補加購嗎？",
        a: "可以，純場地只是起點，後續仍可依活動內容補上餐飲、酒水或設備。",
      },
      {
        q: "純場租也只接一組客人嗎？",
        a: "是，同一時段仍維持只接待一組客人。",
      },
    ],
  },
  custom: {
    slug: "custom",
    scenarioId: "venue",
    title: "客製活動",
    shortName: "客製活動",
    heroSummary: "若活動形式比較特殊，可先從純場地時段開始，再由人工協助確認客製需求。",
    intro:
      "客製活動目前仍建議先送出基本預約需求，讓我們依日期、時段、人數與特殊需求再進一步整理細節與報價。",
    faqs: [
      {
        q: "客製活動一定要先有完整企劃嗎？",
        a: "不用，先提供日期、用途、人數與大方向，我們就能先判斷場地是否適合。",
      },
      {
        q: "特殊活動能不能直接線上下單？",
        a: "可以先建單保留需求，但若牽涉特殊器材、外部團隊或額外場佈，仍會由人工再確認。",
      },
    ],
  },
};

export function getLegacyPlanPage(slug: string): LegacyPlanPageConfig | null {
  return legacyPlanPages[slug] ?? null;
}

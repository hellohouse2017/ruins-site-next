import type { ScenarioId } from "@/types/v2";

export interface ScenarioPresentation {
  image: string;
  accentColor: string;
  suitableFor: string;
  eyebrow: string;
}

export const scenarioPresentationMap: Record<ScenarioId, ScenarioPresentation> = {
  proposal: {
    image: "/images/proposal-cover.jpg",
    accentColor: "#ff0055",
    suitableFor: "10-40 人",
    eyebrow: "浪漫儀式感",
  },
  wedding: {
    image: "/images/wedding-cover.jpg",
    accentColor: "#d4af37",
    suitableFor: "20-80 人",
    eyebrow: "證婚與婚禮派對",
  },
  party: {
    image: "/images/party-cover.jpg",
    accentColor: "#00f3ff",
    suitableFor: "15-60 人",
    eyebrow: "慶生與主題聚會",
  },
  family: {
    image: "/images/baby-cover.jpg",
    accentColor: "#ff6b9d",
    suitableFor: "10-50 人",
    eyebrow: "抓周與家庭慶典",
  },
  business: {
    image: "/images/meeting-cover.jpg",
    accentColor: "#6366f1",
    suitableFor: "10-40 人",
    eyebrow: "企業活動與講座",
  },
  venue: {
    image: "/images/venue-empty.jpg",
    accentColor: "#9ca3af",
    suitableFor: "5-80 人",
    eyebrow: "純場地租借",
  },
};

export function getScenarioPresentation(id: ScenarioId): ScenarioPresentation {
  return scenarioPresentationMap[id];
}

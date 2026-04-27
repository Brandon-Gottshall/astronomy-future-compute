export const initialState = {
  activeSection: "hero",
  selectedScenario: "shortest-path",
  selectedExternalityPath: "underwater",
  timelineYear: 2026,
  timelinePathway: "all",
  counterArenaPath: "underwater",
};
export const initialLiveState = { activeSection: "live-hero" };
export const RUBRIC_VISUAL_SUMMARIES = {
  topicSummary: {
    stat: "3",
    statLabel: "siting paths",
    takeaway: "The project compares land, underwater, and orbital compute as burden-shifting choices.",
    chips: ["Land", "Underwater", "Orbit"],
  },
  astronomyRelevance: {
    stat: "96%",
    statLabel: "LEO survey exposure risk",
    takeaway: "Astronomy both depends on compute and can be harmed by where future compute is placed.",
    chips: ["Rubin", "SKAO", "IAU CPS"],
  },
  futureImpact: {
    stat: "Near-term",
    statLabel: "land stays dominant",
    takeaway: "Underwater remains niche; orbital is the least mature and most consequential path.",
    chips: ["Maturity", "Reversibility", "Externality"],
  },
  recommendation: {
    stat: "1",
    statLabel: "main standard",
    takeaway: "Judge compute by which burdens it shifts and whose environment absorbs them.",
    chips: ["Improve land", "Limit underwater", "Scrutinize orbit"],
  },
};
export function reducer(state, action) {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.value };
    default:
      return state;
  }
}

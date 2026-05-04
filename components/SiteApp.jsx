"use client";

import { useReducer } from "react";
import { UNIFIED_SECTIONS } from "../lib/data";
import { reducer, initialState } from "./site/state";
import { useFadeIn, useScrollProgress, useSectionObserver } from "./site/hooks";
import { FloatingQR, ScrollProgressBar, StickyNav } from "./site/layout";
import {
  TheProblemSection,
  ThreePathwaysSection,
  AstronomyImpactSection,
  ButWhatAboutSection,
  RecommendationsSection,
  ReferencesSection,
} from "./site/atlas-sections";
import {
  LiveHero,
  StudentHeaderBlock,
  RubricProseBlock,
  LiveAstronomySection,
  LiveContextSection,
  ObservationalBridge,
  ComparisonMatrixBlock,
  LiveResponsesOverviewSection,
  LiveUnderwaterSection,
  LiveOrbitalSection,
  MilestonesBlock,
  LiveConclusionSection,
} from "./site/live-sections";
import SlideDeckSection from "./site/slide-deck-section";
import { SLIDE_VISUALS } from "./presentation/slide-visuals";

const UNIFIED_INITIAL_STATE = { ...initialState, activeSection: "live-hero" };

export function UnifiedApp() {
  const [state, dispatch] = useReducer(reducer, UNIFIED_INITIAL_STATE);
  const progress = useScrollProgress();
  useSectionObserver(dispatch, UNIFIED_SECTIONS);
  useFadeIn();
  return (
    <>
      <ScrollProgressBar progress={progress} />
      <LiveHero />
      <StickyNav sections={UNIFIED_SECTIONS} activeSection={state.activeSection} />
      <StudentHeaderBlock />
      <RubricProseBlock slotId="topic-summary" slotKey="topicSummary" />
      <RubricProseBlock slotId="astronomy-relevance" slotKey="astronomyRelevance" />
      <LiveAstronomySection />
      <LiveContextSection />
      <ObservationalBridge />
      <ComparisonMatrixBlock />
      <LiveResponsesOverviewSection />
      <LiveUnderwaterSection />
      <LiveOrbitalSection />
      <MilestonesBlock />
      <RubricProseBlock slotId="future-impact" slotKey="futureImpact" />
      <RubricProseBlock slotId="recommendation" slotKey="recommendation" />
      <LiveConclusionSection />
      <TheProblemSection state={state} dispatch={dispatch} />
      <ThreePathwaysSection state={state} dispatch={dispatch} />
      <AstronomyImpactSection />
      <ButWhatAboutSection state={state} dispatch={dispatch} />
      <RecommendationsSection />
      <SlideDeckSection />
      <ReferencesSection />
    </>
  );
}

export { FloatingQR, SLIDE_VISUALS };

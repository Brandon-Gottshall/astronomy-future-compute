"use client";

import { useReducer } from "react";
import { ATLAS_SECTIONS, LIVE_SECTIONS } from "../lib/data";
import { reducer, initialState, initialLiveState } from "./site/state";
import { useFadeIn, useScrollProgress, useSectionObserver } from "./site/hooks";
import { ScrollProgressBar, AppendixBanner, SubmissionPanel, PrintSubmissionLinks, StickyNav, FloatingQR } from "./site/layout";
import { FullViewportHero, TheProblemSection, ThreePathwaysSection, AstronomyImpactSection, ButWhatAboutSection, RecommendationsSection, ReferencesSection } from "./site/atlas-sections";
import { LiveHero, StudentHeaderBlock, RubricProseBlock, LiveAstronomySection, LiveContextSection, ObservationalBridge, ComparisonMatrixBlock, LiveResponsesOverviewSection, LiveUnderwaterSection, LiveOrbitalSection, MilestonesBlock, LiveConclusionSection, LiveReferencesSection } from "./site/live-sections";
import { SLIDE_VISUALS } from "./presentation/slide-visuals";

export function AtlasApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const progress = useScrollProgress();
  useSectionObserver(dispatch, ATLAS_SECTIONS);
  useFadeIn();
  return (
    <>
      <ScrollProgressBar progress={progress} />
      <AppendixBanner />
      <FullViewportHero />
      <SubmissionPanel mode="research" />
      <PrintSubmissionLinks />
      <StickyNav mode="atlas" sections={ATLAS_SECTIONS} activeSection={state.activeSection} />
      <TheProblemSection state={state} dispatch={dispatch} />
      <ThreePathwaysSection state={state} dispatch={dispatch} />
      <AstronomyImpactSection />
      <ButWhatAboutSection state={state} dispatch={dispatch} />
      <RecommendationsSection />
      <ReferencesSection />
      <FloatingQR />
    </>
  );
}

export function LiveApp() {
  const [state, dispatch] = useReducer(reducer, initialLiveState);
  const progress = useScrollProgress();
  useSectionObserver(dispatch, LIVE_SECTIONS);
  useFadeIn();
  return (
    <>
      <ScrollProgressBar progress={progress} />
      <LiveHero />
      <SubmissionPanel mode="main" />
      <PrintSubmissionLinks />
      <StickyNav mode="live" sections={LIVE_SECTIONS} activeSection={state.activeSection} />
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
      <LiveReferencesSection />
      <FloatingQR />
    </>
  );
}

export { FloatingQR, SLIDE_VISUALS };

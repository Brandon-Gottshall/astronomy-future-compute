"use client";

import { useEffect, useState } from "react";
import { DATA, COPY, PATHWAY_META, EFFECT_META } from "../../lib/data";
import { useQrDataUrl } from "./hooks";
import { Card, Badge, ToggleRow, PrintButton, PathwayPill, AnimatedCounter } from "./primitives";
import { EnergyGrowthChart, AstronomyImpactChart } from "./charts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function FullViewportHero() {
  return (
    <section id="hero" className="hero-viewport">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-6">
          Research appendix · evidence and externalities
        </Badge>
        <h1 className="text-white mb-4">{COPY.meta.title}</h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-6 leading-relaxed">
          {COPY.meta.subtitle}
        </p>
        <p className="text-base text-slate-400">
          {COPY.meta.authors.join(" & ")} · {COPY.meta.date}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 no-print">
          <PrintButton className="primary">Print research appendix</PrintButton>
          <Button asChild className="action-btn secondary">
            <a href="/">Open main paper</a>
          </Button>
          <Button asChild className="action-btn secondary">
            <a href="/presentation">Open printable slides</a>
          </Button>
        </div>
        <div className="mt-12 scroll-indicator text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto"
            width="32"
            height="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ===== SECTION: THE PROBLEM ===== */
export function TheProblemSection({ state, dispatch }) {
  const filteredTimeline = DATA.timeline.filter(
    (e) =>
      e.year <= state.timelineYear &&
      (state.timelinePathway === "all" || e.pathway === state.timelinePathway)
  );
  return (
    <section id="problem" className="section-wrap">
      <div className="fade-in">
        <h2 className="text-center mb-2">{COPY.atlas.problem.title}</h2>
        <p className="text-center text-slate-400 mb-10 max-w-2xl mx-auto">
          {COPY.atlas.problem.intro}
        </p>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <AnimatedCounter
          value="~415 TWh"
          label="Global data-center electricity"
          sub="2024 estimate"
        />
        <AnimatedCounter
          value="~4.4%"
          label="U.S. data-center share"
          sub="2023 electricity"
        />
        <AnimatedCounter
          value="~945 TWh"
          label="Global 2030 base case"
          sub="IEA projection"
        />
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-center">
        <div>
          <img
            src={DATA.images.datacenter}
            alt="Data center server room"
            loading="lazy"
            className="rounded-xl w-full h-64 object-cover bg-slate-800"
          />
        </div>
        <div>
          <p className="text-slate-300 text-lg leading-relaxed">
            {COPY.atlas.problem.body}
          </p>
        </div>
      </div>
      <div className="fade-in mb-12">
        <h3 className="mb-4 text-slate-300">{COPY.atlas.problem.chartTitle}</h3>
        <Card className="p-4">
          <EnergyGrowthChart />
          <p className="text-xs text-slate-500 mt-2 text-right">
            {DATA.chartData.energyGrowth.note}
          </p>
        </Card>
      </div>
      <div className="fade-in">
        <h3 className="mb-4 text-slate-300">{COPY.atlas.problem.timelineTitle}</h3>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Label className="text-sm text-slate-400">
            {COPY.atlas.problem.yearLabel}{" "}
            <strong className="text-white ml-1">{state.timelineYear}</strong>
          </Label>
          <Slider
            min="2015"
            max="2026"
            step={1}
            value={[state.timelineYear]}
            className="flex-1 min-w-[200px] accent-blue-500"
            onValueChange={([nextYear]) =>
              dispatch({
                type: "SET",
                key: "timelineYear",
                value: nextYear,
              })
            }
          />
          <ToggleRow
            value={state.timelinePathway}
            onChange={(v) =>
              dispatch({ type: "SET", key: "timelinePathway", value: v })
            }
            options={COPY.atlas.problem.timelineOptions}
          />
        </div>
        <div className="space-y-3">
          {filteredTimeline.map((e) => (
            <Card
              key={e.label + e.year}
              className="flex items-start gap-4 p-4"
            >
              <div className="text-sm font-bold text-slate-500 min-w-[3rem]">
                {e.year}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-white">{e.label}</span>
                  <PathwayPill pathway={e.pathway} />
                </div>
                <p className="text-sm text-slate-400">{e.note}</p>
              </div>
            </Card>
          ))}
          {filteredTimeline.length === 0 && (
            <p className="text-slate-500 text-center py-8">
              {COPY.atlas.problem.timelineEmpty}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ===== SECTION: THREE PATHWAYS ===== */
export function ThreePathwaysSection({ state, dispatch }) {
  const pkeys = ["land", "underwater", "orbital"];
  const imgs = [DATA.images.datacenter, DATA.images.underwater, DATA.images.orbital];
  const selScenario = DATA.scenarios.find((s) => s.id === state.selectedScenario);
  const extPath = state.selectedExternalityPath;
  return (
    <section id="pathways" className="section-wrap">
      <div className="fade-in">
        <h2 className="text-center mb-2">{COPY.atlas.pathways.title}</h2>
        <p className="text-center text-slate-400 mb-10 max-w-2xl mx-auto">
          {COPY.atlas.pathways.intro}
        </p>
      </div>

      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {pkeys.map((k, i) => {
          const p = DATA.pathways[k];
          return (
            <Card key={k} className="p-0 overflow-hidden">
              <img
                src={imgs[i]}
                alt={p.label}
                loading="lazy"
                className="pathway-img"
              />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <PathwayPill pathway={k} />
                  <Badge
                    className={
                      "text-xs " +
                      (p.evidenceMaturity === "High"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : p.evidenceMaturity === "Medium"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-rose-500/20 text-rose-400")
                    }
                  >
                    {p.evidenceMaturity} evidence
                  </Badge>
                </div>
                <h3 className="text-white mb-2">{p.label}</h3>
                <p className="text-sm text-slate-400 mb-3">{p.description}</p>
                <div className="text-xs text-slate-500">
                  <span className="text-emerald-400 font-medium">
                    {COPY.atlas.pathways.upsideLabel}{" "}
                  </span>
                  {p.strongestUpside}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  <span className="text-rose-400 font-medium">
                    {COPY.atlas.pathways.downsideLabel}{" "}
                  </span>
                  {p.strongestDownside}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  <span className="text-amber-400 font-medium">
                    {COPY.atlas.pathways.astronomyRiskLabel}{" "}
                  </span>
                  {p.astronomyRisk}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="fade-in mb-12">
        <h3 className="mb-4 text-slate-300">{COPY.atlas.pathways.scenarioTitle}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <ToggleRow
            value={state.selectedScenario}
            onChange={(v) =>
              dispatch({ type: "SET", key: "selectedScenario", value: v })
            }
            options={DATA.scenarios.map((s) => ({ value: s.id, label: s.label }))}
          />
        </div>
        {selScenario && (
          <Card
            className="p-5 border-l-4"
            style={{
              borderLeftColor: (PATHWAY_META[selScenario.winner] || PATHWAY_META.land)
                .border,
            }}
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-lg font-bold text-white">
                {COPY.atlas.pathways.scenarioResultLabel}
              </span>
              <PathwayPill pathway={selScenario.winner} />
            </div>
            <p className="text-slate-300">{selScenario.why}</p>
          </Card>
        )}
      </div>

      <div className="fade-in">
        <h3 className="mb-4 text-slate-300">{COPY.atlas.pathways.relocationTitle}</h3>
        <div className="mb-4">
          <ToggleRow
            label={COPY.atlas.pathways.relocationPathwayLabel}
            value={extPath}
            onChange={(v) =>
              dispatch({ type: "SET", key: "selectedExternalityPath", value: v })
            }
            options={COPY.atlas.pathways.relocationOptions}
          />
        </div>
        <Card className="p-5">
          <div className="space-y-3">
            {DATA.externalities.map((ext) => {
              const mapping = DATA.externalityMap[extPath][ext.id];
              const meta = EFFECT_META[mapping.level];
              return (
                <div key={ext.id} className="flex items-center gap-3">
                  <div className="w-44 text-sm text-slate-400 flex-shrink-0">
                    {ext.label}
                  </div>
                  <div className="flex-1 relative h-7 rounded-full overflow-hidden bg-white/5">
                    <div
                      className="bar-transition h-full rounded-full flex items-center pl-3"
                      style={{ width: meta.w, background: meta.bg }}
                    >
                      <span
                        className="text-xs font-semibold"
                        style={{ color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block w-72 text-xs text-slate-500 flex-shrink-0">
                    {mapping.note}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ===== SECTION: ASTRONOMY IMPACT ===== */
export function AstronomyImpactSection() {
  return (
    <section id="astronomy" className="section-wrap">
      <div className="fade-in">
        <h2 className="text-center mb-2">{COPY.atlas.astronomy.title}</h2>
        <p className="text-center text-slate-400 mb-10 max-w-2xl mx-auto">
          {COPY.atlas.astronomy.intro}
        </p>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-center">
        <div>
          <img
            src={DATA.images.observatory}
            alt="Observatory under stars"
            loading="lazy"
            className="rounded-xl w-full h-72 object-cover bg-slate-800"
          />
        </div>
        <div>
          <blockquote className="text-xl italic text-slate-300 border-l-4 border-amber-500 pl-5 mb-6">
            “{COPY.atlas.astronomy.quote}”
          </blockquote>
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-amber-400 mb-1">
                {COPY.atlas.astronomy.opticalTitle}
              </h3>
              <p className="text-sm text-slate-400">
                {COPY.atlas.astronomy.opticalBody}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-amber-400 mb-1">
                {COPY.atlas.astronomy.radioTitle}
              </h3>
              <p className="text-sm text-slate-400">
                {COPY.atlas.astronomy.radioBody}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-amber-400 mb-1">
                {COPY.atlas.astronomy.debrisTitle}
              </h3>
              <p className="text-sm text-slate-400">
                {COPY.atlas.astronomy.debrisBody}
              </p>
            </Card>
          </div>
        </div>
      </div>
      <div className="fade-in mb-12">
        <h3 className="mb-4 text-slate-300">{COPY.atlas.astronomy.chartTitle}</h3>
        <Card className="p-4">
          <AstronomyImpactChart />
        </Card>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatedCounter
          value="~20 TB/night"
          label="Rubin Observatory nightly data volume"
          sub="observatory scale"
        />
        <AnimatedCounter
          value=">700 PB/year"
          label="SKAO archive scale"
          sub="observatory scale"
        />
      </div>
      <p className="fade-in text-sm text-slate-500 text-center mt-4">
        {COPY.atlas.astronomy.note}
      </p>
    </section>
  );
}

/* ===== SECTION: BUT WHAT ABOUT ===== */
export function ButWhatAboutSection({ state, dispatch }) {
  const path = state.counterArenaPath;
  const arena = DATA.counterArena[path];
  return (
    <section id="objections" className="section-wrap">
      <div className="fade-in">
        <h2 className="text-center mb-2">{COPY.atlas.objections.title}</h2>
        <p className="text-center text-slate-400 mb-10 max-w-2xl mx-auto">
          {COPY.atlas.objections.intro}
        </p>
      </div>
      <div className="fade-in mb-6">
        <ToggleRow
          label={COPY.atlas.objections.pathwayLabel}
          value={path}
          onChange={(v) =>
            dispatch({ type: "SET", key: "counterArenaPath", value: v })
          }
          options={COPY.atlas.objections.pathwayOptions}
        />
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-rose-400 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
            {COPY.atlas.objections.objectionsHeading}
          </h3>
          <div className="space-y-3">
            {arena.objections.map((o, i) => (
              <Card key={i} className="p-4 border-l-4 border-rose-500/50">
                <p className="text-sm text-slate-300">{o}</p>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-emerald-400 mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {COPY.atlas.objections.robustHeading}
          </h3>
          <div className="space-y-3">
            {arena.survives.map((s, i) => (
              <Card key={i} className="p-4 border-l-4 border-emerald-500/50">
                <p className="text-sm text-slate-300">{s}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===== SECTION: RECOMMENDATIONS ===== */
export function RecommendationsSection() {
  const [atlasUrl, setAtlasUrl] = useState(null);
  useEffect(() => {
    setAtlasUrl(window.location.origin + window.location.pathname + "?mode=atlas");
  }, []);
  const qrDataUrl = useQrDataUrl(atlasUrl);
  return (
    <section id="recommendations" className="section-wrap">
      <div className="fade-in">
        <h2 className="text-center mb-2">{COPY.atlas.conclusions.title}</h2>
        <p className="text-center text-slate-400 mb-10 max-w-2xl mx-auto">
          {COPY.atlas.conclusions.intro}
        </p>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {DATA.recommendations.map((r, i) => (
          <Card key={i} className="p-6 text-center">
            <div className="text-4xl mb-3">{r.icon}</div>
            <h3 className="text-white mb-3">{r.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{r.body}</p>
          </Card>
        ))}
      </div>
      <div className="fade-in flex flex-col items-center gap-3">
        {qrDataUrl && <img alt="QR code" src={qrDataUrl} width="120" height="120" />}
        <p className="text-sm text-slate-500">
          {COPY.atlas.conclusions.scanPrompt}
        </p>
      </div>
    </section>
  );
}

/* ===== SECTION: REFERENCES ===== */
export function ReferencesSection() {
  const typeLabels = COPY.referenceTypeLabels;
  const typeOrder = ["official", "academic", "journalism", "industry", "uploaded", "rubric"];
  const grouped = {};
  DATA.sources.forEach((s) => {
    if (!grouped[s.type]) grouped[s.type] = [];
    grouped[s.type].push(s);
  });
  return (
    <section id="references" className="section-wrap">
      <div className="fade-in">
        <h2 className="text-center mb-2">{COPY.atlas.references.title}</h2>
        <p className="text-center text-slate-400 mb-10">
          {DATA.sources.length} sources across{" "}
          {typeOrder.filter((t) => grouped[t]).length} categories
        </p>
      </div>
      <div className="fade-in space-y-8">
        {typeOrder
          .filter((t) => grouped[t])
          .map((t) => (
            <div key={t}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-slate-300">{typeLabels[t] || t}</h3>
                <Badge className="bg-slate-700 text-slate-400">
                  {grouped[t].length}
                </Badge>
              </div>
              <div className="space-y-2">
                {grouped[t].map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-3 py-2 border-b border-slate-800"
                  >
                    <span className="text-xs text-slate-600 min-w-[3rem]">
                      {s.year}
                    </span>
                    <span className="text-sm text-slate-300 flex-1">
                      {s.label}
                    </span>
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ref-link text-xs flex-shrink-0"
                      >
                        {COPY.common.linkLabel}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-600 flex-shrink-0">
                        —
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
      <div className="fade-in mt-12 text-center text-sm text-slate-600">
        <p>{COPY.common.footer}</p>
      </div>
    </section>
  );
}

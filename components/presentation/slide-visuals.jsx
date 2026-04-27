"use client";

import { COPY } from "../../lib/copy.js";
import { EnergyGrowthChart, AstronomyImpactChart } from "../site/charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ACCENT_INDIGO = "rgba(99,102,241,0.55)";
const ACCENT_CYAN = "rgba(8,145,178,0.55)";
const ACCENT_SLATE = "rgba(100,116,139,0.55)";
const SLIDE_CARD_CLASS =
  "border-white/10 bg-white/[0.07] shadow-none backdrop-blur-2xl print:break-inside-avoid print:border-slate-300 print:bg-white print:backdrop-blur-none";

function StatCallout({ config = {} }) {
  const { stat, unit, source, accent = ACCENT_INDIGO, size = "lg" } = config;
  const statClass =
    size === "sm"
      ? "text-4xl lg:text-5xl"
      : size === "md"
      ? "text-5xl lg:text-6xl"
      : "text-6xl lg:text-7xl";
  return (
    <Card
      className={`${SLIDE_CARD_CLASS} border-t-4 border-t-[var(--slide-accent)]`}
      style={{ "--slide-accent": accent }}
    >
      <CardContent className="p-6 text-center lg:p-8">
        <div className={`${statClass} font-bold tracking-tight text-indigo-200`}>
          {stat}
        </div>
        {unit ? (
          <div className="text-base lg:text-lg text-slate-300 mt-3">{unit}</div>
        ) : null}
        {source ? (
          <div className="text-[10px] lg:text-xs uppercase tracking-widest text-slate-500 mt-4">
            {source}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function StatPair({ config = {} }) {
  const { left = {}, right = {}, connector } = config;
  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-6">
      <div className="flex-1">
        <StatCallout config={left} />
      </div>
      {connector ? (
        <div className="flex items-center justify-center text-lg lg:text-xl uppercase tracking-widest text-slate-500 font-semibold">
          {connector}
        </div>
      ) : null}
      <div className="flex-1">
        <StatCallout config={right} />
      </div>
    </div>
  );
}

function StatTrio({ config = {} }) {
  const items = Array.isArray(config.items) ? config.items : [];
  const accent = config.accent || ACCENT_CYAN;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <StatCallout
          key={i}
          config={{ ...item, accent: item.accent || accent, size: "md" }}
        />
      ))}
    </div>
  );
}

function HeroStat({ config = {} }) {
  const { stat, unit, source, accent = ACCENT_INDIGO } = config;
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div
        className="text-[clamp(8rem,20vw,16rem)] font-bold tracking-tight leading-none text-center text-indigo-200 [text-shadow:0_0_80px_var(--slide-accent)]"
        style={{
          "--slide-accent": accent,
        }}
      >
        {stat}
      </div>
      {unit ? (
        <div className="text-xl lg:text-3xl text-slate-100 max-w-4xl text-center leading-snug">
          {unit}
        </div>
      ) : null}
      {source ? (
        <div className="text-xs lg:text-sm uppercase tracking-widest text-slate-500">
          {source}
        </div>
      ) : null}
    </div>
  );
}

function TimelineStrip({ config = {} }) {
  const events = Array.isArray(config.events) ? config.events : [];
  return (
    <Card className={SLIDE_CARD_CLASS}>
      <CardContent className="p-6 lg:p-8">
        <div className="relative flex justify-between items-start gap-3">
          <div
            className="absolute left-0 right-0 top-2 h-0.5 bg-[linear-gradient(90deg,rgba(99,102,241,0.15),rgba(99,102,241,0.55),rgba(99,102,241,0.15))]"
            aria-hidden="true"
          />
          {events.map((event, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center flex-1 z-10"
            >
              <div className="h-4 w-4 rounded-full bg-indigo-400 shadow-[0_0_0_4px_rgba(15,23,42,1)]" />
              <div className="mt-4 text-base lg:text-lg font-semibold text-indigo-300">
                {event.date}
              </div>
              <div className="mt-2 text-sm lg:text-base text-slate-200 text-center max-w-[20ch] leading-snug">
                {event.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PathwaysGrid() {
  const p = COPY.dataCopy.pathways;
  const entries = [
    { key: "land", label: COPY.presentation.pathwayLabels.land, accent: ACCENT_SLATE, data: p.land },
    { key: "underwater", label: COPY.presentation.pathwayLabels.underwater, accent: ACCENT_CYAN, data: p.underwater },
    { key: "orbital", label: COPY.presentation.pathwayLabels.orbital, accent: ACCENT_INDIGO, data: p.orbital },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {entries.map((e) => (
        <Card
          key={e.key}
          className={`${SLIDE_CARD_CLASS} border-t-4 border-t-[var(--slide-accent)]`}
          style={{ "--slide-accent": e.accent }}
        >
          <CardContent className="p-5">
            <h3 className="text-xl lg:text-2xl font-semibold text-slate-100 mb-4">
              {e.label}
            </h3>
            <div className="text-[10px] lg:text-xs uppercase tracking-widest text-slate-500 mb-1">
              {COPY.presentation.visualLabels.strength}
            </div>
            <p className="text-sm lg:text-base text-slate-200 mb-4">
              {e.data.strongestUpside}
            </p>
            <div className="text-[10px] lg:text-xs uppercase tracking-widest text-slate-500 mb-1">
              {COPY.presentation.visualLabels.mainConstraint}
            </div>
            <p className="text-sm lg:text-base text-slate-200 mb-4">
              {e.data.strongestDownside}
            </p>
            <div className="text-[10px] lg:text-xs uppercase tracking-widest text-slate-500 mb-1">
              {COPY.presentation.visualLabels.astronomy}
            </div>
            <Badge
              className="rounded-full border-transparent bg-[var(--slide-accent)] px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-[var(--slide-accent)] lg:text-sm"
              style={{ "--slide-accent": e.accent }}
            >
              {e.data.astronomyRisk}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecommendationsGrid() {
  const recs = COPY.dataCopy.recommendations || [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {recs.map((r, i) => (
        <Card key={i} className={SLIDE_CARD_CLASS}>
          <CardContent className="p-5 lg:p-6">
            <div className="text-4xl lg:text-5xl mb-3">{r.icon}</div>
            <h3 className="text-base lg:text-lg font-semibold text-slate-100 mb-2">
              {r.title}
            </h3>
            <p className="text-sm lg:text-base text-slate-300 leading-relaxed">
              {r.body}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StageComparisonMatrix() {
  const m = COPY.rubric.comparisonMatrix;
  return (
    <Card className={`${SLIDE_CARD_CLASS} overflow-hidden p-0`}>
      <Table className="w-full border-collapse text-sm lg:text-base">
        <TableHeader>
          <TableRow className="border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-900/60">
            <TableHead className="h-auto border-b border-slate-800 p-3 text-left font-semibold text-slate-300 lg:p-4">
              {m.axisHeader}
            </TableHead>
            {m.columns.map((c) => (
              <TableHead
                key={c}
                className="h-auto border-b border-slate-800 p-3 text-left font-semibold text-slate-300 lg:p-4"
              >
                {c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {m.rows.map((row) => (
            <TableRow
              key={row.axis}
              className="border-slate-800 hover:bg-transparent"
            >
              <TableCell className="p-3 align-top font-medium text-slate-200 lg:p-4">
                {row.axis}
              </TableCell>
              <TableCell className="p-3 align-top text-slate-300 lg:p-4">
                {row.land}
              </TableCell>
              <TableCell className="p-3 align-top text-slate-300 lg:p-4">
                {row.underwater}
              </TableCell>
              <TableCell className="p-3 align-top text-slate-300 lg:p-4">
                {row.orbital}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function BridgeDiagram() {
  const b = COPY.live.bridge;
  const steps = b.steps || [];
  return (
    <Card className={SLIDE_CARD_CLASS}>
      <CardContent className="p-5 lg:p-6">
        <div className="flex flex-col xl:flex-row xl:items-stretch gap-2 xl:gap-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex flex-col xl:flex-row xl:items-stretch gap-2 xl:gap-3 xl:flex-1 xl:min-w-0"
            >
              <div className="rounded-lg border-l-[3px] border-indigo-500/60 bg-indigo-500/10 p-3 xl:flex-1 xl:min-w-0 lg:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="h-6 w-6 flex-none justify-center rounded-full border border-indigo-500/45 bg-indigo-500/20 p-0 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 lg:text-sm">
                    {i + 1}
                  </Badge>
                  <span className="text-sm lg:text-base font-semibold text-slate-100">
                    {step.label}
                  </span>
                </div>
                <p className="text-xs lg:text-sm text-slate-400 leading-relaxed">
                  {step.body}
                </p>
              </div>
              {i < steps.length - 1 ? (
                <div
                  className="flex flex-none items-center justify-center text-2xl text-indigo-500/60 lg:text-3xl"
                  aria-hidden="true"
                >
                  <span className="xl:hidden">↓</span>
                  <span className="hidden xl:inline">→</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const SLIDE_VISUALS = {
  energyGrowth: EnergyGrowthChart,
  astronomyImpact: AstronomyImpactChart,
  comparisonMatrix: StageComparisonMatrix,
  statCallout: StatCallout,
  statPair: StatPair,
  statTrio: StatTrio,
  heroStat: HeroStat,
  timelineStrip: TimelineStrip,
  pathwaysGrid: PathwaysGrid,
  recommendationsGrid: RecommendationsGrid,
  bridgeDiagram: BridgeDiagram,
};

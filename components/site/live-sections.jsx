"use client";

import { DATA, COPY, LIVE_REFERENCE_IDS, LIVE_RESPONSE_ROWS, LIVE_UNDERWATER_PROS, LIVE_UNDERWATER_LIMITS, LIVE_ORBITAL_PROS, LIVE_ORBITAL_LIMITS, LIVE_CONCLUSIONS } from "../../lib/data";
import { cn, plainText, shortCopy, splitParagraphs, wordCount, modeHref } from "./utils";
import { useDraftMode } from "./hooks";
import { Card, Badge, PrintButton, PathwayPill, AnimatedCounter } from "./primitives";
import { EnergyGrowthChart, AstronomyImpactChart } from "./charts";
import { RUBRIC_VISUAL_SUMMARIES } from "./state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function LiveHero() {
  const heroDek = shortCopy(COPY.live.hero.dek, 170);
  return (
    <section id="live-hero" className="hero-viewport">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>
      <div className="relative z-10 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-4xl mx-auto">
          <div className="text-xs md:text-sm font-semibold uppercase tracking-widest text-amber-300 mb-4">
            {COPY.live.hero.eyebrow}
          </div>
          <h1 className="text-white mb-4">{COPY.live.hero.title}</h1>
          <p className="text-xl md:text-2xl text-slate-200 mb-5 leading-relaxed">
            {COPY.live.hero.subtitle}
          </p>
          {COPY.live.hero.dek ? (
            <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto mb-6 leading-relaxed">
              {heroDek}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-3 mb-10 no-print">
            <Button asChild className="action-btn primary">
              <a href="#student-header">Start reading</a>
            </Button>
            <PrintButton className="secondary">Print main paper</PrintButton>
            <Button asChild className="action-btn secondary">
              <a href="/research">Research appendix</a>
            </Button>
            <Button asChild className="action-btn secondary">
              <a href="/presentation">Printable slides</a>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {COPY.live.hero.cards.map((card, i) => {
            const borderClasses = [
              "border-amber-500/60",
              "border-cyan-500/60",
              "border-indigo-500/60",
            ];
            const titleClasses = [
              "text-amber-300",
              "text-cyan-300",
              "text-indigo-300",
            ];
            return (
              <Card
                key={card.title}
                className={"p-5 border-l-4 " + borderClasses[i]}
              >
                <h3 className={titleClasses[i] + " mb-2"}>{card.title}</h3>
                <p className="text-sm text-slate-300">{shortCopy(card.body, 130)}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LiveAstronomySection() {
  return (
    <section id="live-need" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.need.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {shortCopy(COPY.live.need.intro, 150)}
        </p>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <AnimatedCounter
          value="~20 TB/night"
          label="Rubin Observatory nightly data volume"
          sub="survey-scale data processing"
        />
        <AnimatedCounter
          value=">700 PB/year"
          label="SKAO archive scale"
          sub="archive-scale data management"
        />
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-5">
        {COPY.live.need.cards.map((card) => (
          <Card key={card.title} className="p-5 h-full">
            <h3 className="text-white mb-2">{card.title}</h3>
            <p className="text-sm text-slate-300">{shortCopy(card.body, 120)}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function LiveContextSection() {
  return (
    <section id="live-context" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.context.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {shortCopy(COPY.live.context.intro, 150)}
        </p>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <AnimatedCounter
          value="~415 TWh"
          label="Global data-center electricity"
          sub="2024 estimate"
        />
        <AnimatedCounter
          value="~7% to >30%"
          label="Cooling share of facility energy"
          sub="depending on facility type"
        />
        <AnimatedCounter
          value="~800B liters"
          label="Estimated U.S. indirect water footprint"
          sub="2023 estimate"
        />
      </div>
      <div className="fade-in grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-6 items-start">
        <Card className="p-4">
          <h3 className="text-slate-200 mb-3">
            {COPY.live.context.baselineTitle}
          </h3>
          <EnergyGrowthChart />
          <p className="text-xs text-slate-500 mt-2 text-right">
            {DATA.chartData.energyGrowth.note}
          </p>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-slate-200 mb-2">
              {COPY.live.context.astronomyCardTitle}
            </h3>
            <p className="text-sm text-slate-300">
              {shortCopy(COPY.live.context.astronomyCardBody, 115)}
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="text-slate-200 mb-2">
              {COPY.live.context.comparisonCardTitle}
            </h3>
            <p className="text-sm text-slate-300">
              {shortCopy(COPY.live.context.comparisonCardBody, 115)}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function LiveResponsesOverviewSection() {
  return (
    <section id="live-responses" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.responses.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {shortCopy(COPY.live.responses.intro, 135)}
        </p>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {["land", "underwater", "orbital"].map((k) => {
          const p = DATA.pathways[k];
          return (
            <Card key={k} className="p-5 h-full">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
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
              <p className="text-sm text-slate-400 mb-3">{shortCopy(p.description, 110)}</p>
              <p className="text-xs text-slate-500">
                <span className="text-emerald-400 font-medium">
                  {COPY.live.responses.bestCaseLabel}
                </span>{" "}
                {p.strongestUpside}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                <span className="text-rose-400 font-medium">
                  {COPY.live.responses.mainConstraintLabel}
                </span>{" "}
                {p.strongestDownside}
              </p>
            </Card>
          );
        })}
      </div>
      <div className="fade-in">
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-900/60 border-slate-800 hover:bg-slate-900/60">
                <TableHead className="p-4 text-slate-300 font-semibold">
                  {COPY.live.responses.tableHeader}
                </TableHead>
                <TableHead className="p-4 text-slate-300 font-semibold">Land</TableHead>
                <TableHead className="p-4 text-slate-300 font-semibold">Underwater</TableHead>
                <TableHead className="p-4 text-slate-300 font-semibold">Orbital</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LIVE_RESPONSE_ROWS.map((row) => (
                <TableRow key={row.label} className="border-slate-800 hover:bg-slate-900/40">
                  <TableCell className="p-4 text-slate-300 font-medium">
                    {row.label}
                  </TableCell>
                  <TableCell className="p-4 text-slate-400">{row.land}</TableCell>
                  <TableCell className="p-4 text-slate-400">{row.underwater}</TableCell>
                  <TableCell className="p-4 text-slate-400">{row.orbital}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <p className="text-sm text-slate-500 mt-3">
          {COPY.live.responses.note}
        </p>
      </div>
    </section>
  );
}

export function LiveBulletList({ items, borderClass }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Card key={i} className={cn("p-4 border-l-4 compact-evidence-card", borderClass)}>
          <p className="text-sm text-slate-200">{shortCopy(item, 115)}</p>
          {plainText(item) !== shortCopy(item, 115) ? (
            <details className="detail-drawer mt-3">
              <summary>Detail</summary>
              <p>{item}</p>
            </details>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

export function LiveUnderwaterSection() {
  return (
    <section id="live-underwater" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.underwater.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {shortCopy(COPY.live.underwater.intro, 145)}
        </p>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <AnimatedCounter
          value="1/8 failure rate"
          label="Natick Phase 2 vs land control"
          sub="reported after retrieval"
        />
        <AnimatedCounter
          value="~1.1 PUE"
          label="Hainan claimed operating PUE"
          sub="repeated public claim"
        />
        <AnimatedCounter
          value="≤ 1.15"
          label="Lingang design PUE target"
          sub="official design target"
        />
      </div>
      <div className="fade-in grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div>
          <h3 className="text-emerald-400 mb-4">
            {COPY.live.underwater.prosTitle}
          </h3>
          <LiveBulletList
            items={LIVE_UNDERWATER_PROS}
            borderClass="border-emerald-500/50"
          />
        </div>
        <div>
          <h3 className="text-rose-400 mb-4">
            {COPY.live.underwater.limitsTitle}
          </h3>
          <LiveBulletList
            items={LIVE_UNDERWATER_LIMITS}
            borderClass="border-rose-500/50"
          />
        </div>
      </div>
      <div className="fade-in mt-6">
        <Card className="p-5 bg-cyan-500/10 border-cyan-500/25">
          <h3 className="text-cyan-300 mb-2">
            {COPY.live.underwater.astronomyTitle}
          </h3>
          <p className="text-sm text-slate-300">
            {shortCopy(COPY.live.underwater.astronomyBody, 130)}
          </p>
        </Card>
      </div>
    </section>
  );
}

export function LiveOrbitalSection() {
  return (
    <section id="live-orbital" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.orbital.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {shortCopy(COPY.live.orbital.intro, 145)}
        </p>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <AnimatedCounter
          value="Up to 88,000 sats"
          label="Starcloud filing scale"
          sub="accepted for filing, not approved"
        />
        <AnimatedCounter
          value="500–2,000 km"
          label="Proposed orbital envelope"
          sub="LEO / SSO mix"
        />
        <AnimatedCounter
          value="12 satellites"
          label="Three-Body first launch"
          sub="2025 reported launch"
        />
      </div>
      <div className="fade-in grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-6">
        <div>
          <h3 className="text-emerald-400 mb-4">
            {COPY.live.orbital.prosTitle}
          </h3>
          <LiveBulletList
            items={LIVE_ORBITAL_PROS}
            borderClass="border-emerald-500/50"
          />
        </div>
        <div>
          <h3 className="text-rose-400 mb-4">
            {COPY.live.orbital.limitsTitle}
          </h3>
          <LiveBulletList
            items={LIVE_ORBITAL_LIMITS}
            borderClass="border-rose-500/50"
          />
        </div>
      </div>
      <div className="fade-in grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-6 items-start">
        <Card className="p-4">
          <h3 className="text-slate-200 mb-3">{COPY.live.orbital.chartTitle}</h3>
          <AstronomyImpactChart />
        </Card>
        <div className="space-y-4">
          <Card className="p-5 bg-indigo-500/10 border-indigo-500/25">
            <h3 className="text-indigo-300 mb-2">
              {COPY.live.orbital.cardOneTitle}
            </h3>
            <p className="text-sm text-slate-300">
              {shortCopy(COPY.live.orbital.cardOneBody, 155)}
            </p>
            <details className="detail-drawer mt-3">
              <summary>Detail</summary>
              <p>{COPY.live.orbital.cardOneBody}</p>
            </details>
          </Card>
          <Card className="p-5">
            <h3 className="text-slate-200 mb-2">
              {COPY.live.orbital.cardTwoTitle}
            </h3>
            <p className="text-sm text-slate-300">
              {shortCopy(COPY.live.orbital.cardTwoBody, 140)}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function LiveConclusionSection() {
  return (
    <section id="live-conclusion" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.conclusion.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {shortCopy(COPY.live.conclusion.intro, 165)}
        </p>
      </div>
      {LIVE_CONCLUSIONS && LIVE_CONCLUSIONS.length > 0 ? (
        <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {LIVE_CONCLUSIONS.map((item, i) => (
            <Card key={i} className="p-5 h-full">
              <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
            </Card>
          ))}
        </div>
      ) : null}
      <div className="fade-in grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-6 items-start">
        <Card className="p-6 bg-amber-500/10 border-amber-500/25">
          <h3 className="text-amber-300 mb-3">
            {COPY.live.conclusion.bestFitTitle}
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {shortCopy(COPY.live.conclusion.bestFitBody, 140)}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-slate-200 mb-3">
            {COPY.live.conclusion.atlasTitle}
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            {shortCopy(COPY.live.conclusion.atlasBody, 120)}
          </p>
          <Button asChild className="toggle-btn active">
            <a href={modeHref("atlas", "pathways")}>
              {COPY.common.openResearchAtlas}
            </a>
          </Button>
        </Card>
      </div>
    </section>
  );
}

export function LiveReferencesSection() {
  // Foreground only external URL-bearing sources in the public reference
  // list. Uploaded rubric packets, internal memos, and local-only files are
  // preserved in the Research Appendix bibliography instead.
  const EXTERNAL_ONLY_TYPES = new Set(["official", "academic", "journalism", "industry"]);
  const refs = LIVE_REFERENCE_IDS.map((id) =>
    DATA.sources.find((s) => s.id === id)
  )
    .filter(Boolean)
    .filter((s) => s.url && EXTERNAL_ONLY_TYPES.has(s.type));
  return (
    <section id="live-references" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.references.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {COPY.live.references.intro}
        </p>
      </div>
      <div className="fade-in space-y-3 mb-8">
        {refs.map((s) => (
          <Card key={s.id} className="p-4 flex items-start gap-3">
            <span className="text-xs text-slate-600 min-w-[3rem]">{s.year}</span>
            <div className="flex-1">
              <div className="text-sm text-slate-200">{s.label}</div>
              <div className="text-xs text-slate-500 mt-1">{s.type}</div>
            </div>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="ref-link text-xs"
              >
                {COPY.common.linkLabel}
              </a>
            ) : (
              <span className="text-xs text-slate-600">
                {COPY.common.localLabel}
              </span>
            )}
          </Card>
        ))}
      </div>
      <p className="fade-in text-center text-sm text-slate-500">
        {COPY.live.references.footer}
      </p>
    </section>
  );
}

/* ===== RUBRIC-FACING BLOCKS ===== */

export function StudentHeaderBlock() {
  const h = COPY.rubric.studentHeader;
  const m = COPY.meta;
  const draft = useDraftMode();
  const studentName = (m.studentName || "").trim();
  const authorsFromMeta = Array.isArray(m.authors) ? m.authors.join(" & ") : "";
  const authorDisplay = studentName
    ? studentName
    : authorsFromMeta ||
      (draft ? "Student name — add before submission" : "—");
  return (
    <section id="student-header" className="section-wrap">
      <div className="fade-in">
        <Card className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
            <div>
              <dt className="text-xs uppercase tracking-widest text-slate-500 mb-1">{h.authorsLabel}</dt>
              <dd className="text-slate-200">{authorDisplay}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-slate-500 mb-1">{h.classLabel}</dt>
              <dd className="text-slate-200">{m.course}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-slate-500 mb-1">{h.assignmentLabel}</dt>
              <dd className="text-slate-200">{m.assignment}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-slate-500 mb-1">{h.dateLabel}</dt>
              <dd className="text-slate-200">{m.date}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </section>
  );
}

export function RubricProseBlock({ slotId, slotKey }) {
  const slot = COPY.rubric[slotKey];
  const draft = useDraftMode();
  const body = typeof slot.body === "string" ? slot.body.trim() : "";
  const paragraphs = splitParagraphs(body);
  const summary = RUBRIC_VISUAL_SUMMARIES[slotKey];
  const hasBody =
    body.length > 0 &&
    !body.startsWith("__STUDENT_"); // legacy sentinel guard
  return (
    <section id={slotId} className="section-wrap">
      <div className="fade-in">
        {slot.tag ? (
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {slot.tag}
            </span>
          </div>
        ) : null}
        <h2 className="mb-4">{slot.title}</h2>
        {hasBody ? (
          <>
            <div className="rubric-brief-grid">
              <Card className="p-6 rubric-stat-card">
                <div className="rubric-stat">{summary?.stat || "Key"}</div>
                <div className="rubric-stat-label">{summary?.statLabel || "point"}</div>
              </Card>
              <Card className="p-6 rubric-takeaway-card">
                <div className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-2">
                  Short version
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {summary?.takeaway || shortCopy(body, 180)}
                </p>
                {summary?.chips?.length ? (
                  <div className="rubric-chip-row">
                    {summary.chips.map((chip) => (
                      <span key={chip} className="rubric-chip">
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Card>
            </div>
            <details className="detail-drawer rubric-prose-drawer">
              <summary>Read full written section ({wordCount(body)} words)</summary>
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </details>
            <div className="print-only rubric-print-prose">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </>
        ) : draft ? (
          <Card className="border-2 border-dashed border-indigo-500/45 bg-indigo-500/5 p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-indigo-300 mb-2">
              Author prompt · draft mode
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {slot.authorPrompt}
            </p>
          </Card>
        ) : (
          <Card className="p-5">
            <p className="text-sm text-slate-400 italic">
              {COPY.rubric.publicEmptyBanner}
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}

export function ObservationalBridge() {
  const b = COPY.live.bridge;
  return (
    <section id="observational-bridge" className="section-wrap">
      <div className="fade-in text-center mb-6">
        <h2 className="mb-2">{b.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">{b.intro}</p>
      </div>
      <div className="fade-in">
        <ol className="grid gap-3 [counter-reset:bridge-step] [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] list-none p-0 m-0">
          {b.steps.map((step, i) => (
            <li key={step.label} className="[counter-increment:bridge-step]">
              <Card className="p-4 relative border-l-[3px] border-l-indigo-500/55 h-full">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="h-6 w-6 justify-center rounded-full border border-indigo-500/45 bg-indigo-500/20 p-0 text-xs font-bold text-indigo-300">
                    {i + 1}
                  </Badge>
                  <span className="text-sm font-semibold text-slate-200">
                    {step.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.body}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function ComparisonMatrixBlock() {
  const m = COPY.rubric.comparisonMatrix;
  return (
    <section id="comparison-matrix" className="section-wrap">
      <div className="fade-in text-center mb-6">
        <h2 className="mb-2">{m.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">{m.intro}</p>
      </div>
      <div className="fade-in">
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-900/60 border-slate-800 hover:bg-slate-900/60">
                <TableHead className="text-left p-4 font-semibold text-slate-300">
                  {m.axisHeader}
                </TableHead>
                {m.columns.map((c) => (
                  <TableHead
                    key={c}
                    className="text-left p-4 font-semibold text-slate-300"
                  >
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {m.rows.map((row) => (
                <TableRow key={row.axis} className="border-slate-800 hover:bg-slate-900/40">
                  <TableCell className="p-4 text-slate-300 font-medium align-top">
                    {row.axis}
                  </TableCell>
                  <TableCell className="p-4 text-slate-400 align-top">{row.land}</TableCell>
                  <TableCell className="p-4 text-slate-400 align-top">
                    {row.underwater}
                  </TableCell>
                  <TableCell className="p-4 text-slate-400 align-top">{row.orbital}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </section>
  );
}

export function MilestonesBlock() {
  const m = COPY.rubric.milestones;
  return (
    <section id="milestones" className="section-wrap">
      <div className="fade-in text-center mb-6">
        <h2 className="mb-2">{m.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">{m.intro}</p>
      </div>
      <div className="fade-in space-y-3">
        {m.items.map((item, i) => (
          <Card key={i} className="p-4 flex items-start gap-4">
            <Badge className="bg-slate-800 text-slate-300 border border-slate-700 text-xs min-w-[5.5rem] justify-center">
              {item.year}
            </Badge>
            <p className="text-sm text-slate-300 leading-relaxed">
              {item.label}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

"use client";
// Direct port of the original Preact/htm site to React/JSX.
// Component names and structure mirror ASTRO Presentation Site.html one-to-one
// so copy edits map directly between the two files.

import { useEffect, useReducer, useRef, useState } from "react";
import {
  DATA,
  COPY,
  ATLAS_SECTIONS,
  LIVE_SECTIONS,
  LIVE_REFERENCE_IDS,
  LIVE_RESPONSE_ROWS,
  LIVE_UNDERWATER_PROS,
  LIVE_UNDERWATER_LIMITS,
  LIVE_ORBITAL_PROS,
  LIVE_ORBITAL_LIMITS,
  LIVE_CONCLUSIONS,
  PATHWAY_META,
  EFFECT_META,
} from "../lib/data";

/* ===== UTILITIES ===== */
function cn(...args) {
  return args.filter(Boolean).join(" ");
}
function modeHref(mode, anchor) {
  return "?mode=" + mode + (anchor ? "#" + anchor : "");
}

/* ===== STATE ===== */
const initialState = {
  activeSection: "hero",
  selectedScenario: "shortest-path",
  selectedExternalityPath: "underwater",
  timelineYear: 2026,
  timelinePathway: "all",
  counterArenaPath: "underwater",
};
const initialLiveState = { activeSection: "live-hero" };
function reducer(state, action) {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSection: action.value };
    default:
      return state;
  }
}

/* ===== HOOKS ===== */
function useSectionObserver(dispatch, sections) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            dispatch({ type: "SET_ACTIVE_SECTION", value: e.target.id });
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections, dispatch]);
}

function useQrDataUrl(url) {
  const [dataUrl, setDataUrl] = useState(null);
  useEffect(() => {
    if (!url) return;
    (async () => {
      const QR = (await import("qrcode")).default;
      const result = await QR.toDataURL(url, {
        width: 200,
        margin: 1,
        color: { dark: "#e2e8f0", light: "#00000000" },
      });
      setDataUrl(result);
    })();
  }, [url]);
  return dataUrl;
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    function handler() {
      const s = window.scrollY;
      const d = document.documentElement.scrollHeight - window.innerHeight;
      setP(d > 0 ? Math.min((s / d) * 100, 100) : 0);
    }
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return p;
}

function useFadeIn() {
  useEffect(() => {
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      document.querySelectorAll(".fade-in").forEach((el) => obs.observe(el));
    }, 120);
    return () => clearTimeout(t);
  }, []);
}

/* ===== UI PRIMITIVES ===== */
function Card({ className, children, style }) {
  return (
    <div className={cn("card p-6", className)} style={style}>
      {children}
    </div>
  );
}
function Badge({ className, children }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        className
      )}
    >
      {children}
    </span>
  );
}
function ToggleRow({ label, value, onChange, options }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && (
        <span className="text-sm font-medium text-slate-400 mr-2">{label}</span>
      )}
      {options.map((o) => (
        <button
          key={o.value}
          className={cn("toggle-btn", value === o.value && "active")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
function PathwayPill({ pathway }) {
  const m = PATHWAY_META[pathway] || PATHWAY_META.land;
  const label = DATA.pathways[pathway]
    ? DATA.pathways[pathway].short
    : pathway.charAt(0).toUpperCase() + pathway.slice(1);
  return (
    <span
      style={{ background: m.bg, color: m.text, border: "1px solid " + m.border }}
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
    >
      {label}
    </span>
  );
}

/* ===== ANIMATED COUNTER ===== */
function AnimatedCounter({ value, label, sub }) {
  const ref = useRef(null);
  const [displayed, setDisplayed] = useState("0");
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    const numMatch = value.match(/[\d,.]+/);
    if (!numMatch) {
      setDisplayed(value);
      return;
    }
    const target = parseFloat(numMatch[0].replace(/,/g, ""));
    const prefix = value.slice(0, value.indexOf(numMatch[0]));
    const suffix = value.slice(value.indexOf(numMatch[0]) + numMatch[0].length);
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplayed(prefix + current.toLocaleString() + suffix);
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplayed(value);
    }
    requestAnimationFrame(tick);
  }, [visible, value]);
  return (
    <div ref={ref} className="card rounded-3xl p-6 text-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        {sub}
      </div>
      <div className="mt-2 text-4xl font-bold tracking-tight text-white">
        {displayed}
      </div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </div>
  );
}

/* ===== CHARTS ===== */
function useChart(buildConfig, deps) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ChartMod = await import("chart.js/auto");
      if (cancelled || !canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();
      const ctx = canvasRef.current.getContext("2d");
      chartRef.current = new ChartMod.default(ctx, buildConfig());
    })();
    return () => {
      cancelled = true;
      if (chartRef.current) chartRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps || []);
  return canvasRef;
}

function EnergyGrowthChart() {
  const ref = useChart(() => ({
    type: "bar",
    data: {
      labels: DATA.chartData.energyGrowth.labels,
      datasets: [
        {
          label: "TWh",
          data: DATA.chartData.energyGrowth.values,
          backgroundColor: DATA.chartData.energyGrowth.labels.map((l) =>
            l.includes("*") ? "rgba(59,130,246,0.4)" : "rgba(59,130,246,0.8)"
          ),
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => c.parsed.y + " TWh" } },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Terawatt-hours (TWh)",
            color: "#94a3b8",
            font: { size: 14 },
          },
          ticks: { color: "#94a3b8", font: { size: 13 } },
          grid: { color: "rgba(148,163,184,0.1)" },
        },
        x: {
          ticks: { color: "#94a3b8", font: { size: 13 } },
          grid: { display: false },
        },
      },
    },
  }));
  return (
    <div style={{ height: 320 }}>
      <canvas ref={ref} />
    </div>
  );
}

function AstronomyImpactChart() {
  const ref = useChart(() => {
    const d = DATA.chartData.astronomyImpact;
    return {
      type: "bar",
      data: {
        labels: d.categories,
        datasets: [
          {
            label: "Land",
            data: d.land,
            backgroundColor: "rgba(100,116,139,0.7)",
            borderRadius: 4,
          },
          {
            label: "Underwater",
            data: d.underwater,
            backgroundColor: "rgba(8,145,178,0.7)",
            borderRadius: 4,
          },
          {
            label: "Orbital",
            data: d.orbital,
            backgroundColor: "rgba(79,70,229,0.85)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: { color: "#e2e8f0", font: { size: 14 }, padding: 20 },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: "Severity (0 = none, 10 = extreme)",
              color: "#94a3b8",
              font: { size: 13 },
            },
            ticks: { color: "#94a3b8", font: { size: 13 } },
            grid: { color: "rgba(148,163,184,0.1)" },
          },
          y: {
            ticks: { color: "#e2e8f0", font: { size: 14 } },
            grid: { display: false },
          },
        },
      },
    };
  });
  return (
    <div style={{ height: 280 }}>
      <canvas ref={ref} />
    </div>
  );
}

/* ===== SECTION: HERO ===== */
function FullViewportHero() {
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
function TheProblemSection({ state, dispatch }) {
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
            className="rounded-xl w-full h-64 object-cover"
            style={{ background: "#1e293b" }}
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
          <label className="text-sm text-slate-400">
            {COPY.atlas.problem.yearLabel}{" "}
            <strong className="text-white ml-1">{state.timelineYear}</strong>
          </label>
          <input
            type="range"
            min="2015"
            max="2026"
            value={state.timelineYear}
            className="flex-1 min-w-[200px] accent-blue-500"
            onChange={(e) =>
              dispatch({
                type: "SET",
                key: "timelineYear",
                value: parseInt(e.target.value),
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
function ThreePathwaysSection({ state, dispatch }) {
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
            <div key={k} className="card overflow-hidden">
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
            </div>
          );
        })}
      </div>

      <div className="fade-in mb-12">
        <h3 className="mb-4 text-slate-300">{COPY.atlas.pathways.scenarioTitle}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {DATA.scenarios.map((s) => (
            <button
              key={s.id}
              className={cn(
                "toggle-btn",
                state.selectedScenario === s.id && "active"
              )}
              onClick={() =>
                dispatch({ type: "SET", key: "selectedScenario", value: s.id })
              }
            >
              {s.label}
            </button>
          ))}
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
                  <div
                    className="flex-1 relative h-7 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
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
function AstronomyImpactSection() {
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
            className="rounded-xl w-full h-72 object-cover"
            style={{ background: "#1e293b" }}
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
function ButWhatAboutSection({ state, dispatch }) {
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
function RecommendationsSection() {
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
function ReferencesSection() {
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

/* ===== LIVE PRESENTATION PATH ===== */
function LiveHero() {
  return (
    <section id="live-hero" className="hero-viewport">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>
      <div className="relative z-10 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/25 mb-6">
            {COPY.meta.course} · {COPY.meta.assignment}
          </Badge>
          <h1 className="text-white mb-4">{COPY.live.hero.title}</h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-6 leading-relaxed">
            {COPY.live.hero.subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <a href="#live-need" className="toggle-btn active">
              {COPY.live.hero.primaryCta}
            </a>
            <a href={modeHref("atlas", "hero")} className="toggle-btn">
              {COPY.live.hero.secondaryCta}
            </a>
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
                <p className="text-sm text-slate-300">{card.body}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LiveAstronomySection() {
  return (
    <section id="live-need" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.need.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {COPY.live.need.intro}
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
            <p className="text-sm text-slate-300">{card.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function LiveContextSection() {
  return (
    <section id="live-context" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.context.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {COPY.live.context.intro}
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
              {COPY.live.context.astronomyCardBody}
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="text-slate-200 mb-2">
              {COPY.live.context.comparisonCardTitle}
            </h3>
            <p className="text-sm text-slate-300">
              {COPY.live.context.comparisonCardBody}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

function LiveResponsesOverviewSection() {
  return (
    <section id="live-responses" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.responses.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {COPY.live.responses.intro}
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
              <p className="text-sm text-slate-400 mb-3">{p.description}</p>
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
          <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr] bg-slate-900/60 text-sm font-semibold text-slate-300 border-b border-slate-800">
            <div className="p-4">{COPY.live.responses.tableHeader}</div>
            <div className="p-4">Land</div>
            <div className="p-4">Underwater</div>
            <div className="p-4">Orbital</div>
          </div>
          {LIVE_RESPONSE_ROWS.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[1.1fr_1fr_1fr_1fr] border-b border-slate-800 text-sm"
            >
              <div className="p-4 text-slate-300 font-medium">{row.label}</div>
              <div className="p-4 text-slate-400">{row.land}</div>
              <div className="p-4 text-slate-400">{row.underwater}</div>
              <div className="p-4 text-slate-400">{row.orbital}</div>
            </div>
          ))}
        </Card>
        <p className="text-sm text-slate-500 mt-3">
          {COPY.live.responses.note}
        </p>
      </div>
    </section>
  );
}

function LiveBulletList({ items, borderClass }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Card key={i} className={cn("p-4 border-l-4", borderClass)}>
          <p className="text-sm text-slate-300">{item}</p>
        </Card>
      ))}
    </div>
  );
}

function LiveUnderwaterSection() {
  return (
    <section id="live-underwater" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.underwater.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {COPY.live.underwater.intro}
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
            {COPY.live.underwater.astronomyBody}
          </p>
        </Card>
      </div>
    </section>
  );
}

function LiveOrbitalSection() {
  return (
    <section id="live-orbital" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.orbital.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {COPY.live.orbital.intro}
        </p>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <AnimatedCounter
          value="Up to 1,000,000 sats"
          label="SpaceX filing scale"
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
              {COPY.live.orbital.cardOneBody}
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="text-slate-200 mb-2">
              {COPY.live.orbital.cardTwoTitle}
            </h3>
            <p className="text-sm text-slate-300">
              {COPY.live.orbital.cardTwoBody}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

function LiveConclusionSection() {
  return (
    <section id="live-conclusion" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">{COPY.live.conclusion.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          {COPY.live.conclusion.intro}
        </p>
      </div>
      <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {LIVE_CONCLUSIONS.map((item, i) => (
          <Card key={i} className="p-5 h-full">
            <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
          </Card>
        ))}
      </div>
      <div className="fade-in grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-6 items-start">
        <Card className="p-6 bg-amber-500/10 border-amber-500/25">
          <h3 className="text-amber-300 mb-3">
            {COPY.live.conclusion.bestFitTitle}
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {COPY.live.conclusion.bestFitBody}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-slate-200 mb-3">
            {COPY.live.conclusion.atlasTitle}
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            {COPY.live.conclusion.atlasBody}
          </p>
          <a
            href={modeHref("atlas", "pathways")}
            className="toggle-btn active"
          >
            {COPY.common.openResearchAtlas}
          </a>
        </Card>
      </div>
    </section>
  );
}

function LiveReferencesSection() {
  const refs = LIVE_REFERENCE_IDS.map((id) =>
    DATA.sources.find((s) => s.id === id)
  ).filter(Boolean);
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
          <div key={s.id} className="card p-4 flex items-start gap-3">
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
          </div>
        ))}
      </div>
      <p className="fade-in text-center text-sm text-slate-500">
        {COPY.live.references.footer}
      </p>
    </section>
  );
}

/* ===== RUBRIC-FACING BLOCKS ===== */
function StudentHeaderBlock() {
  const h = COPY.rubric.studentHeader;
  const m = COPY.meta;
  return (
    <section id="student-header" className="section-wrap">
      <div className="fade-in">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6">
            <div>
              <h2 className="text-white mb-2">{h.title}</h2>
              <p className="text-slate-300 leading-relaxed">{h.subtitle}</p>
            </div>
            <dl className="text-sm text-slate-300 space-y-2 md:border-l md:border-slate-800 md:pl-6">
              <div className="flex gap-2">
                <dt className="text-slate-500 min-w-[5.5rem]">{h.authorsLabel}</dt>
                <dd className="text-slate-200">{m.authors.join(" & ")}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-slate-500 min-w-[5.5rem]">{h.classLabel}</dt>
                <dd className="text-slate-200">{m.course}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-slate-500 min-w-[5.5rem]">{h.assignmentLabel}</dt>
                <dd className="text-slate-200">{m.assignment}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-slate-500 min-w-[5.5rem]">{h.dateLabel}</dt>
                <dd className="text-slate-200">{m.date}</dd>
              </div>
            </dl>
          </div>
        </Card>
      </div>
    </section>
  );
}

function RubricProseBlock({ slotId, slotKey }) {
  const slot = COPY.rubric[slotKey];
  const isPlaceholder =
    typeof slot.body === "string" && slot.body.startsWith("__STUDENT_");
  return (
    <section id={slotId} className="section-wrap">
      <div className="fade-in">
        <div className="mb-3">
          <Badge className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-xs">
            {slot.corePill}
          </Badge>
        </div>
        <h2 className="mb-4">{slot.title}</h2>
        {isPlaceholder ? (
          <Card
            className="p-6"
            style={{
              border: "2px dashed rgba(148,163,184,0.45)",
              background: "rgba(148,163,184,0.05)",
            }}
          >
            <p className="text-sm text-slate-400 italic">
              {slot.placeholderHint}
            </p>
          </Card>
        ) : (
          <Card className="p-6">
            <p className="text-slate-200 leading-relaxed whitespace-pre-line">
              {slot.body}
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}

function ComparisonMatrixBlock() {
  const m = COPY.rubric.comparisonMatrix;
  return (
    <section id="comparison-matrix" className="section-wrap">
      <div className="fade-in text-center mb-6">
        <h2 className="mb-2">{m.title}</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">{m.intro}</p>
      </div>
      <div className="fade-in">
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="bg-slate-900/60 text-slate-300">
                <th className="text-left p-4 font-semibold border-b border-slate-800">
                  {m.axisHeader}
                </th>
                {m.columns.map((c) => (
                  <th
                    key={c}
                    className="text-left p-4 font-semibold border-b border-slate-800"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.rows.map((row) => (
                <tr key={row.axis} className="border-b border-slate-800">
                  <td className="p-4 text-slate-300 font-medium align-top">
                    {row.axis}
                  </td>
                  <td className="p-4 text-slate-400 align-top">{row.land}</td>
                  <td className="p-4 text-slate-400 align-top">
                    {row.underwater}
                  </td>
                  <td className="p-4 text-slate-400 align-top">{row.orbital}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
}

function MilestonesBlock() {
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

function AppendixBanner() {
  return (
    <div
      className="no-print"
      style={{
        background: "rgba(99,102,241,0.1)",
        borderBottom: "1px solid rgba(99,102,241,0.25)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-indigo-200">{COPY.common.appendixBannerMain}</span>
        <a
          href={modeHref("live", "live-hero")}
          className="ref-link text-indigo-300"
        >
          {COPY.common.appendixBannerBack}
        </a>
      </div>
    </div>
  );
}

/* ===== FLOATING QR ===== */
function FloatingQR() {
  const [atlasUrl, setAtlasUrl] = useState(null);
  useEffect(() => {
    setAtlasUrl(window.location.origin + window.location.pathname + "?mode=atlas");
  }, []);
  const qrDataUrl = useQrDataUrl(atlasUrl);
  if (!qrDataUrl) return null;
  return (
    <a
      href={atlasUrl}
      target="_blank"
      rel="noreferrer"
      title="Open research appendix"
      className="no-print"
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 50,
        background: "rgba(15,23,42,0.85)",
        borderRadius: "0.5rem",
        padding: "0.375rem",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(148,163,184,0.15)",
        display: "block",
        lineHeight: 0,
      }}
    >
      <img alt="Scan for research atlas" src={qrDataUrl} width="72" height="72" />
    </a>
  );
}

/* ===== NAVIGATION ===== */
function ScrollProgressBar({ progress }) {
  return <div className="scroll-progress" style={{ width: progress + "%" }} />;
}

function StickyNav({ mode, sections, activeSection }) {
  const targetMode = mode === "live" ? "atlas" : "live";
  const targetLabel =
    mode === "live"
      ? COPY.common.openResearchAtlas
      : COPY.common.openPresentationMode;
  return (
    <nav
      className="sticky top-0 z-40 border-b border-slate-800 no-print"
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background: "rgba(15,23,42,0.8)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto">
        {sections.map((s) => (
          <a
            key={s.id}
            href={"#" + s.id}
            className={cn("nav-pill", activeSection === s.id && "active")}
          >
            {s.nav}
          </a>
        ))}
        <div className="ml-auto pl-3">
          <a
            href={modeHref(targetMode, targetMode === "live" ? "live-hero" : "hero")}
            className="toggle-btn whitespace-nowrap"
          >
            {targetLabel}
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ===== APPS ===== */
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
      <StickyNav mode="live" sections={LIVE_SECTIONS} activeSection={state.activeSection} />
      <StudentHeaderBlock />
      <RubricProseBlock slotId="topic-summary" slotKey="topicSummary" />
      <RubricProseBlock slotId="astronomy-relevance" slotKey="astronomyRelevance" />
      <ComparisonMatrixBlock />
      <LiveAstronomySection />
      <LiveContextSection />
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

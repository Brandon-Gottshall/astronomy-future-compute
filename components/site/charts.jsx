"use client";

import { useEffect, useRef } from "react";
import { DATA } from "../../lib/data";

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

export function EnergyGrowthChart() {
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
    <div className="h-[320px]">
      <canvas ref={ref} />
    </div>
  );
}

export function AstronomyImpactChart() {
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
    <div className="h-[280px]">
      <canvas ref={ref} />
    </div>
  );
}

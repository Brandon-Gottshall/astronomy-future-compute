"use client";

import { DATA, PATHWAY_META } from "../../lib/data";
import { cn } from "./utils";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card as UiCard } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Card({ className, children, style, ...props }) {
  return (
    <UiCard className={cn("card p-6", className)} style={style} {...props}>
      {children}
    </UiCard>
  );
}
export function Badge({ className, children }) {
  return (
    <UiBadge
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        className
      )}
    >
      {children}
    </UiBadge>
  );
}
export function ToggleRow({ label, value, onChange, options }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && (
        <span className="text-sm font-medium text-slate-400 mr-2">{label}</span>
      )}
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) onChange(nextValue);
        }}
        className="flex-wrap justify-start"
      >
        {options.map((o) => (
          <ToggleGroupItem
            key={o.value}
            value={o.value}
            className={cn("toggle-btn", value === o.value && "active")}
          >
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export function PrintButton({ children = "Print this page", className }) {
  return (
    <Button
      type="button"
      className={cn("action-btn", className)}
      onClick={() => window.print()}
    >
      {children}
    </Button>
  );
}
export function PathwayPill({ pathway }) {
  const m = PATHWAY_META[pathway] || PATHWAY_META.land;
  const label = DATA.pathways[pathway]
    ? DATA.pathways[pathway].short
    : pathway.charAt(0).toUpperCase() + pathway.slice(1);
  return (
    <UiBadge
      style={{ background: m.bg, color: m.text, borderColor: m.border }}
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
    >
      {label}
    </UiBadge>
  );
}

/* ===== ANIMATED COUNTER ===== */
export function AnimatedCounter({ value, label, sub }) {
  // Kept the name for API compatibility. Rendering is now plain and static —
  // no 0-prefixed intermediate frames, no fragile text-extraction artifacts,
  // and accessible to screen readers on first paint.
  return (
    <UiCard className="card rounded-2xl p-6 text-center">
      <div className="text-3xl md:text-4xl font-bold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-300 leading-snug">{label}</div>
      {sub ? (
        <div className="mt-1 text-xs text-slate-500 uppercase tracking-wider">
          {sub}
        </div>
      ) : null}
    </UiCard>
  );
}

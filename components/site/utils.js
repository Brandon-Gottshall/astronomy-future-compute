export function cn(...args) {
  return args.filter(Boolean).join(" ");
}
export function plainText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
export function shortCopy(value, maxChars = 150) {
  const text = plainText(value);
  if (text.length <= maxChars) return text;
  const sentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  if (sentence && sentence.length <= maxChars) return sentence;
  return text.slice(0, maxChars - 1).trimEnd() + "…";
}
export function splitParagraphs(value) {
  return String(value || "")
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
export function wordCount(value) {
  const text = plainText(value);
  return text ? text.split(/\s+/).length : 0;
}
export function modeHref(mode, anchor) {
  const hash = anchor ? "#" + anchor : "";
  if (mode === "atlas") return "/research" + hash;
  if (mode === "live") return "/" + hash;
  return "?mode=" + mode + hash;
}

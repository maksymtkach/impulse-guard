export function normalizeVariant(v){
  if (!v) return "";
  let s = String(v);
  s = s.replace(/^\s*(\d+[\).\-\s]+)?\s*/i, "");
  s = s.replace(/^(direct(?:\s*&?|\s+and)?\s*neutral|empathetic|firm\s+boundaries)\s*:\s*/i, "");
  s = s.replace(/\bi don'?t care\b/gi, "I want to resolve this");
  s = s.replace(/\bwhatever\b/gi, "I want to resolve this");
  s = s.replace(/\s*\.\.\.+/g, "…");
  s = s.replace(/([.!?])\1+/g, "$1");
  s = s.replace(/\s{2,}/g, " ").trim();
  if (!/[.!?…]$/.test(s)) s += ".";
  return s;
}

export function summarize(h){
  const m={}; h.forEach(x=>{ m[x.label]=(m[x.label]||0)+1; }); 
  return m;
}

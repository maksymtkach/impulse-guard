import { state } from "../state.js";
import { CFG } from "../config.js";

const POS = new Set(["relative","absolute","fixed","sticky"]);
let anchor = null;
let badgeHost = null, badgeDOM = null;
let ro = null, mo = null;

export function closestPositioned(el){
  let a = el;
  while (a && a !== document.body){
    const cs = getComputedStyle(a);
    if (POS.has(cs.position)) return a;
    a = a.parentElement;
  }
  return document.body;
}

export function ensureBadge(){
  if (badgeHost && badgeDOM) return;
  badgeHost = document.createElement("div");
  badgeHost.style.position = "absolute";
  badgeHost.style.zIndex = "2147483647";
  badgeHost.style.pointerEvents = "none";
  badgeDOM = badgeHost.attachShadow({ mode:"open" });
  badgeDOM.innerHTML = `
    <style>
      .wrap{ pointer-events:auto; font:12px system-ui,sans-serif; }
      .badge{ width:${CFG.BADGE}px; height:${CFG.BADGE}px; position:absolute; right:0; bottom:0;
              transform: translate(-${CFG.GAP}px, -${CFG.GAP}px);
              border-radius:999px; background:#111; color:#fff; display:grid; place-items:center;
              cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,.35) }
      .num{ position:absolute; font-size:10px; font-weight:800 }
      svg{ transform:rotate(-90deg) }
    </style>
    <div class="wrap">
      <div class="badge" id="igBadge" title="Sentiscore">
        <svg width="${CFG.BADGE}" height="${CFG.BADGE}">
          <circle cx="${CFG.BADGE/2}" cy="${CFG.BADGE/2}" r="${CFG.BADGE/2-3}" stroke="#333" stroke-width="3" fill="none"></circle>
          <circle id="ring" cx="${CFG.BADGE/2}" cy="${CFG.BADGE/2}" r="${CFG.BADGE/2-3}" stroke="#22c55e" stroke-width="3" fill="none" stroke-linecap="round"></circle>
        </svg>
        <div class="num" id="num">0</div>
      </div>
    </div>
  `;
  badgeDOM.getElementById("igBadge").addEventListener("click", (e)=>{
    e.stopPropagation();
    window.__IG_togglePanel?.(true);
  });
}

export function attachBadgeTo(a){
  if (anchor === a && badgeHost?.parentElement === anchor) return;
  detachBadge();
  anchor = a; ensureBadge();
  anchor.appendChild(badgeHost);
  if (ro) try{ ro.disconnect(); }catch{}
  ro = new ResizeObserver(()=> sizeBadgeHost());
  try { ro.observe(anchor); if (state.editor) ro.observe(state.editor); } catch {}
  if (mo) try{ mo.disconnect(); }catch{}
  mo = new MutationObserver(()=> sizeBadgeHost());
  mo.observe(anchor, { attributes:true, subtree:true, childList:true });
  let sc = anchor;
  while (sc && sc !== document.body){ sc.addEventListener("scroll", sizeBadgeHost, true); sc = sc.parentElement; }
  window.addEventListener("scroll", sizeBadgeHost, true);
  window.addEventListener("resize", sizeBadgeHost, true);
  sizeBadgeHost();
}

export function sizeBadgeHost(){
  if (!badgeHost || !anchor) return;
  const r = anchor.getBoundingClientRect();
  badgeHost.style.left = (anchor.scrollLeft + 0) + "px";
  badgeHost.style.top  = (anchor.scrollTop  + 0) + "px";
  badgeHost.style.width = r.width + "px";
  badgeHost.style.height = r.height + "px";
}

export function detachBadge(){
  if (badgeHost?.parentElement) badgeHost.parentElement.removeChild(badgeHost);
  badgeHost = null; badgeDOM = null;
}
import { state } from "../state.js";
import { CFG } from "../config.js";

export async function setBadge(n) {
  if (!badgeDOM) return;

  const ring = badgeDOM.getElementById("ring");
  const num  = badgeDOM.getElementById("num");
  const radius = CFG.BADGE/2 - 3;
  const C = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, n));

  ring.setAttribute("stroke-dasharray", String(C));
  ring.setAttribute("stroke-dashoffset", String(C * (1 - pct / 100)));
  ring.setAttribute("stroke", n < 40 ? "#22c55e" : n < 70 ? "#f59e0b" : "#ef4444");
  num.textContent = String(n);

  // --- 🔥 нове: відправка на бек
  if (n > 0 && state.token) {
    try {
      const res = await fetch(`${CFG.API}/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${state.token}`
        },
        body: JSON.stringify({
          score: n,
          emotions: {},   // можна буде додати реальні дані
          risks: {}
        })
      });

      if (!res.ok) {
        console.error("Backend error:", res.status, await res.text());
      } else {
        console.log("✅ Sentiscore saved:", n);
      }
    } catch (err) {
      console.error("❌ Failed to send event:", err);
    }
  } else {
    console.warn("⚠️ No token or score=0, not sending");
  }
}

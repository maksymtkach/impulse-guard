import { state } from "../state.js";
import { CFG } from "../config.js";
import { getEditorText, setEditorText } from "../utils/editor.js";
import { normalizeVariant } from "../text.js";
import { settings } from "../config.js";

let panelHost = null, panelDOM = null;

export function ensurePanel(){
  if (panelHost && panelDOM) return;
  panelHost = document.createElement("div");
  panelHost.style.position = "fixed";
  panelHost.style.zIndex = "2147483647";
  panelHost.style.left = "0"; panelHost.style.top = "0";
  panelHost.style.width = "0"; panelHost.style.height = "0";
  panelDOM = panelHost.attachShadow({ mode:"open" });
  panelDOM.innerHTML = `
  <style>
    .panel{
      position: fixed; left: 0; top: 0;
      background:#fff; color:#111;
      border-radius:12px; padding:12px;
      width:${CFG.PANEL_W}px; max-width:min(${CFG.PANEL_W}px,92vw);
      max-height:60vh; overflow:auto;
      box-shadow:0 20px 50px rgba(0,0,0,.25);
      display:none; font:13px system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      z-index:2;
    }
    .issue{ border:1px solid #eef2f7; border-radius:10px; padding:8px 10px; margin:8px 0; background:#fafbff; }
    .issue:hover{ background:#f5f7ff; }
    .bar>div{ transition:width .25s ease; }
    .disclaimer{ color:#9aa3af; font-size:11px; }
    .title{ font-weight:700; margin:6px 0 2px }
    .emo{ display:flex; gap:8px; align-items:center; margin:4px 0 }
    .bar{ height:6px; flex:1; background:#eee; border-radius:6px; overflow:hidden }
    .why{ color:#6b7280; font-size:12px }
    .chip{ display:inline-block; margin:4px 6px 0 0; padding:2px 8px; border-radius:999px; border:1px solid #e5e7eb; background:#f8fafc; cursor:pointer }
    .btn{ background:#111; color:#fff; border:none; border-radius:8px; padding:6px 10px; cursor:pointer; font-weight:700 }
    .cool{
      position: fixed; left:0; top:0;
      background:#111; color:#fff;
      padding:10px; border-radius:12px;
      font-weight:700; display:none;
      box-shadow:0 12px 32px rgba(0,0,0,.28);
      max-width:min(480px, 92vw);
      z-index:2147483647;
    }
    .cool .row{ display:flex; gap:6px; flex-wrap:wrap; margin-top:6px }
    .cool button{
      background:#fff; color:#111; border:none; border-radius:8px;
      padding:6px 10px; font-weight:700; cursor:pointer
    }
  </style>
  <div class="panel" id="panel"></div>
  <div class="cool" id="cool"></div>
`;
  document.documentElement.appendChild(panelHost);

  document.addEventListener("click", (e)=>{
    if (!state.panelOpen) return;
    if (!panelDOM.contains(e.target)) togglePanel(false);
  }, true);
  document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") togglePanel(false); }, true);
}

export function togglePanel(open){
  ensurePanel();
  const p = panelDOM.getElementById('panel');
  if (open){
    renderPanel();
    p.style.visibility = 'hidden';
    p.style.display = 'block';
    positionPanelAtEditor();
    p.style.visibility = 'visible';
  } else {
    p.style.display = 'none';
  }
  state.panelOpen = open;
}

export function positionPanelAtEditor(){
  if (!state.editor) return;
  const p = panelDOM.getElementById('panel');
  const r = state.editor.getBoundingClientRect();
  const w = Math.min(CFG.PANEL_W, Math.floor(window.innerWidth * 0.92));
  const h = p.offsetHeight || 260;
  const gap = 10;

  let left = r.right - w;
  let top  = r.top - h - gap;

  if (top < CFG.PANEL_MARGIN) top = r.bottom + gap;
  left = Math.max(CFG.PANEL_MARGIN, Math.min(window.innerWidth - w - CFG.PANEL_MARGIN, left));
  const bottomOverflow = (top + h + CFG.PANEL_MARGIN) - window.innerHeight;
  if (bottomOverflow > 0) top = Math.max(CFG.PANEL_MARGIN, top - bottomOverflow);

  p.style.left = Math.round(left) + 'px';
  p.style.top  = Math.round(top)  + 'px';
}

export function renderPanel(){
  const p = panelDOM.getElementById("panel");
  const text = getEditorText(state.editor);
  const { hits, emotions } = state.last;

  const emoRow = (n,v)=>`<div class="emo"><div style="width:90px">${n}</div><div class="bar"><div style="width:${v}%"></div></div><div style="width:32px;text-align:right">${v}</div></div>`;
  const emoHtml = emoRow("Anger", emotions.anger||0)
    + emoRow("Frustration", emotions.frustration||0)
    + emoRow("Sarcasm", emotions.sarcasm||0)
    + emoRow("Contempt", emotions.contempt||0)
    + emoRow("Pressure", emotions.urgency||0);

  const issues = (hits.slice(0,8).map((h,i)=>{
    const frag = text.slice(h.i, h.i+h.l);
    const labels = {insult:"Insult",absolutism:"Absolutism","you-attack":"Personal attack",ultimatum:"Ultimatum",dismissive:"Dismissive",sarcasm:"Sarcasm"};
    const tag = h.sev>=15?'super-risky':'warning';
    const sugg = (h.sugg||[]).map(s=>`<span class="chip" data-from="${encodeURIComponent(frag)}" data-to="${encodeURIComponent(s)}">${s}</span>`).join('');
    return `<div class="issue"><b>${i+1}. ${(labels[h.label]||h.label)} <span style="color:${h.sev>=15?'#ef4444':'#f59e0b'}">(${tag})</span>:</b>
      <span style="text-decoration: underline wavy ${h.sev>=15?'red':'orange'}">${frag}</span>
      <div class="why">${h.why}</div>
      <div>${sugg}</div>
    </div>`;
  }).join('')) || `<div class="issue">No risky phrases detected. Nice!</div>`;

  p.innerHTML = `
    <div class="title">Emotions</div>${emoHtml}
    <div class="title">Risk highlights</div>${issues}
    <div style="margin-top:8px"><button class="btn" id="igRewrite">Rewrite</button></div>
    <div class="disclaimer">ImpulseGuard prevents sending high-risk messages (5s cooldown).</div>
  `;

  p.querySelectorAll(".chip").forEach(ch=>{
    ch.addEventListener("click", ()=>{
      const from = decodeURIComponent(ch.getAttribute("data-from"));
      const to   = decodeURIComponent(ch.getAttribute("data-to"));
      const txt  = getEditorText(state.editor);
      const i    = txt.toLowerCase().indexOf(from.toLowerCase());
      if (i>=0) setEditorText(state.editor, txt.slice(0,i)+to+txt.slice(i+from.length));
      togglePanel(false);
    });
  });
  p.querySelector("#igRewrite").addEventListener("click", doRewrite);
}

export async function doRewrite(){
  const p = panelDOM.getElementById("panel");
  const oldText = getEditorText(state.editor);
  state.lastOriginalText = oldText;
  p.innerHTML = `<div class="title">Rewriting…</div>`;

  let variants = [];
  try{
    const r = await fetch(`${settings.API_URL}/rewrite`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', ...(settings.API_TOKEN?{'Authorization':'Bearer '+settings.API_TOKEN}:{}) },
      body: JSON.stringify({ text: oldText })
    });
    if (r.ok){
      const j = await r.json();
      variants = Array.isArray(j.variants) ? j.variants.filter(Boolean) : [];
    }
  }catch{}

  if (!variants.length){
    const soften = s => s
      .replace(/\bnever\b/gi, 'often')
      .replace(/\balways\b/gi, 'usually')
      .replace(/\bi don'?t care\b/gi, 'I want to resolve this')
      .replace(/\bwhatever\b/gi, 'I want to resolve this')
      .replace(/\byou (suck|lie|fail|ruined)\b/gi, 'this didn’t meet expectations');
    variants = [
      `Direct and neutral: ${soften(oldText)}. Let's agree on next steps and a clear timeline.`,
      `Empathetic: I feel concerned. I'd like to focus on facts and fix it together: ${soften(oldText)}`,
      `Firm boundaries: Please avoid judgments. Here's how we proceed: 1) … 2) … 3) …`
    ];
  }

  const clean = variants.map(normalizeVariant).filter(t => t.length > 0);
  const chosen = clean[0] || oldText;
  setEditorText(state.editor, chosen);
  showUndoToast(() => { setEditorText(state.editor, state.lastOriginalText); });

  const alt = clean.slice(1,3).map((v,i)=>`<div class="issue alt" data-v="${encodeURIComponent(v)}">Alternative ${i+2}: ${v}</div>`).join('');
  p.innerHTML = `
    <div class="issue"><b>Rewritten.</b> Applied a neutral version. You can switch alternatives or Undo.</div>
    ${alt || '<div class="why">No more alternatives.</div>'}
  `;
  p.querySelectorAll('.alt').forEach(div=>{
    div.addEventListener('click', ()=>{
      const v = decodeURIComponent(div.getAttribute('data-v'));
      setEditorText(state.editor, v);
      showUndoToast(() => { setEditorText(state.editor, state.lastOriginalText); });
      togglePanel(false);
    });
  });
}

export function getPanelShadow(){ ensurePanel(); return panelDOM; }
export function positionPanel(){ try { positionPanelAtEditor(); } catch(e) {} }

export function showUndoToast(onUndo){
  ensurePanel();
  let toast = panelDOM.getElementById("snack");
  if (!toast){
    const style = document.createElement("style");
    style.textContent = `
      .snack{ position: fixed; right:16px; bottom:16px; background:#111; color:#fff;
              border-radius:10px; padding:10px 12px; font-weight:700;
              box-shadow:0 12px 32px rgba(0,0,0,.28); display:flex; align-items:center; gap:8px; z-index:2147483647 }
      .snack button{ background:#fff; color:#111; border:none; border-radius:8px; padding:4px 8px; font-weight:700; cursor:pointer }
    `;
    panelDOM.appendChild(style);
    toast = document.createElement("div");
    toast.id = "snack";
    toast.className = "snack";
    toast.style.display = "none";
    toast.innerHTML = `<span>Rewritten</span><button id="snackUndo">Undo</button>`;
    panelDOM.appendChild(toast);
  }
  toast.style.display = "flex";
  toast.querySelector("#snackUndo").onclick = () => {
    toast.style.display = "none";
    onUndo && onUndo();
  };
  setTimeout(()=>{ toast.style.display="none"; }, 7000);
}

export function placeCool(cool){
  const r = state.editor.getBoundingClientRect();
  const margin = 10;
  const w = cool.offsetWidth || 260;
  const h = cool.offsetHeight || 54;
  let left = r.left + (r.width - w)/2;
  let top  = r.top  - h - margin;
  if (top < margin) top = r.bottom + margin;
  left = Math.max(margin, Math.min(window.innerWidth  - w - margin, left));
  top  = Math.max(margin, Math.min(window.innerHeight - h - margin, top));
  cool.style.left = Math.round(left) + "px";
  cool.style.top  = Math.round(top)  + "px";
}

export function hideCool(resetReady = true){
  if (state.cooldownTimerId) { clearInterval(state.cooldownTimerId); state.cooldownTimerId = null; }
  const cool = panelDOM?.getElementById('cool');
  if (cool) { cool.style.display = 'none'; cool.innerHTML = ''; }
  state.cooling = false;
  if (resetReady) state.readyToSend = false;
}

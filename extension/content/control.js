import { state } from "./state.js";
import { CFG, settings } from "./config.js";
import { analyze } from "./analyzer.js";
import { summarize } from "./text.js";
import { rootEditable, getEditorText } from "./utils/editor.js";
import { closestPositioned, attachBadgeTo, sizeBadgeHost, setBadge } from "./ui/badge.js";
import { ensurePanel, togglePanel, positionPanel, getPanelShadow, placeCool, hideCool } from "./ui/panel.js";

function isEditable(el){
  return el &&
    (el.tagName === "TEXTAREA" ||
     el.isContentEditable ||
     el.getAttribute?.("contenteditable") === "true" ||
     el.getAttribute?.("role") === "textbox");
}

function setEditor(el){
  state.editor = rootEditable(el);
  const a = closestPositioned(state.editor.parentElement || state.editor);
  attachBadgeTo(a);
  const text = getEditorText(state.editor);
  state.last = analyze(text);
  setBadge(state.last.risk);
  sizeBadgeHost();
}

function sendEvent(){
  if (!settings.API_TOKEN) return;
  try{
    fetch(`${settings.API_URL}/event`,{
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+settings.API_TOKEN },
      body: JSON.stringify({ score: state.last.risk, emotions: state.last.emotions, risks: summarize(state.last.hits) })
    });
  }catch{}
}

function tgSendButton(){
  return [...document.querySelectorAll('button,div[role="button"]')]
    .find(b => /send/i.test(b.getAttribute('aria-label') || '') || /tgico-send/.test(b.className || ''));
}
function gmailSendButton(){
  return document.querySelector('div[role="button"][data-tooltip*="Send"], div[role="button"][aria-label^="Send"]');
}

function performSend(){
  state.bypassSend = true;
  const onTelegram = location.host.includes('web.telegram.org');
  const onGmail    = location.host.includes('mail.google.com');
  const btn = onTelegram ? tgSendButton() : onGmail ? gmailSendButton() : null;
  if (btn) btn.click();
  else if (state.editor){
    state.editor.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    state.editor.dispatchEvent(new KeyboardEvent('keyup',  {key:'Enter',bubbles:true}));
  }
  setTimeout(()=>{ state.bypassSend = false; sendEvent(last);}, 60);
}

function startCooldown(){
  if (state.cooling && Date.now() < state.cooldownEnd) return;

  state.cooling = true;
  state.readyToSend = false;
  state.cooldownEnd = Date.now() + CFG.COOLDOWN * 1000;

  ensurePanel();
  const root = getPanelShadow();
  const cool = root.getElementById('cool');
  cool.style.display = 'block';
  cool.textContent = '...';
  placeCool(cool);

  if (state.cooldownTimerId) clearInterval(state.cooldownTimerId);
  state.cooldownTimerId = setInterval(tick, 250);
  tick();

  function tick(){
    const leftMs = Math.max(0, state.cooldownEnd - Date.now());
    const s = Math.ceil(leftMs/1000);
    if (leftMs > 0){
      cool.textContent = `High risk. Cooling down: ${s}s…`;
      placeCool(cool);
    } else {
      clearInterval(state.cooldownTimerId); state.cooldownTimerId = null;
      state.cooling = false; state.readyToSend = true;

      cool.innerHTML = `
        <div style="margin-bottom:6px">High risk paused</div>
        <div class="row">
          <button id="igSendAnyway">Send anyway</button>
          <button id="igRewrite2">Rewrite</button>
          <button id="igCancelHold">Cancel</button>
        </div>
        <div style="margin-top:6px;color:#bbb;font-size:11px">Or press Enter again to send.</div>
      `;
      placeCool(cool);

      root.getElementById('igSendAnyway')?.addEventListener('click', ()=>{
        state.readyToSend = false;
        cool.style.display = 'none';
        performSend();
      });
      root.getElementById('igRewrite2')?.addEventListener('click', ()=>{
        togglePanel(true);
        cool.style.display = 'none';
      });
      root.getElementById('igCancelHold')?.addEventListener('click', ()=>{
        state.readyToSend = false;
        cool.style.display = 'none';
      });
    }
  }
}

export function bootstrap(){
  window.__IG_togglePanel = togglePanel;

  document.addEventListener("focusin", (e)=>{
    if (!isEditable(e.target)) return;
    setEditor(e.target);
  }, true);

  document.addEventListener("input", (e)=>{
    if (!isEditable(e.target)) return;
    if (e.target !== state.editor) setEditor(e.target);
    clearTimeout(state.debounce);
    state.debounce = setTimeout(()=>{
      const text = getEditorText(state.editor);
      state.last = analyze(text);
      setBadge(state.last.risk);
      sizeBadgeHost();
      if (state.panelOpen) positionPanel();
    }, 100);
  }, true);

  document.addEventListener("selectionchange", ()=>{
    if (!state.panelOpen || !state.editor) return;
    const sel = document.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const node = sel.anchorNode;
    if (!node) return;
    if (rootEditable(node.nodeType === 3 ? node.parentElement : node) === rootEditable(state.editor)) {
      positionPanel();
    }
  }, true);

  window.addEventListener("scroll", ()=>{ if (state.panelOpen) positionPanel(); }, true);
  window.addEventListener("resize", ()=>{ if (state.panelOpen) positionPanel(); }, true);

  ['keydown','keypress','keyup'].forEach(type=>{
    document.addEventListener(type, (e)=>{
      if (!state.editor || !isEditable(state.editor)) return;

      const targetRoot = rootEditable(e.target?.nodeType===3 ? e.target.parentElement : e.target);
      if (targetRoot && targetRoot !== rootEditable(state.editor)) return;

      const onTelegram = location.host.includes('web.telegram.org');
      const onGmail = location.host.includes('mail.google.com');
      const gmailEnter = onGmail && e.key==='Enter' && ((e.ctrlKey||e.metaKey) || !e.shiftKey);
      const tgEnter    = onTelegram && e.key==='Enter' && !e.shiftKey;
      const isSendKey  = e.type.startsWith('key') && (gmailEnter || tgEnter);

      if (!isSendKey) return;
      if (state.bypassSend) return;

      if (state.last.risk >= CFG.HIGH_RISK){
        if (state.readyToSend){
          state.readyToSend = false;
          e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
          performSend();
        } else {
          e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
          startCooldown();
        }
      }
    }, true);
  });

  document.addEventListener('click', (e)=>{
    const t = e.target;
    const isSendBtn =
      (t && (t === tgSendButton() || t === gmailSendButton())) ||
      (t?.closest && (t.closest('[aria-label="Send"]') || t.closest('.tgico-send')));
    if (!isSendBtn) return;
    if (state.bypassSend) return;

    if (state.last.risk >= CFG.HIGH_RISK){
      if (state.readyToSend){
        state.readyToSend = false;
        hideCool(false);
        setTimeout(()=> sendEvent(), 0);
        return;
      } else {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
        startCooldown();
      }
    }
  }, true);
}

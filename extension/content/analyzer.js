export function analyze(text){
  const t = (text||"").toLowerCase();
  const hits = [];
  const add = (re,label,sev,why,sugg=[],emo=null)=>{ let m; while((m=re.exec(t))) hits.push({i:m.index,l:m[0].length,label,sev,why,sugg,emo}); };

  add(/\b(idiot|stupid|useless|dumb|moron)\b/g, "insult", 40, "Insults escalate quickly.", ["Remove judgement"], "anger");
  add(/\b(never|always)\b/g, "absolutism", 12, "Absolutes are unfair.", ["often","sometimes"], "frustration");
  add(/\byou\b[^.!?\n]{0,12}\b(suck|lie|fail|ruined)\b/g, "you-attack", 25, "Personal attack.", ["Describe the fact, not the person"], "anger");
  add(/\b(last chance|or else)\b/gi, "ultimatum", 20, "Ultimatum triggers defensiveness.", ["Propose a deadline"], "urgency");
  add(/\b(i don't care|whatever)\b/gi, "dismissive", 15, "Dismissive breaks trust.", ["I want to resolve this"], "contempt");
  add(/\b(sure\.\.\.|yeah right)\b/g, "sarcasm", 10, "Sarcasm reads as contempt.", ["State it plainly"], "sarcasm");

  const hedges = (t.match(/\b(maybe|might|i feel|i think|perhaps)\b/g)||[]).length;

  const caps = { insult:40, "you-attack":25, ultimatum:20, dismissive:15, absolutism:12, sarcasm:10 };
  const sum = {};
  hits.forEach(h => sum[h.label]=(sum[h.label]||0)+h.sev);
  let raw = 0; Object.keys(sum).forEach(k => raw += Math.min(sum[k], caps[k]||sum[k]));
  raw -= Math.min(hedges*3, 12);

  const emotions = { anger:0, frustration:0, sarcasm:0, contempt:0, urgency:0 };
  hits.forEach(h => { if(h.emo) emotions[h.emo] = Math.min(100, emotions[h.emo] + h.sev*4); });

  const risk = Math.max(0, Math.min(100, Math.round(raw)));
  return { risk, hits, emotions };
}

export function rootEditable(el){
  let n = el;
  while (n && n !== document.body) {
    if (n.tagName === "TEXTAREA") return n;
    const ce = n.isContentEditable || n.getAttribute?.("contenteditable") === "true";
    const role = n.getAttribute?.("role") === "textbox";
    if (ce || role) return n;
    n = n.parentElement;
  }
  return el;
}

export function getEditorText(el){
  const node = rootEditable(el);
  if ("value" in node) return node.value;
  return node.innerText ?? node.textContent ?? "";
}

export function setEditorText(el, newText){
  const node = rootEditable(el);
  node.focus();
  if ("value" in node) {
    node.value = newText;
    node.dispatchEvent(new Event("input", { bubbles:true }));
    node.dispatchEvent(new Event("change", { bubbles:true }));
    return true;
  }
  try {
    const doc = node.ownerDocument;
    const sel = doc.getSelection();
    const range = doc.createRange();
    range.selectNodeContents(node);
    sel.removeAllRanges();
    sel.addRange(range);
    if (doc.execCommand("insertText", false, newText)) {
      node.dispatchEvent(new InputEvent("input", { bubbles:true, inputType:"insertFromPaste", data:newText }));
      return true;
    }
  } catch {}
  try {
    node.textContent = newText;
    node.dispatchEvent(new InputEvent("input", { bubbles:true, inputType:"insertFromPaste", data:newText }));
    return true;
  } catch {}
  return false;
}

export function placeCaretAtEnd(node){
  try{
    const range = node.ownerDocument.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    const sel = node.ownerDocument.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }catch{}
}

export function replaceEditorText(el, newText){
  const node = rootEditable(el);
  node.focus();

  if ('value' in node){
    node.value = newText;
    node.dispatchEvent(new Event('input', { bubbles:true }));
    node.dispatchEvent(new Event('change', { bubbles:true }));
    return true;
  }

  try{
    node.innerHTML = '';
    const t = node.ownerDocument.createTextNode(newText);
    node.appendChild(t);
    node.appendChild(node.ownerDocument.createElement('br'));
    node.dispatchEvent(new InputEvent('input', { bubbles:true, inputType:'insertFromPaste', data:newText }));
    placeCaretAtEnd(node);
    return true;
  }catch{}

  return setEditorText(el, newText);
}

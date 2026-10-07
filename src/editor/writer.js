import TurndownService from "turndown";
import { sections } from "./sections.mjs";
const $ = id => document.getElementById(id);
const editor = $("markdown"), frame = $("site"), status = $("status"), workspace = $("workspace");
const converter = new TurndownService({ bulletListMarker: "-", headingStyle: "atx", emDelimiter: "*" });
converter.remove("svg");
const states = Object.fromEntries(Object.entries(sections).map(([id, section]) => [id, {
  ...section, id, markdown: "", revision: "", lastSaved: "", inFlight: false,
  stopped: false, ready: false, renderVersion: 0, status: "Opening your website…",
  draftKey: "aayush-permanent-writer-draft-v1" + (id === "intro" ? "" : "-" + id),
}]));
let active = states.intro, reading = false;
function element(state = active) {
  return frame.contentDocument?.querySelector(`[data-content-section="${state.id}"]`);
}
function setStatus(text, state = active) {
  state.status = text;
  if (state === active) status.textContent = text;
}
function stash(state) {
  try { localStorage.setItem(state.draftKey, JSON.stringify({ markdown: state.markdown, revision: state.revision })); } catch {}
}
function showRecovery(message, { restore = false, retry = false } = {}, state = active) {
  state.recovery = { message, restore, retry };
  syncTools();
}
function syncTools() {
  const recovery = active.recovery;
  $("recovery").hidden = !recovery;
  if (recovery) {
    $("recovery-message").textContent = recovery.message;
    $("restore").hidden = !recovery.restore;
    $("retry").hidden = !recovery.retry;
  }
  ["link", "bold", "nest", "outdent"].forEach(id => $(id).disabled = reading || !!active.plain);
  editor.disabled = reading || !active.ready;
  $("format-help").hidden = !!active.plain;
}
function selectSection(id) {
  active = states[id];
  $("section").value = id;
  $("editor-label").textContent = active.label;
  editor.value = active.markdown;
  status.textContent = active.status;
  syncTools();
}
async function api(path, state, data) {
  const response = await fetch("/__writer/" + path + (data ? "" : "?section=" + state.id), {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify({ ...data, section: state.id }) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  if (!response.ok) throw Object.assign(new Error(result.error || "Request failed"), { status: response.status });
  return result;
}
function readElement(state) {
  const el = element(state);
  return state.plain ? el.textContent : converter.turndown(el.innerHTML);
}
function prepareFrame() {
  const doc = frame.contentDocument;
  if (!doc) return;
  if (!doc.getElementById("writer-style")) {
    const style = doc.createElement("style");
    style.id = "writer-style";
    style.textContent = `
      [data-content-section][contenteditable]:not([contenteditable=false]):focus{outline:2px solid #8c7655;outline-offset:10px;border-radius:3px}
      [data-content-section][contenteditable]:not([contenteditable=false]):empty::before{content:"Write here…";color:#81745f}
      #contact .socials[contenteditable=true] ul{flex-wrap:wrap}
      #contact .socials[contenteditable=true] a{width:auto;height:auto;gap:8px;padding:4px 6px}
      #contact .socials[contenteditable=true] .social-label{position:static;width:auto;height:auto;clip-path:none;white-space:normal;overflow:visible}
    `;
    doc.head.append(style);
  }
  Object.values(states).forEach(state => {
    const el = element(state);
    if (!el) return;
    el.contentEditable = reading || !state.ready ? "false" : state.plain ? "plaintext-only" : "true";
    el.spellcheck = true;
    el.setAttribute("aria-label", state.label === "Introduction" ? "Website introduction" : state.label);
    el.setAttribute("role", "textbox");
    el.setAttribute("aria-multiline", String(!state.plain));
    if (el.dataset.writerBound) return;
    el.dataset.writerBound = "true";
    el.addEventListener("focus", () => selectSection(state.id));
    el.addEventListener("input", () => {
      if (!reading) changed(readElement(state), false, state);
    });
    el.addEventListener("click", e => {
      if (!reading && e.target.closest("a")) e.preventDefault();
    });
    el.addEventListener("keydown", e => {
      if (e.key === "Tab" && !reading && !state.plain) {
        e.preventDefault();
        doc.execCommand(e.shiftKey ? "outdent" : "indent");
        changed(readElement(state), false, state);
      }
    });
  });
}
frame.addEventListener("load", () => {
  prepareFrame();
  Object.values(states).filter(state => state.ready).forEach(state => render(state));
});
async function render(state) {
  const version = ++state.renderVersion;
  try {
    const result = await api("render", state, { markdown: state.markdown });
    if (version === state.renderVersion && element(state)) {
      element(state).innerHTML = result.html;
      prepareFrame();
    }
  } catch {
    if (!state.stopped) setStatus("Preview unavailable. Your draft is still here.", state);
  }
}
function changed(text, shouldRender = true, state = active) {
  if (!state.ready || reading) return;
  state.markdown = text;
  if (state === active) editor.value = text;
  stash(state);
  clearTimeout(state.saveTimer);
  if (!state.stopped) {
    setStatus("Waiting to save…", state);
    state.saveTimer = setTimeout(() => save(state), 450);
  }
  clearTimeout(state.renderTimer);
  if (shouldRender) state.renderTimer = setTimeout(() => render(state), 120);
  else state.renderVersion++;
}
async function save(state) {
  if (state.inFlight || state.stopped) return;
  if (state.markdown === state.lastSaved) {
    setStatus("Saved to website", state);
    return;
  }
  state.inFlight = true;
  state.saveStarted = performance.now();
  const text = state.markdown;
  setStatus("Saving to website…", state);
  try {
    const result = await api("content", state, { markdown: text, revision: state.revision });
    state.revision = result.revision;
    state.lastSaved = text;
    if (state.markdown === text) {
      try { localStorage.removeItem(state.draftKey); } catch {}
      state.recovery = null;
      setStatus("Saved to website", state);
      syncTools();
    } else {
      stash(state);
      setStatus("Waiting to save…", state);
    }
  } catch (error) {
    state.stopped = true;
    stash(state);
    setStatus("Could not save — draft kept", state);
    showRecovery(error.message, { retry: error.status !== 409 }, state);
  } finally {
    state.inFlight = false;
    if (!state.stopped && state.markdown !== state.lastSaved) state.saveTimer = setTimeout(() => save(state), 0);
  }
}
setInterval(() => {
  if (active.inFlight) setStatus(`Saving to website… ${Math.floor((performance.now() - active.saveStarted) / 1000)}s`);
}, 1000);
editor.addEventListener("input", () => changed(editor.value));
$("section").onchange = e => {
  selectSection(e.target.value);
  element()?.scrollIntoView({ block: "center" });
};
$("mode").onclick = e => {
  const show = workspace.classList.toggle("markdown");
  e.currentTarget.setAttribute("aria-pressed", String(show));
  e.currentTarget.textContent = show ? "Write on the page" : "Markdown view";
};
$("read").onclick = e => {
  reading = !reading;
  e.currentTarget.setAttribute("aria-pressed", String(reading));
  e.currentTarget.textContent = reading ? "Keep writing" : "Read the page";
  syncTools();
  prepareFrame();
};
$("phone").onclick = e => {
  const phone = workspace.classList.toggle("phone");
  e.currentTarget.setAttribute("aria-pressed", String(phone));
  e.currentTarget.textContent = phone ? "Full width" : "Phone width";
};
function markdownInsert(value, start = editor.selectionStart, end = editor.selectionEnd) {
  editor.setRangeText(value, start, end, "end");
  editor.focus();
  changed(editor.value);
}
function indentMarkdown(outdent) {
  const start = editor.selectionStart, end = editor.selectionEnd;
  const lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = editor.value.indexOf("\n", end);
  if (lineEnd < 0) lineEnd = editor.value.length;
  if (end > start && editor.value[end - 1] === "\n") lineEnd = end - 1;
  const old = editor.value.slice(lineStart, lineEnd);
  const next = old.split("\n").map(line => outdent ? line.replace(/^( {1,2}|\t)/, "") : "  " + line).join("\n");
  const delta = next.split("\n")[0].length - old.split("\n")[0].length;
  markdownInsert(next, lineStart, lineEnd);
  editor.setSelectionRange(Math.max(lineStart, start + delta), Math.max(lineStart, end + next.length - old.length));
}
function richCommand(command, value) {
  const doc = frame.contentDocument, selection = frame.contentWindow.getSelection();
  if (!element()?.contains(selection.anchorNode)) element()?.focus();
  doc.execCommand(command, false, value);
  changed(readElement(active), false);
}
["link", "bold", "nest", "outdent"].forEach(id => {
  $(id).addEventListener("mousedown", e => e.preventDefault());
  $(id).onclick = () => {
    if (workspace.classList.contains("markdown")) {
      if (id === "nest" || id === "outdent") return indentMarkdown(id === "outdent");
      const start = editor.selectionStart;
      const text = editor.value.slice(start, editor.selectionEnd) || (id === "link" ? "link text" : "bold text");
      if (id === "bold") {
        markdownInsert("**" + text + "**");
        editor.setSelectionRange(start + 2, start + 2 + text.length);
      } else {
        markdownInsert("[" + text + "](https://example.com)");
        editor.setSelectionRange(start + text.length + 3, start + text.length + 3 + "https://example.com".length);
      }
    } else if (id === "link") {
      const selection = frame.contentWindow.getSelection();
      let range = selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
      const anchor = selection.anchorNode?.nodeType === 1 ? selection.anchorNode : selection.anchorNode?.parentElement;
      const link = element()?.contains(anchor) ? anchor?.closest("a") : null;
      if (link && selection.isCollapsed) {
        range = frame.contentDocument.createRange();
        range.selectNodeContents(link.querySelector(".social-label") || link);
      }
      const url = prompt("Link URL", link?.getAttribute("href") || "https://");
      if (!url) return;
      if (!/^(https?:\/\/|mailto:)/i.test(url)) return setStatus("Use an https://, http://, or mailto: link.");
      if (link && link.contains(selection.focusNode)) {
        link.setAttribute("href", url);
        changed(readElement(active), false);
        return;
      }
      if (range) { selection.removeAllRanges(); selection.addRange(range); }
      richCommand("createLink", url);
    } else richCommand({ bold: "bold", nest: "indent", outdent: "outdent" }[id]);
  };
});
editor.addEventListener("keydown", e => {
  if (e.isComposing || reading || active.plain) return;
  if (e.key === "Tab") { e.preventDefault(); indentMarkdown(e.shiftKey); }
  if (e.key === "Enter" && !e.shiftKey && editor.selectionStart === editor.selectionEnd) {
    const start = editor.selectionStart, lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
    const match = editor.value.slice(lineStart, start).match(/^(\s*)([-*+] |\d+\. )(.*)$/);
    if (!match) return;
    e.preventDefault();
    if (!match[3].trim()) markdownInsert("", lineStart, start);
    else markdownInsert("\n" + match[1] + (/\d/.test(match[2]) ? parseInt(match[2], 10) + 1 + ". " : match[2]));
  }
});
$("retry").onclick = () => {
  active.stopped = false;
  active.recovery = null;
  syncTools();
  save(active);
};
$("restore").onclick = () => {
  active.stopped = false;
  active.recovery = null;
  syncTools();
  changed(active.recoveryDraft.markdown);
};
$("reload").onclick = async () => {
  const state = active;
  try {
    const current = await api("content", state);
    state.markdown = current.markdown;
    state.lastSaved = current.markdown;
    state.revision = current.revision;
    state.stopped = false;
    state.ready = true;
    state.recovery = null;
    try { localStorage.removeItem(state.draftKey); } catch {}
    if (state === active) selectSection(state.id);
    await render(state);
    setStatus("Saved to website", state);
  } catch (error) {
    setStatus("Could not reload source", state);
    showRecovery(error.message, {}, state);
  }
};
$("download").onclick = () => {
  const url = URL.createObjectURL(new Blob([active.markdown], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = active.file;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
window.addEventListener("beforeunload", e => {
  const unsaved = Object.values(states).filter(state => state.ready && state.markdown !== state.lastSaved);
  if (unsaved.length) {
    unsaved.forEach(stash);
    e.preventDefault();
    e.returnValue = "";
  }
});
async function init(state) {
  try {
    const current = await api("content", state);
    state.markdown = current.markdown;
    state.lastSaved = current.markdown;
    state.revision = current.revision;
    try { state.recoveryDraft = JSON.parse(localStorage.getItem(state.draftKey) || "null"); } catch {}
    state.ready = true;
    if (state === active) selectSection(state.id);
    prepareFrame();
    await render(state);
    if (state.markdown === state.lastSaved && !state.stopped) setStatus("Saved to website", state);
    if (state.recoveryDraft && typeof state.recoveryDraft.markdown === "string" && state.recoveryDraft.markdown !== state.markdown) {
      state.stopped = true;
      showRecovery("An unsaved browser draft is available. Restore it or reload the source.", { restore: true }, state);
    }
  } catch (error) {
    setStatus("Could not open the source", state);
    showRecovery(error.message, {}, state);
  }
}
Object.values(states).forEach(state => init(state));

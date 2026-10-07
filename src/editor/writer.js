import TurndownService from "turndown";
const $ = (id) => document.getElementById(id);
const editor = $("markdown"),
  frame = $("site"),
  status = $("status"),
  workspace = $("workspace");
const converter = new TurndownService({
  bulletListMarker: "-",
  headingStyle: "atx",
  emDelimiter: "*",
});
const draftKey = "aayush-permanent-writer-draft-v1";
let markdown = "",
  revision = "",
  lastSaved = "",
  inFlight = false,
  stopped = false,
  reading = false,
  ready = false;
let saveTimer,
  renderTimer,
  renderVersion = 0,
  saveStarted = 0,
  recoveryDraft;
function setStatus(text) {
  status.textContent = text;
}
function stash() {
  try {
    localStorage.setItem(draftKey, JSON.stringify({ markdown, revision }));
  } catch {}
}
function showRecovery(message, { restore = false, retry = false } = {}) {
  $("recovery-message").textContent = message;
  $("recovery").hidden = false;
  $("restore").hidden = !restore;
  $("retry").hidden = !retry;
}
async function api(path, data) {
  const response = await fetch("/__writer/" + path, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(result.error || "Request failed"), {
      status: response.status,
    });
  return result;
}
function intro() {
  return frame.contentDocument?.querySelector(".intro");
}
function prepareFrame() {
  const el = intro();
  if (!el) return;
  el.contentEditable = reading ? "false" : "true";
  el.spellcheck = true;
  el.setAttribute("aria-label", "Website introduction");
  el.setAttribute("role", "textbox");
  el.setAttribute("aria-multiline", "true");
  if (!frame.contentDocument.getElementById("writer-style")) {
    const style = frame.contentDocument.createElement("style");
    style.id = "writer-style";
    style.textContent =
      '.intro[contenteditable=true]:focus{outline:2px solid #8c7655;outline-offset:10px;border-radius:3px}.intro[contenteditable=true]:empty::before{content:"Write here…";color:#81745f}';
    frame.contentDocument.head.append(style);
  }
  if (el.dataset.writerBound) return;
  el.dataset.writerBound = "true";
  el.addEventListener("input", () => {
    if (!reading) changed(converter.turndown(el.innerHTML), false);
  });
  el.addEventListener("click", (e) => {
    if (!reading && e.target.closest("a")) e.preventDefault();
  });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !reading) {
      e.preventDefault();
      frame.contentDocument.execCommand(e.shiftKey ? "outdent" : "indent");
      changed(converter.turndown(el.innerHTML), false);
    }
  });
}
frame.addEventListener("load", () => {
  prepareFrame();
  if (ready) render();
});
async function render() {
  const version = ++renderVersion;
  try {
    const result = await api("render", { markdown });
    if (version === renderVersion && intro()) {
      intro().innerHTML = result.html;
      prepareFrame();
    }
  } catch {
    if (!stopped) setStatus("Preview unavailable. Your draft is still here.");
  }
}
function changed(text, shouldRender = true) {
  if (!ready || reading) return;
  markdown = text;
  editor.value = text;
  stash();
  clearTimeout(saveTimer);
  if (!stopped) {
    setStatus("Waiting to save…");
    saveTimer = setTimeout(save, 450);
  }
  if (shouldRender) {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 120);
  } else {
    clearTimeout(renderTimer);
    renderVersion++;
  }
}
async function save() {
  if (inFlight || stopped) return;
  if (markdown === lastSaved) {
    setStatus("Saved to website");
    return;
  }
  inFlight = true;
  saveStarted = performance.now();
  const text = markdown;
  setStatus("Saving to website…");
  try {
    const result = await api("content", { markdown: text, revision });
    revision = result.revision;
    lastSaved = text;
    if (markdown === text) {
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      setStatus("Saved to website");
      $("recovery").hidden = true;
    } else {
      stash();
      setStatus("Waiting to save…");
    }
  } catch (error) {
    stopped = true;
    stash();
    setStatus("Could not save — draft kept");
    showRecovery(error.message, { retry: error.status !== 409 });
  } finally {
    inFlight = false;
    if (!stopped && markdown !== lastSaved) saveTimer = setTimeout(save, 0);
  }
}
setInterval(() => {
  if (inFlight)
    setStatus(
      `Saving to website… ${Math.floor((performance.now() - saveStarted) / 1000)}s`,
    );
}, 1000);
editor.addEventListener("input", () => changed(editor.value));
$("mode").onclick = (e) => {
  const show = workspace.classList.toggle("markdown");
  e.currentTarget.setAttribute("aria-pressed", String(show));
  e.currentTarget.textContent = show ? "Write on the page" : "Markdown view";
};
$("read").onclick = (e) => {
  reading = !reading;
  e.currentTarget.setAttribute("aria-pressed", String(reading));
  e.currentTarget.textContent = reading ? "Keep writing" : "Read the page";
  editor.disabled = reading;
  ["link", "bold", "nest", "outdent"].forEach(
    (id) => ($(id).disabled = reading),
  );
  prepareFrame();
};
$("phone").onclick = (e) => {
  const phone = workspace.classList.toggle("phone");
  e.currentTarget.setAttribute("aria-pressed", String(phone));
  e.currentTarget.textContent = phone ? "Full width" : "Phone width";
};
function markdownInsert(
  value,
  start = editor.selectionStart,
  end = editor.selectionEnd,
) {
  editor.setRangeText(value, start, end, "end");
  editor.focus();
  changed(editor.value);
}
function indentMarkdown(outdent) {
  const start = editor.selectionStart,
    end = editor.selectionEnd,
    lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = editor.value.indexOf("\n", end);
  if (lineEnd < 0) lineEnd = editor.value.length;
  if (end > start && editor.value[end - 1] === "\n") lineEnd = end - 1;
  const old = editor.value.slice(lineStart, lineEnd),
    next = old
      .split("\n")
      .map((x) => (outdent ? x.replace(/^( {1,2}|\t)/, "") : "  " + x))
      .join("\n");
  const delta = next.split("\n")[0].length - old.split("\n")[0].length;
  markdownInsert(next, lineStart, lineEnd);
  editor.setSelectionRange(
    Math.max(lineStart, start + delta),
    Math.max(lineStart, end + next.length - old.length),
  );
}
function richCommand(command, value) {
  const doc = frame.contentDocument,
    selection = frame.contentWindow.getSelection();
  if (!intro()?.contains(selection.anchorNode)) {
    intro()?.focus();
  }
  doc.execCommand(command, false, value);
  changed(converter.turndown(intro().innerHTML), false);
}
["link", "bold", "nest", "outdent"].forEach((id) => {
  $(id).addEventListener("mousedown", (e) => e.preventDefault());
  $(id).onclick = () => {
    if (workspace.classList.contains("markdown")) {
      if (id === "nest" || id === "outdent") {
        indentMarkdown(id === "outdent");
        return;
      }
      const start = editor.selectionStart,
        text =
          editor.value.slice(start, editor.selectionEnd) ||
          (id === "link" ? "link text" : "bold text");
      if (id === "bold") {
        markdownInsert("**" + text + "**");
        editor.setSelectionRange(start + 2, start + 2 + text.length);
      } else {
        markdownInsert("[" + text + "](https://example.com)");
        editor.setSelectionRange(
          start + text.length + 3,
          start + text.length + 3 + "https://example.com".length,
        );
      }
    } else if (id === "link") {
      const selection = frame.contentWindow.getSelection();
      const range = selection.rangeCount
        ? selection.getRangeAt(0).cloneRange()
        : null;
      const url = prompt("Link URL", "https://");
      if (!url) return;
      if (!/^(https?:\/\/|mailto:)/i.test(url)) {
        setStatus("Use an https://, http://, or mailto: link.");
        return;
      }
      if (range) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      richCommand("createLink", url);
    } else
      richCommand({ bold: "bold", nest: "indent", outdent: "outdent" }[id]);
  };
});
editor.addEventListener("keydown", (e) => {
  if (e.isComposing || reading) return;
  if (e.key === "Tab") {
    e.preventDefault();
    indentMarkdown(e.shiftKey);
  }
  if (
    e.key === "Enter" &&
    !e.shiftKey &&
    editor.selectionStart === editor.selectionEnd
  ) {
    const start = editor.selectionStart,
      lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
    const match = editor.value
      .slice(lineStart, start)
      .match(/^(\s*)([-*+] |\d+\. )(.*)$/);
    if (!match) return;
    e.preventDefault();
    if (!match[3].trim()) markdownInsert("", lineStart, start);
    else
      markdownInsert(
        "\n" +
          match[1] +
          (/\d/.test(match[2]) ? parseInt(match[2], 10) + 1 + ". " : match[2]),
      );
  }
});
$("retry").onclick = () => {
  stopped = false;
  $("recovery").hidden = true;
  save();
};
$("restore").onclick = () => {
  stopped = false;
  $("recovery").hidden = true;
  changed(recoveryDraft.markdown);
};
$("reload").onclick = async () => {
  try {
    const current = await api("content");
    markdown = current.markdown;
    lastSaved = markdown;
    revision = current.revision;
    editor.value = markdown;
    stopped = false;
    ready = true;
    try {
      localStorage.removeItem(draftKey);
    } catch {}
    $("recovery").hidden = true;
    await render();
    setStatus("Saved to website");
  } catch (error) {
    setStatus("Could not reload source");
    showRecovery(error.message);
  }
};
$("download").onclick = () => {
  const url = URL.createObjectURL(
    new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "website-draft.md";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
window.addEventListener("beforeunload", (e) => {
  if (markdown !== lastSaved) {
    stash();
    e.preventDefault();
    e.returnValue = "";
  }
});
async function init() {
  try {
    const current = await api("content");
    markdown = current.markdown;
    lastSaved = markdown;
    revision = current.revision;
    editor.value = markdown;
    try {
      recoveryDraft = JSON.parse(localStorage.getItem(draftKey) || "null");
    } catch {}
    ready = true;
    prepareFrame();
    await render();
    setStatus("Saved to website");
    if (
      recoveryDraft &&
      typeof recoveryDraft.markdown === "string" &&
      recoveryDraft.markdown !== markdown
    ) {
      stopped = true;
      showRecovery(
        "An unsaved browser draft is available. Restore it or reload the source.",
        { restore: true },
      );
    }
  } catch (error) {
    setStatus("Could not open the source");
    showRecovery(error.message);
  }
}
init();

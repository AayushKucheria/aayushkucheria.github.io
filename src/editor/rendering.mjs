import { renderMarkdown } from "./content.mjs";

const icons = {
  "github.com": "M12 .75a11.25 11.25 0 0 0-3.558 21.922c.562.103.768-.244.768-.542 0-.267-.01-.975-.015-1.913-3.13.68-3.791-1.508-3.791-1.508-.511-1.299-1.248-1.645-1.248-1.645-1.021-.698.077-.684.077-.684 1.129.08 1.723 1.159 1.723 1.159 1.003 1.719 2.633 1.223 3.275.935.102-.727.392-1.223.714-1.504-2.499-.285-5.126-1.25-5.126-5.566 0-1.23.44-2.233 1.159-3.021-.116-.285-.502-1.43.11-2.98 0 0 .944-.302 3.094 1.154a10.79 10.79 0 0 1 5.635 0c2.148-1.456 3.09-1.154 3.09-1.154.614 1.55.228 2.695.112 2.98.721.788 1.158 1.791 1.158 3.021 0 4.327-2.631 5.278-5.138 5.557.404.35.764 1.04.764 2.096 0 1.513-.014 2.733-.014 3.104 0 .3.202.651.774.541A11.25 11.25 0 0 0 12 .75Z",
  "linkedin.com": "M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96C2 21.32 2.69 22 3.55 22h16.9c.86 0 1.55-.68 1.55-1.52V3.52C22 2.68 21.31 2 20.45 2ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.79-1.52 2.99 0 3.58 1.97 3.58 4.53v5.24Z",
  "x.com": "M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.44L5.54 22H2.42l7.27-8.31L1.8 2h6.4l4.43 6.77L18.9 2Zm-1.1 18h1.73L7.25 3.88H5.4L17.8 20Z"
};
icons["twitter.com"] = icons["x.com"];
icons["buymeacoffee.com"] = "M4 7h13v2h2a3 3 0 0 1 0 6h-2a6 6 0 0 1-6 5h-1a6 6 0 0 1-6-6V7Zm2 2v5a4 4 0 0 0 4 4h1a4 4 0 0 0 4-4V9H6Zm11 2v2h2a1 1 0 0 0 0-2h-2ZM7 2h2v3H7V2Zm4-1h2v4h-2V1Zm4 1h2v3h-2V2ZM3 21h17v2H3v-2Z";
const genericIcon = "M14 3h7v7h-2V6.41l-9.3 9.3-1.41-1.42L17.59 5H14V3ZM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z";

export function renderSection(section, markdown) {
  if (section === "name" || section === "location" || section === "contact-heading") {
    return markdown.trim().replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  }
  const html = renderMarkdown(markdown);
  if (section !== "socials") return html;
  return html.replace(/<a ([^>]*)>([\s\S]*?)<\/a>/g, (_, attributes, label) => {
    let host = "";
    try {
      host = new URL(attributes.match(/\bhref="([^"]+)"/)?.[1]).hostname.replace(/^www\./, "");
    } catch {}
    const path = icons[host] || genericIcon;
    return `<a ${attributes}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="${path}" /></svg><span class="social-label">${label}</span></a>`;
  });
}

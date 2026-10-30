const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

function safeHref(raw: string): string | null {
  const value = raw.trim();
  if (/^(https?:|mailto:)/i.test(value) || /^(\/|#)(?!\/)/.test(value)) return value;
  return null;
}

function markdownInline(source: string): string {
  let text = escapeHtml(source);
  const code: string[] = [];
  text = text.replace(/`([^`]+)`/g, (_, value) => {
    const index = code.push(`<code>${value}</code>`) - 1;
    return `\u0000CODE${index}\u0000`;
  });
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
    const href = safeHref(url);
    return href ? `<img src="${escapeHtml(href)}" alt="${alt}" />` : alt;
  });
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const href = safeHref(url);
    return href ? `<a href="${escapeHtml(href)}">${label}</a>` : label;
  });
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    .replace(/\*(?!\s)(.+?)(?<!\s)\*/g, "<em>$1</em>")
    .replace(/_(?!\s)(.+?)(?<!\s)_/g, "<em>$1</em>");
  return text.replace(/\u0000CODE(\d+)\u0000/g, (_match, index) => code[Number(index)] ?? "");
}

/** Converts common Markdown blocks to safe HTML for the Tiptap editor. Raw HTML is escaped. */
export function markdownToEditorHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  const isFence = (line: string) => /^\s*```/.test(line);
  const isHr = (line: string) => /^\s*(---+|___+|\*\s*\*\s*\*)\s*$/.test(line);
  const isUl = (line: string) => /^\s*[-+*]\s+/.test(line);
  const isOl = (line: string) => /^\s*\d+[.)]\s+/.test(line);
  const isQuote = (line: string) => /^\s*>\s?/.test(line);
  const isHeading = (line: string) => /^\s{0,3}#{1,6}\s+/.test(line);
  const isBlockStart = (line: string) => !line.trim() || isFence(line) || isHr(line) || isUl(line) || isOl(line) || isQuote(line) || isHeading(line);

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (isFence(line)) {
      const opening = line.match(/^\s*```\s*([\w+-]*)/);
      const language = opening?.[1] || "";
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !isFence(lines[i])) codeLines.push(lines[i++]);
      if (i < lines.length) i++;
      const languageAttr = language ? ` class="language-${escapeHtml(language)}"` : "";
      out.push(`<pre><code${languageAttr}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }
    if (isHr(line)) { out.push("<hr>"); i++; continue; }
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) { const level = heading[1].length; out.push(`<h${level}>${markdownInline(heading[2])}</h${level}>`); i++; continue; }
    if (isQuote(line)) {
      const quote: string[] = [];
      while (i < lines.length && isQuote(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ""));
      out.push(`<blockquote><p>${quote.map(markdownInline).join("<br>")}</p></blockquote>`);
      continue;
    }
    if (isUl(line) || isOl(line)) {
      const ordered = isOl(line);
      const tag = ordered ? "ol" : "ul";
      const items: string[] = [];
      while (i < lines.length && (ordered ? isOl(lines[i]) : isUl(lines[i]))) {
        const item = lines[i++].replace(ordered ? /^\s*\d+[.)]\s+/ : /^\s*[-+*]\s+/, "");
        items.push(`<li><p>${markdownInline(item)}</p></li>`);
      }
      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }
    const paragraph: string[] = [];
    while (i < lines.length && !isBlockStart(lines[i])) paragraph.push(lines[i++]);
    if (paragraph.length) out.push(`<p>${paragraph.map(markdownInline).join("<br>")}</p>`);
  }
  return out.join("");
}

export function looksLikeMarkdown(value: string): boolean {
  return /(^|\n)\s{0,3}(#{1,6}\s|[-+*]\s+|\d+[.)]\s+|>\s?|```|---+\s*$)|\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)]+\)|!\[[^\]]*\]\([^)]+\)|~~[^~]+~~|\*(?!\s)[^*\n]+\*|_(?!\s)[^_\n]+_/m.test(value);
}

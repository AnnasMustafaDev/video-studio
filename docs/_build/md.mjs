// Minimal, safe Markdown to HTML for the docs site. No dependencies.
// Supports: headings, paragraphs, bullet/numbered lists (one level of nesting by indent), tables,
// fenced code, blockquotes, hr, inline code/bold/italic/links. Raw HTML is escaped, never passed through.
import { esc, safeUrl } from './template.mjs';

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function inline(src) {
  // 1) pull out code spans so their content is not touched
  const codes = [];
  let s = String(src).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  // 2) escape everything else
  s = esc(s);
  // 3) links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => {
    const u = safeUrl(url.replace(/&amp;/g, '&'));
    const ext = /^https?:/i.test(u);
    return `<a href="${esc(u)}"${ext ? ' rel="noopener noreferrer"' : ''}>${text}</a>`;
  });
  // 4) bold / italic
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  // 5) restore code
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
  return s;
}

function splitRow(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}

/**
 * @param {string} md
 * @param {{ headingOffset?: number, anchors?: boolean, stripFrontmatter?: boolean }} opts
 * @returns {{ html: string, headings: {level:number,text:string,id:string}[], title: string }}
 */
export function renderMarkdown(md, opts = {}) {
  const { headingOffset = 0, anchors = true, stripFrontmatter = true } = opts;
  let text = String(md).replace(/\r\n?/g, '\n');
  if (stripFrontmatter) text = text.replace(/^---\n[\s\S]*?\n---\n/, '');
  const lines = text.split('\n');
  const out = [];
  const headings = [];
  let title = '';
  let i = 0;

  const isTableSep = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l || '');
  const listRe = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    const fence = line.match(/^\s*(```|~~~)\s*([\w-]*)\s*$/);
    if (fence) {
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code${fence[2] ? ` class="lang-${esc(fence[2])}"` : ''}>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // heading
    const hm = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (hm) {
      const level = Math.min(6, Math.max(1, hm[1].length + headingOffset));
      const raw = hm[2];
      const id = slugify(raw);
      if (!title && hm[1].length === 1) title = raw.replace(/`/g, '');
      headings.push({ level, text: raw.replace(/`/g, ''), id });
      out.push(`<h${level} id="${esc(id)}">${inline(raw)}</h${level}>`);
      i++;
      continue;
    }

    // hr
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // table
    if (line.includes('|') && isTableSep(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') rows.push(splitRow(lines[i++]));
      out.push(
        `<table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>` +
          rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('') +
          `</tbody></table>`
      );
      continue;
    }

    // blockquote
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push(`<blockquote>${renderMarkdown(buf.join('\n'), { ...opts, anchors: false, stripFrontmatter: false }).html}</blockquote>`);
      continue;
    }

    // list (with simple nesting by indent)
    if (listRe.test(line)) {
      const items = [];
      while (i < lines.length && (listRe.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        const m = lines[i].match(listRe);
        if (m) items.push({ indent: m[1].length, ordered: /\d/.test(m[2]), text: m[3] });
        else items[items.length - 1].text += ' ' + lines[i].trim();
        i++;
      }
      const build = (idx, indent) => {
        let html = '';
        const ordered = items[idx].ordered;
        html += ordered ? '<ol>' : '<ul>';
        while (idx < items.length && items[idx].indent >= indent) {
          if (items[idx].indent > indent) {
            // nested list belongs to previous li
            const [nested, next] = build(idx, items[idx].indent);
            html = html.replace(/<\/li>$/, nested + '</li>');
            idx = next;
            continue;
          }
          html += `<li>${inline(items[idx].text)}</li>`;
          idx++;
        }
        html += ordered ? '</ol>' : '</ul>';
        return [html, idx];
      };
      out.push(build(0, items[0].indent)[0]);
      continue;
    }

    // blank
    if (line.trim() === '') {
      i++;
      continue;
    }

    // paragraph
    const buf = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^\s*(```|~~~|#{1,6}\s|>|[-*+]\s|\d+[.)]\s)/.test(lines[i]) &&
      !(lines[i].includes('|') && isTableSep(lines[i + 1]))
    )
      buf.push(lines[i++]);
    out.push(`<p>${inline(buf.join(' '))}</p>`);
  }

  void anchors;
  return { html: out.join('\n'), headings, title };
}

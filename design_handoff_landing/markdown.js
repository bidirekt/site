// Minimal GFM renderer → React elements, styled inline for the bidirekt docs set.
const C = { text: '#EDEDED', sec: '#A1A1A1', mut: '#6B6B6B', pane: '#0A0A0A', border: '#1F1F1F', hover: '#111111', accent: '#F5A524' };
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS = "Inter, system-ui, sans-serif";

export function parseFrontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  const meta = {};
  if (!m) return { meta, body: src };
  m[1].split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  return { meta, body: src.slice(m[0].length) };
}

export function slug(text) {
  return text.toLowerCase().replace(/`/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

// ---- block parsing ----
function parseBlocks(lines) {
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) { blocks.push({ t: 'h', level: m[1].length, text: m[2].trim() }); i++; continue; }
    if ((m = line.match(/^```(\w*)\s*$/))) {
      const lang = m[1]; const buf = []; i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++; blocks.push({ t: 'code', lang, code: buf.join('\n') }); continue;
    }
    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
      blocks.push({ t: 'quote', children: parseBlocks(buf) }); continue;
    }
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = r => r.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => c.trim());
      blocks.push({ t: 'table', head: cells(rows[0]), rows: rows.slice(2).map(cells) }); continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { blocks.push({ t: 'hr' }); i++; continue; }
    if ((m = line.match(/^(\s*)([-*]|\d+\.)\s+/))) {
      const ordered = /\d/.test(m[2]); const baseIndent = m[1].length; const items = [];
      while (i < lines.length) {
        const l = lines[i];
        const mm = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (mm && mm[1].length === baseIndent && (/\d/.test(mm[2]) === ordered)) {
          items.push([mm[3]]); i++; continue;
        }
        if (!l.trim()) { // blank: continue only if next line is indented content of the list
          if (i + 1 < lines.length && /^\s{2,}\S/.test(lines[i + 1]) && items.length) { items[items.length - 1].push(''); i++; continue; }
          break;
        }
        if (/^\s+\S/.test(l) && l.match(/^\s*/)[0].length > baseIndent && items.length) {
          items[items.length - 1].push(l.slice(Math.min(l.match(/^\s*/)[0].length, baseIndent + (ordered ? 3 : 2)))); i++; continue;
        }
        break;
      }
      blocks.push({ t: 'list', ordered, items: items.map(it => parseListItem(it)) }); continue;
    }
    // paragraph
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|\s*>|\s*\||\s*([-*]|\d+\.)\s)/.test(lines[i])) buf.push(lines[i++]);
    if (!buf.length) { buf.push(lines[i++]); }
    blocks.push({ t: 'p', text: buf.join(' ').replace(/\s+/g, ' ').trim() });
  }
  return blocks;
}

function parseListItem(itemLines) {
  const first = [itemLines[0]]; let j = 1;
  while (j < itemLines.length && itemLines[j].trim() && !/^\s*([-*]|\d+\.)\s/.test(itemLines[j]) && !/^```/.test(itemLines[j])) first.push(itemLines[j++]);
  const rest = parseBlocks(itemLines.slice(j));
  return { text: first.join(' ').replace(/\s+/g, ' ').trim(), children: rest };
}

// ---- inline ----
function inline(React, text, opts, keyBase) {
  const out = []; let k = 0; let rest = text;
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/;
  while (rest.length) {
    const m = rest.match(re);
    if (!m) { out.push(rest); break; }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const tok = m[0]; const key = keyBase + '-' + (k++);
    if (tok.startsWith('`')) out.push(React.createElement('code', { key, style: S.codeInline }, tok.slice(1, -1)));
    else if (tok.startsWith('**')) out.push(React.createElement('strong', { key, style: { color: C.text, fontWeight: 600 } }, inline(React, tok.slice(2, -2), opts, key)));
    else if (tok.startsWith('*')) out.push(React.createElement('em', { key, style: { color: C.sec, fontStyle: 'italic' } }, inline(React, tok.slice(1, -1), opts, key)));
    else {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = lm[2];
      const external = /^https?:/.test(href);
      out.push(React.createElement('a', {
        key, href, style: S.link,
        target: external ? '_blank' : undefined, rel: external ? 'noreferrer' : undefined,
        onClick: e => { if (!external && opts.onNavigate) { e.preventDefault(); opts.onNavigate(href); } },
      }, inline(React, lm[1], opts, key), external ? ' ↗' : ''));
    }
    rest = rest.slice(m.index + tok.length);
  }
  return out;
}

const S = {
  codeInline: { fontFamily: MONO, fontSize: '0.92em', color: C.text, background: C.hover, border: `1px solid ${C.border}`, borderRadius: 2, padding: '1px 5px', whiteSpace: 'nowrap' },
  link: { color: C.accent, textDecoration: 'none', borderBottom: `1px solid ${C.accent}55` },
};

function CodeBlock({ React, code, lang, k }) {
  const isShell = !lang || /^(sh|shell|bash|console|text)$/.test(lang);
  const lines = code.split('\n');
  const [copied, setCopied] = React.useState(false);
  const copy = () => { try { navigator.clipboard.writeText(code); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1200); };
  return React.createElement('div', { style: { border: `1px solid ${C.border}`, background: C.pane, borderRadius: 2, margin: '16px 0', fontFamily: MONO, fontSize: 13, lineHeight: 1.45, position: 'relative' } },
    React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px', borderBottom: `1px solid ${C.border}`, color: C.mut, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' } },
      React.createElement('span', null, '── ' + (lang || (isShell && /^\$ /.test(lines[0]) ? 'shell' : 'text'))),
      React.createElement('button', { onClick: copy, style: { background: 'transparent', border: 'none', color: copied ? C.accent : C.mut, fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', padding: 0 } }, copied ? '[ copied ]' : '[ copy ]')),
    React.createElement('pre', { style: { margin: 0, padding: '12px 16px', color: C.text, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: MONO } },
      lines.map((l, i) => {
        if (lang === 'yaml') return React.createElement('div', { key: i }, yamlLine(React, l));
        if (isShell && /^\$ /.test(l)) return React.createElement('div', { key: i, style: { color: C.mut, paddingLeft: '2ch', textIndent: '-2ch' } }, React.createElement('span', { style: { color: C.accent } }, '$ '), l.slice(2));
        return React.createElement('div', { key: i, style: { color: C.text, minHeight: '1.45em' } }, l);
      })));
}

function yamlLine(React, l) {
  const m = l.match(/^(\s*)(-\s+)?("?[^:"]+"?)(:)(.*)$/);
  if (!m) return React.createElement('span', null, l);
  return [
    m[1] + (m[2] || ''),
    React.createElement('span', { key: 'k', style: { color: C.sec } }, m[3]),
    React.createElement('span', { key: 'c', style: { color: C.mut } }, ':'),
    React.createElement('span', { key: 'v', style: { color: C.text } }, m[5]),
  ];
}

// ---- render ----
export function renderMarkdown(React, body, opts = {}) {
  const prose = opts.proseFont === 'sans' ? SANS : MONO;
  const toc = [];
  const blocks = parseBlocks(body.replace(/\r/g, '').split('\n'));
  let seenH1 = false;
  const render = (bs, keyBase, ctx = {}) => bs.map((b, i) => {
    const key = keyBase + '-' + i;
    switch (b.t) {
      case 'h': {
        if (b.level === 1 && !seenH1 && opts.skipFirstH1) { seenH1 = true; return null; }
        const id = slug(b.text);
        if (b.level === 2 || b.level === 3) toc.push({ id, text: b.text.replace(/`/g, ''), level: b.level });
        const size = { 1: 40, 2: 24, 3: 18 }[b.level] || 14;
        return React.createElement('h' + b.level, { key, id, style: { fontFamily: MONO, fontSize: size, fontWeight: 500, lineHeight: 1.25, color: C.text, margin: b.level === 1 ? '0 0 16px' : b.level === 2 ? '48px 0 16px' : '32px 0 12px', letterSpacing: b.level === 1 ? '-0.01em' : 0, scrollMarginTop: 72 } },
          inline(React, b.text, opts, key));
      }
      case 'p': return React.createElement('p', { key, style: { fontFamily: prose, fontSize: 14, lineHeight: 1.7, color: C.sec, margin: '0 0 16px', textWrap: 'pretty' } }, inline(React, b.text, opts, key));
      case 'code': return React.createElement(CodeBlock, { key, React, code: b.code, lang: b.lang });
      case 'quote': {
        const only = b.children.length === 1 && b.children[0].t === 'p' && /^Not written yet\.?$/.test(b.children[0].text);
        if (only && opts.placeholder) return React.createElement('div', { key }, opts.placeholder);
        return React.createElement('blockquote', { key, style: { margin: '16px 0', padding: '12px 16px', border: `1px solid ${C.border}`, borderLeft: `2px solid ${C.accent}`, background: C.pane, borderRadius: 2, fontFamily: prose, fontSize: 14, lineHeight: 1.7, color: C.text } },
          React.createElement('div', { style: { fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.mut, marginBottom: 8 } }, '> note'),
          render(b.children, key, { inQuote: true }));
      }
      case 'table': return React.createElement('div', { key, style: { overflowX: 'auto', margin: '16px 0', border: `1px solid ${C.border}`, borderRadius: 2, background: C.pane } },
        React.createElement('table', { style: { borderCollapse: 'collapse', width: '100%', fontFamily: MONO, fontSize: 13, lineHeight: 1.45 } },
          React.createElement('thead', null, React.createElement('tr', null, b.head.map((h, j) => React.createElement('th', { key: j, style: { textAlign: 'left', padding: '8px 12px', color: C.mut, fontWeight: 400, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' } }, inline(React, h, opts, key + 'h' + j))))),
          React.createElement('tbody', null, b.rows.map((r, ri) => React.createElement('tr', { key: ri }, r.map((c, j) => React.createElement('td', { key: j, style: { padding: '8px 12px', color: C.text, verticalAlign: 'top', borderBottom: ri < b.rows.length - 1 ? `1px solid ${C.border}` : 'none' } }, inline(React, c, opts, key + ri + '-' + j))))))));
      case 'hr': return React.createElement('div', { key, style: { color: C.border, fontFamily: MONO, overflow: 'hidden', whiteSpace: 'nowrap', margin: '24px 0' } }, '─'.repeat(120));
      case 'list': {
        const tag = b.ordered ? 'ol' : 'ul';
        return React.createElement(tag, { key, style: { listStyle: 'none', margin: '0 0 16px', padding: 0, fontFamily: prose, fontSize: 14, lineHeight: 1.7, color: C.sec } },
          b.items.map((it, j) => React.createElement('li', { key: j, style: { display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: 12, marginBottom: 4 } },
            React.createElement('span', { style: { color: C.mut, fontFamily: MONO, userSelect: 'none' } }, b.ordered ? (j + 1) + '.' : (j === b.items.length - 1 ? '└──' : '├──')),
            React.createElement('div', null, inline(React, it.text, opts, key + j), it.children.length ? render(it.children, key + 'c' + j) : null))));
      }
      default: return null;
    }
  });
  const elements = render(blocks, opts.keyPrefix || 'md');
  return { elements, toc };
}

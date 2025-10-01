// Shared utility functions and lightweight Markdown parsing

// Simple front-matter extractor (--- ... --- at top)
export function extractFrontMatter(markdown) {
  if (!markdown.startsWith('---')) return { meta: {}, body: markdown };
  const end = markdown.indexOf('\n---', 3);
  if (end === -1) return { meta: {}, body: markdown };
  const fmBlock = markdown.slice(3, end).trim();
  const body = markdown.slice(end + 4).trim();
  const meta = {};
  fmBlock.split(/\r?\n/).forEach(line => {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      let val = m[2].trim();
      if (/^\[.*\]$/.test(val)) {
        // array
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g,''));
      } else {
        val = val.replace(/^['"]|['"]$/g,'');
      }
      meta[key] = val;
    }
  });
  return { meta, body };
}

// Minimal Markdown -> HTML (headers, bold, italics, code, blockquote, hr, lists, links, inline code)
export function mdToHtml(md) {
  let html = md
    .replace(/\r\n?/g, '\n')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^\> (.*)$/gm, '<blockquote><p>$1</p></blockquote>')
    .replace(/^\s*[-*] (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m.replace(/\n/g,'')}</ul>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/---\n/g,'<hr />')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  // paragraphs:
  html = html.split(/\n{2,}/).map(block => {
    if (/^<h\d|^<blockquote|^<ul|^<hr|^<pre|^<p|^<figure/.test(block.trim())) return block;
    return `<p>${block.trim()}</p>`;
  }).join('\n');
  return html;
}

// Date formatting
export function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return iso;
  }
}

// Query param
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Basic slugify (not used extensively, but available)
export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

// Escape HTML
export function esc(str='') {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Set year
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
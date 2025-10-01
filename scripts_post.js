import { getParam, formatDate, mdToHtml, extractFrontMatter } from './util.js';

const slug = getParam('id');
const titleEl = document.getElementById('post-title');
const dateEl = document.getElementById('post-date');
const bodyEl = document.getElementById('post-body');
const tagsEl = document.getElementById('post-tags');
const crumbTitle = document.getElementById('crumb-title');
const prevLink = document.getElementById('prev-link');
const nextLink = document.getElementById('next-link');

if (!slug) {
  titleEl.textContent = 'No entry specified.';
} else {
  loadPost(slug);
}

function loadPost(slug) {
  const metaObj = postsArray.find(p => p.slug === slug);
  if (!metaObj) {
    titleEl.textContent = 'Entry Not Found';
    bodyEl.innerHTML = '<p>The requested journal page does not exist.</p>';
    return;
  }
  fetch(`posts/${slug}.md?cache-bust=${Date.now()}`)
    .then(r => r.ok ? r.text() : Promise.reject(r.status))
    .then(txt => {
      const { meta, body } = extractFrontMatter(txt);
      const finalMeta = { ...metaObj, ...meta };
      populate(finalMeta, body);
    })
    .catch(err => {
      titleEl.textContent = 'Error loading entry';
      bodyEl.innerHTML = `<p>Could not load this entry. (${err})</p>`;
    });
}

function populate(meta, mdBody) {
  document.title = `${meta.title} • Night Ledger`;
  titleEl.textContent = meta.title;
  if (crumbTitle) crumbTitle.textContent = meta.title;
  dateEl.textContent = formatDate(meta.date);
  dateEl.dateTime = meta.date;
  tagsEl.innerHTML = '';
  (meta.tags||[]).forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    tagsEl.appendChild(li);
  });

  // convert markdown
  const html = mdToHtml(mdBody);
  bodyEl.innerHTML = html;

  // Post navigation
  const sorted = postsArray.slice().sort((a,b)=> new Date(a.date)-new Date(b.date));
  const idx = sorted.findIndex(p => p.slug === meta.slug);
  if (idx > 0) {
    const prev = sorted[idx-1];
    prevLink.href = `post.html?id=${encodeURIComponent(prev.slug)}`;
    prevLink.textContent = `← ${prev.title}`;
    prevLink.hidden = false;
  }
  if (idx < sorted.length -1) {
    const next = sorted[idx+1];
    nextLink.href = `post.html?id=${encodeURIComponent(next.slug)}`;
    nextLink.textContent = `${next.title} →`;
    nextLink.hidden = false;
  }
}
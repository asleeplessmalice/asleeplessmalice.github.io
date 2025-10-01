import { formatDate, esc } from './util.js';

// postsArray provided by posts/posts.js
const searchInput = document.getElementById('search');
const searchForm = document.getElementById('search-form');
const clearBtn = document.getElementById('clear-search');
const listEl = document.getElementById('journal-list');
const template = document.getElementById('journal-card-template');
const emptyState = document.getElementById('empty-state');
const tagBar = document.getElementById('tag-bar');

let activeTag = null;
let query = '';
let filtered = postsArray.slice().sort((a,b)=> new Date(b.date)-new Date(a.date));

function renderTags() {
  const allTags = new Set();
  postsArray.forEach(p => (p.tags||[]).forEach(t => allTags.add(t)));
  tagBar.innerHTML = '';
  const frag = document.createDocumentFragment();
  [...allTags].sort().forEach(tag => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = tag;
    btn.dataset.tag = tag;
    btn.addEventListener('click', () => {
      activeTag = (activeTag === tag) ? null : tag;
      update();
    });
    frag.appendChild(btn);
  });
  if (allTags.size) {
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.textContent = 'All';
    clear.addEventListener('click', () => { activeTag = null; update(); });
    frag.insertBefore(clear, frag.firstChild);
  }
  tagBar.appendChild(frag);
  highlightActiveTag();
}

function highlightActiveTag() {
  [...tagBar.querySelectorAll('button')].forEach(b => {
    b.dataset.active = (b.textContent === activeTag) ? 'true' : 'false';
    if (!activeTag && b.textContent === 'All') b.dataset.active = 'true';
  });
}

function matches(post) {
  if (activeTag && !(post.tags||[]).includes(activeTag)) return false;
  if (!query) return true;
  const q = query.toLowerCase();
  return [post.title, post.excerpt, (post.tags||[]).join(' ')].some(x => (x||'').toLowerCase().includes(q));
}

function update() {
  filtered = postsArray.filter(matches).sort((a,b)=> new Date(b.date)-new Date(a.date));
  draw();
  highlightActiveTag();
}

function draw() {
  listEl.querySelectorAll('.journal-card').forEach(el => el.remove());
  emptyState.hidden = filtered.length !== 0;
  const frag = document.createDocumentFragment();
  filtered.forEach(post => {
    const node = template.content.cloneNode(true);
    const art = node.querySelector('.journal-card');
    const link = node.querySelector('.card-link');
    const media = node.querySelector('.card-media');
    const titleEl = node.querySelector('.card-title');
    const dateEl = node.querySelector('.card-date');
    const excerptEl = node.querySelector('.card-excerpt');
    const tagsEl = node.querySelector('.card-tags');

    link.href = `post.html?id=${encodeURIComponent(post.slug)}`;
    if (post.hero) {
      media.style.backgroundImage = `linear-gradient(#00000040,#00000090), url('${post.hero}')`;
    } else {
      media.style.backgroundImage = `radial-gradient(circle at 30% 40%, #351d33, #140e15)`;
    }
    titleEl.textContent = post.title;
    dateEl.textContent = formatDate(post.date);
    dateEl.dateTime = post.date;
    excerptEl.textContent = post.excerpt;
    (post.tags||[]).forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      tagsEl.appendChild(li);
    });
    frag.appendChild(node);
  });
  listEl.appendChild(frag);
}

searchForm?.addEventListener('submit', e => {
  e.preventDefault();
  query = searchInput.value.trim();
  clearBtn.hidden = !query;
  update();
});
clearBtn?.addEventListener('click', () => {
  searchInput.value = '';
  query = '';
  clearBtn.hidden = true;
  update();
});
searchInput?.addEventListener('input', () => {
  if (!searchInput.value && query) {
    query = '';
    clearBtn.hidden = true;
    update();
  } else if (searchInput.value) {
    clearBtn.hidden = false;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement === document.body) {
    e.preventDefault();
    searchInput?.focus();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderTags();
  update();
});
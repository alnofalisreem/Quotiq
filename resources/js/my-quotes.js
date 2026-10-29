import { createQuoteBody, createDownloadButton } from './quote-card.js';
import { store, flush } from './data-store.js';
import { createSocialButton, updateSocialButtons } from './quote-social.js';

const storageKey = 'quotiq.preview.posts.v1';
const container = document.getElementById('my-quotes-list');
const status = document.getElementById('my-quotes-status');
let posts = [];
function loadPosts() {
    try {
        const data = JSON.parse(store.getItem(storageKey) || '[]');
        posts = Array.isArray(data)
            ? data.filter(
                  (post) =>
                      typeof post.id === 'string' &&
                      typeof post.text === 'string' &&
                      Array.isArray(post.drawing_data),
              )
            : [];
    } catch {
        posts = [];
        status.textContent = 'Your quotes could not be loaded. Please refresh and try again.';
    }
}
function link(label, url) {
    const a = document.createElement('a');
    a.className = 'text-button';
    a.textContent = label;
    a.href = url;
    return a;
}
function renderPosts() {
    container.replaceChildren();
    document.getElementById('my-quotes-count').textContent =
        `${posts.length} ${posts.length === 1 ? 'quote' : 'quotes'}`;
    document.getElementById('my-quotes-empty').hidden = posts.length > 0;
    for (const post of posts) {
        const article = document.createElement('article');
        article.className = 'preview-post';
        article.dataset.postId = 'own-' + post.id;
        article.dataset.postKind = 'own';
        article.dataset.sourceId = post.id;
        const category = document.createElement('span');
        category.className = 'preview-post-category';
        category.textContent = post.isGolden ? 'Golden Daily Quote' : post.category;
        if (post.isGolden) article.classList.add('golden-quote');
        article.append(category);
        article.append(
            createQuoteBody(article, post, {
                drawingLabel: 'Your drawing',
                imageAlt: 'Your designed drawing card',
            }),
        );
        const meta = document.createElement('div');
        meta.className = 'preview-post-meta';
        meta.textContent =
            (post.author || document.body.dataset.userName) +
            ' · ' +
            new Date(post.date).toLocaleDateString();
        article.append(meta);
        if (post.expiresAt) article.dataset.expiresAt = post.expiresAt;
        const actions = document.createElement('div');
        actions.className = 'preview-post-actions';
        actions.setAttribute('data-export-ignore', '');
        const download = createDownloadButton();
        const remove = document.createElement('button');
        remove.className = 'text-button';
        remove.textContent = 'Delete';
        remove.onclick = async () => {
            try {
                const latest = JSON.parse(store.getItem(storageKey) || '[]');
                store.setItem(storageKey, JSON.stringify(latest.filter((p) => p.id !== post.id)));
                await flush();
                loadPosts();
                renderPosts();
                window.dispatchEvent(new Event('quotiq:posts-change'));
            } catch {
                status.textContent = 'The quote could not be deleted. Please try again.';
            }
        };
        actions.append(
            createSocialButton('favorites'),
            download,
            link('Edit', '/preview?edit=' + encodeURIComponent(post.id) + '#draw'),
            remove,
        );
        article.append(actions);
        container.append(article);
    }
    updateSocialButtons();
}
window.addEventListener('storage', (event) => {
    if (event.key === storageKey || event.key === null) {
        loadPosts();
        renderPosts();
    }
});
window.addEventListener('quotiq:posts-change', () => {
    loadPosts();
    renderPosts();
});
window.addEventListener('pageshow', () => {
    loadPosts();
    renderPosts();
});
loadPosts();
renderPosts();

setInterval(() => {
    const expired = posts.some((post) => post.expiresAt && post.expiresAt <= Date.now());
    if (expired) {
        posts = posts.filter((post) => !post.expiresAt || post.expiresAt > Date.now());
        renderPosts();
    }
}, 1000);

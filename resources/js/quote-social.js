import { createQuoteBody, createDownloadButton } from './quote-card.js';
import { store, flush, state } from './data-store.js';
import { canDownloadPosts } from './post-download.js';

const ownKey = 'quotiq.preview.posts.v1';
const keys = { favorites: 'quotiq.preview.favorites.v1', reposts: 'quotiq.preview.reposts.v1' };
const paths = {
    favorites:
        'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    reposts: 'm17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3',
    download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
};
function read(key) {
    const value = JSON.parse(store.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
}
function ownPosts() {
    return read(ownKey);
}
function resolve(record) {
    if (record.expiresAt && record.expiresAt <= Date.now()) return null;
    if (record.kind === 'own') {
        const post = ownPosts().find((post) => post.id === record.sourceId);
        return post ? { ...record, ...post, id: record.id, author: record.author } : null;
    }
    return record;
}
function records(kind) {
    const saved = read(keys[kind]).filter((record) => record && typeof record.id === 'string');
    const live = saved.map(resolve).filter(Boolean);
    if (saved.length !== live.length)
        store.setItem(keys[kind], JSON.stringify(saved.filter((record) => resolve(record))));
    return live;
}
function notify(message) {
    let status = document.getElementById('social-status');
    if (!status) {
        status = document.createElement('p');
        status.id = 'social-status';
        status.className = 'download-notice';
        status.setAttribute('role', 'status');
        document.body.append(status);
    }
    status.textContent = message;
    clearTimeout(status.timer);
    status.timer = setTimeout(() => status.remove(), 3500);
}
function requireAccount() {
    const dialog = document.getElementById('auth-dialog');
    if (!dialog) {
        window.location.assign('/login');
        return;
    }
    document.getElementById('auth-dialog-message').textContent =
        'Log in to save favorites and repost quotes.';
    const link = dialog.querySelector('.preview-dialog-link');
    if (link) link.href = '/preview#draw';
    dialog.showModal();
}
export function createSocialButton(kind) {
    const button = document.createElement('button');
    button.className = 'icon-button social-button';
    button.dataset.social = kind;
    button.setAttribute('data-export-ignore', '');
    button.setAttribute('aria-label', kind === 'favorites' ? 'Add to favorites' : 'Repost quote');
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML =
        '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
        paths[kind] +
        '"/></svg>';
    return button;
}
function capture(element) {
    const id = element.dataset.postId;
    if (!id) throw Error('This quote is unavailable. Refresh the page.');
    if (element.dataset.postKind === 'own')
        return {
            id,
            kind: 'own',
            sourceId: element.dataset.sourceId,
            author: document.body.dataset.userName || 'You',
        };
    const source = state.public?.find((p) => p.id === element.dataset.sourceId);
    if (!source) throw Error('This quote is no longer available. Refresh the page.');
    return { ...source, id, kind: 'community', sourceId: source.id };
}
export function updateSocialButtons() {
    try {
        const favorites = new Set(records('favorites').map((post) => post.id)),
            reposts = new Set(records('reposts').map((post) => post.id));
        document.querySelectorAll('[data-social]').forEach((button) => {
            const post = button.closest('[data-post-id]');
            if (!post) return;
            const kind = button.dataset.social,
                active = (kind === 'favorites' ? favorites : reposts).has(post.dataset.postId);
            button.setAttribute('aria-pressed', String(active));
            button.classList.toggle('is-active', active);
            const label =
                kind === 'favorites'
                    ? active
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    : active
                      ? 'Remove repost'
                      : 'Repost quote';
            button.setAttribute('aria-label', label);
            button.title = label;
        });
    } catch {
        /* Storage errors are reported when the user attempts to save. */
    }
}
function renderSaved() {
    const container = document.getElementById('saved-quotes-list');
    if (!container) return;
    const kind = container.dataset.kind;
    try {
        const saved = records(kind);
        container.replaceChildren();
        document.getElementById(kind + '-count').textContent =
            `${saved.length} ${saved.length === 1 ? 'quote' : 'quotes'}`;
        document.getElementById('saved-quotes-empty').hidden = saved.length > 0;
        for (const post of saved) {
            const own = post.kind === 'own';
            const article = document.createElement('article');
            article.className = own ? 'preview-post' : 'quote-card card-' + post.background_color;
            article.dataset.postId = post.id;
            article.dataset.postKind = post.kind;
            if (own) article.dataset.sourceId = post.sourceId;
            if (post.expiresAt) article.dataset.expiresAt = post.expiresAt;
            const top = document.createElement('div');
            top.className = 'quote-card-top';
            const category = document.createElement('span');
            category.className = 'quote-category';
            category.textContent = post.isGolden ? 'Golden Daily Quote' : post.category;
            if (post.isGolden) article.classList.add('golden-quote');
            top.append(category, createSocialButton('favorites'));
            article.append(top);
            article.append(
                createQuoteBody(article, post, {
                    textClass: own ? 'preview-post-text' : 'quote-card-text',
                    drawingLabel: 'Saved drawing',
                    imageAlt: 'Saved drawing card',
                }),
            );
            const footer = document.createElement('div');
            footer.className = 'quote-card-bottom';
            const author = document.createElement('span');
            author.className = 'quote-author';
            author.textContent = post.author;
            footer.append(author, createDownloadButton());
            if (!own) footer.append(createSocialButton('reposts'));
            article.append(footer);
            container.append(article);
        }
    } catch {
        document.getElementById('saved-quotes-status').textContent =
            'Saved quotes could not be loaded. Please try again.';
    }
    updateSocialButtons();
}
document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-social]');
    if (!button) return;
    event.preventDefault();
    if (!canDownloadPosts()) {
        requireAccount();
        return;
    }
    const element = button.closest('[data-post-id]');
    if (!element) return;
    const kind = button.dataset.social;
    if (button.disabled) return;
    button.disabled = true;
    if (kind === 'reposts' && element.dataset.postKind === 'own') {
        button.disabled = false;
        return;
    }
    try {
        const record = capture(element),
            saved = read(keys[kind]),
            exists = saved.some((post) => post.id === record.id);
        const next = exists ? saved.filter((post) => post.id !== record.id) : [record, ...saved];
        store.setItem(keys[kind], JSON.stringify(next));
        await flush();
        renderSaved();
        updateSocialButtons();
        notify(
            kind === 'favorites'
                ? exists
                    ? 'Removed from favorites.'
                    : 'Saved to favorites.'
                : exists
                  ? 'Repost removed.'
                  : 'Quote reposted.',
        );
    } catch {
        notify('Could not save your change. Please try again.');
    } finally {
        button.disabled = false;
    }
});
window.addEventListener('storage', (event) => {
    if (Object.values(keys).includes(event.key) || event.key === ownKey || event.key === null) {
        renderSaved();
        updateSocialButtons();
    }
});
window.addEventListener('quotiq:posts-change', () => {
    renderSaved();
    updateSocialButtons();
});
window.addEventListener('pageshow', () => {
    renderSaved();
    updateSocialButtons();
});
renderSaved();
updateSocialButtons();

setInterval(() => {
    const container = document.getElementById('saved-quotes-list');
    if (
        container &&
        [...container.querySelectorAll('[data-expires-at]')].some(
            (card) => Number(card.dataset.expiresAt) <= Date.now(),
        )
    )
        renderSaved();
}, 1000);

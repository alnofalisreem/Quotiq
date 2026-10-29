import { createQuoteBody, createDownloadButton } from './quote-card.js';
import { store, flush } from './data-store.js';
import { paintDrawing } from './drawing-renderer.js';
import { canDownloadPosts } from './post-download.js';
import { createSocialButton, updateSocialButtons } from './quote-social.js';

const $ = (id) => document.getElementById(id);
const collectionKey = 'quotiq.preview.collections.v1',
    postKey = 'quotiq.preview.posts.v1';
const activeId = document.querySelector('.collections-page').dataset.collectionId;
let renameId = null;
const chosen = new Set();
function readArray(key) {
    const data = JSON.parse(store.getItem(key) || '[]');
    if (!Array.isArray(data)) throw Error('Saved data could not be read.');
    return data;
}
function posts() {
    return readArray(postKey).filter(
        (p) =>
            typeof p.id === 'string' && typeof p.text === 'string' && Array.isArray(p.drawing_data),
    );
}
function collections() {
    const ids = new Set(posts().map((p) => p.id));
    const data = readArray(collectionKey).filter(
        (c) => typeof c.id === 'string' && typeof c.name === 'string' && Array.isArray(c.quoteIds),
    );
    let changed = false;
    for (const c of data) {
        const live = [...new Set(c.quoteIds)].filter((id) => ids.has(id));
        if (live.length !== c.quoteIds.length) changed = true;
        c.quoteIds = live;
    }
    if (changed) store.setItem(collectionKey, JSON.stringify(data));
    return data;
}
function save(data) {
    store.setItem(collectionKey, JSON.stringify(data));
}
function nameCount(number, noun) {
    return `${number} ${number === 1 ? noun : noun + 's'}`;
}
function action(text, fn) {
    const button = document.createElement('button');
    button.className = 'text-button';
    button.type = 'button';
    button.textContent = text;
    button.onclick = fn;
    return button;
}
function requireMember() {
    if (canDownloadPosts()) return true;
    $('collections-status').textContent = 'Log in to manage collections, to continue.';
    return false;
}
function openName(collection = null) {
    if (!requireMember()) return;
    renameId = collection?.id || null;
    $('collection-name-title').textContent = renameId ? 'Rename collection' : 'Create collection';
    $('collection-save-name').textContent = renameId ? 'Save name' : 'Create collection';
    $('collection-name').value = collection?.name || '';
    $('collection-name-error').textContent = '';
    const suggestions = $('collection-suggestions');
    suggestions.replaceChildren();
    const options = ['Notes to Myself', 'On Hard Days', 'Things I Believe In', 'Study Fuel'];
    for (const name of options) {
        const button = action(name, () => {
            $('collection-name').value = name;
            $('collection-name').focus();
            markSuggestion();
        });
        button.className = 'suggested-name';
        suggestions.append(button);
    }
    $('collection-name-dialog').showModal();
}
function markSuggestion() {
    document
        .querySelectorAll('.suggested-name')
        .forEach((button) =>
            button.classList.toggle(
                'selected',
                button.textContent === $('collection-name').value.trim(),
            ),
        );
}
$('collection-name').addEventListener('input', markSuggestion);
$('collection-create').onclick = () => openName();
$('collection-name-form').onsubmit = async (event) => {
    event.preventDefault();
    if (!requireMember()) return;
    const name = $('collection-name').value.trim();
    if (!name || Array.from(name).length > 60) {
        $('collection-name-error').textContent = 'Enter a name of 1–60 characters.';
        return;
    }
    try {
        const data = collections();
        if (
            data.some(
                (c) => c.id !== renameId && c.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
            )
        ) {
            $('collection-name-error').textContent =
                'You already have a collection with that name.';
            return;
        }
        if (renameId) {
            const existing = data.find((c) => c.id === renameId);
            if (!existing) throw Error('This collection no longer exists.');
            existing.name = name;
        } else
            data.unshift({
                id: crypto.randomUUID(),
                name,
                quoteIds: [],
                createdAt: new Date().toISOString(),
                background_color: ['green', 'ivory', 'orange', 'red'][data.length % 4],
            });
        save(data);
        await flush();
        $('collection-name-dialog').close();
        render();
    } catch (error) {
        $('collection-name-error').textContent =
            error.message || 'Could not save the collection. Please try again.';
    }
};
async function removeCollection(id) {
    if (!requireMember()) return;
    try {
        save(collections().filter((c) => c.id !== id));
        await flush();
        render();
    } catch {
        $('collections-status').textContent =
            'The collection could not be deleted. Please try again.';
    }
}
function renderQuote(post) {
    const article = document.createElement('article');
    article.className = 'preview-post';
    article.dataset.postId = 'own-' + post.id;
    article.dataset.postKind = 'own';
    article.dataset.sourceId = post.id;
    const top = document.createElement('div');
    top.className = 'quote-card-top';
    const category = document.createElement('span');
    category.className = 'preview-post-category';
    category.textContent = post.isGolden ? 'Golden Daily Quote' : post.category;
    if (post.isGolden) article.classList.add('golden-quote');
    top.append(category, createSocialButton('favorites'));
    article.append(top);
    article.append(
        createQuoteBody(article, post, {
            drawingLabel: 'Your drawing',
            imageAlt: 'Your quote drawing',
        }),
    );
    const author = document.createElement('div');
    author.className = 'quote-author';
    author.textContent = post.author || document.body.dataset.userName;
    article.append(author);
    const actions = document.createElement('div');
    actions.className = 'preview-post-actions';
    actions.setAttribute('data-export-ignore', '');
    const download = createDownloadButton();
    actions.append(
        download,
        action('Remove', async () => {
            try {
                const data = collections(),
                    collection = data.find((c) => c.id === activeId);
                if (collection) {
                    collection.quoteIds = collection.quoteIds.filter((id) => id !== post.id);
                    save(data);
                    await flush();
                    render();
                }
            } catch {
                $('collections-status').textContent =
                    'Could not remove the quote. Please try again.';
            }
        }),
    );
    article.append(actions);
    return article;
}
function render() {
    try {
        const data = collections(),
            source = posts();
        $('collections-list').replaceChildren();
        $('collection-quotes').replaceChildren();
        $('collections-back').hidden = !activeId;
        $('collection-create').hidden = !!activeId;
        $('collections-empty').hidden = true;
        $('collection-add').hidden = true;
        if (!activeId) {
            $('collections-title').textContent = 'My collections';
            $('collections-count').textContent = nameCount(data.length, 'collection');
            $('collections-empty').hidden = data.length > 0;
            for (const collection of data) {
                const card = document.createElement('article');
                card.className = 'collection-tile';
                const link = document.createElement('a');
                link.href = '/collections/' + encodeURIComponent(collection.id);
                link.className = 'collection-tile-link';
                const visual = document.createElement('div');
                visual.className = 'collection-folder card-' + collection.background_color;
                visual.innerHTML =
                    '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7V4h6l2 3h10v13H3Z"/></svg>';
                const heading = document.createElement('h2');
                heading.textContent = collection.name;
                const count = document.createElement('span');
                count.textContent = nameCount(collection.quoteIds.length, 'quote');
                link.append(visual, heading, count);
                const actions = document.createElement('div');
                actions.className = 'collection-tile-actions';
                actions.append(
                    action('Rename', () => openName(collection)),
                    action('Delete', () => removeCollection(collection.id)),
                );
                card.append(link, actions);
                $('collections-list').append(card);
            }
        } else {
            const collection = data.find((c) => c.id === activeId);
            if (!collection) {
                $('collections-title').textContent = 'Collection not found';
                $('collections-count').textContent = '';
                $('collections-status').textContent = 'This collection may have been deleted.';
                return;
            }
            $('collections-title').textContent = collection.name;
            $('collections-count').textContent = nameCount(collection.quoteIds.length, 'quote');
            $('collection-add').hidden = false;
            for (const id of collection.quoteIds) {
                const post = source.find((p) => p.id === id);
                if (post) $('collection-quotes').append(renderQuote(post));
            }
        }
        updateSocialButtons();
    } catch {
        $('collections-status').textContent =
            'Your collections could not be loaded. Please refresh and try again.';
    }
}
function updateSelected() {
    $('collection-add-selected').textContent = `Add selected (${chosen.size})`;
    $('collection-add-selected').disabled = chosen.size === 0;
}
$('collection-add').onclick = () => {
    if (!requireMember()) return;
    try {
        const collection = collections().find((c) => c.id === activeId);
        if (!collection) {
            render();
            return;
        }
        const source = posts();
        chosen.clear();
        updateSelected();
        $('collection-picker-status').textContent = '';
        $('quote-picker-empty').hidden = source.length > 0;
        $('quote-picker-create').hidden = source.length > 0;
        const list = $('collection-quote-picker');
        list.replaceChildren();
        for (const post of source) {
            const row = document.createElement('label');
            row.className = 'quote-picker-item';
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.value = post.id;
            const added = collection.quoteIds.includes(post.id);
            check.checked = added;
            check.disabled = added;
            check.onchange = () => {
                if (check.checked) chosen.add(post.id);
                else chosen.delete(post.id);
                updateSelected();
            };
            row.append(check);
            if (post.cardImage) {
                const image = document.createElement('img');
                image.src = post.cardImage;
                image.alt = '';
                row.append(image);
            } else if (!post.text && post.drawing_data.length) {
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 500;
                paintDrawing(canvas, post.drawing_data);
                row.append(canvas);
            }
            const content = document.createElement('span');
            content.className = 'picker-quote-content';
            const text = document.createElement('span');
            text.textContent = post.text || 'Drawing quote';
            const meta = document.createElement('small');
            meta.textContent = added ? 'Already added' : post.category;
            content.append(text, meta);
            row.append(content);
            list.append(row);
        }
        $('collection-picker-dialog').showModal();
    } catch {
        $('collections-status').textContent = 'Your quotes could not be loaded. Please try again.';
    }
};
$('collection-add-selected').onclick = async () => {
    try {
        const data = collections(),
            collection = data.find((c) => c.id === activeId);
        if (!collection) throw Error('This collection no longer exists.');
        const ownIds = new Set(posts().map((p) => p.id));
        collection.quoteIds = [...new Set([...collection.quoteIds, ...chosen])].filter((id) =>
            ownIds.has(id),
        );
        save(data);
        await flush();
        $('collection-picker-dialog').close();
        render();
    } catch (error) {
        $('collection-picker-status').textContent =
            error.message || 'Could not add quotes. Please try again.';
    }
};
document
    .querySelectorAll('[data-close-dialog]')
    .forEach((button) => (button.onclick = () => button.closest('dialog').close()));
document.querySelectorAll('.collection-dialog').forEach((dialog) =>
    dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const box = dialog.getBoundingClientRect();
        if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
        )
            dialog.close();
    }),
);
window.addEventListener('storage', (event) => {
    if (event.key === collectionKey || event.key === postKey || event.key === null) render();
});
window.addEventListener('quotiq:posts-change', render);
window.addEventListener('pageshow', render);
render();

// A synchronous view cache backed by authenticated Laravel mutations, never browser persistence.
export let state = JSON.parse(document.getElementById('quotiq-state')?.textContent || '{}');
const names = {
    'quotiq.preview.posts.v1': 'posts',
    'quotiq.preview.favorites.v1': 'favorites',
    'quotiq.preview.reposts.v1': 'reposts',
    'quotiq.preview.collections.v1': 'collections',
};
let queue = Promise.resolve(),
    failure = null,
    pending = 0;
export async function api(url, data, method = 'POST') {
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    let result;
    try {
        result = await response.json();
    } catch {
        throw new Error(
            'The server did not confirm the save. Your draft is still here; please try again.',
        );
    }
    if (!response.ok) {
        const error = new Error(
            Object.values(result.errors || {}).flat()[0] ||
                result.message ||
                'Could not save. Please try again.',
        );
        error.status = response.status;
        throw error;
    }
    if (
        !result ||
        typeof result !== 'object' ||
        (data !== undefined && url !== '/api/golden-quotes' && result.saved !== true)
    )
        throw new Error('The server did not confirm the save. Please try again.');
    return result;
}
function notice(error) {
    let node = document.getElementById('save-error');
    if (!node) {
        node = document.createElement('p');
        node.id = 'save-error';
        node.className = 'download-notice';
        node.setAttribute('role', 'alert');
        document.body.append(node);
    }
    node.textContent = error.message;
}
function changed(key) {
    window.dispatchEvent(new StorageEvent('storage', { key }));
    window.dispatchEvent(new Event('quotiq:posts-change'));
}
const sourceId = (row) => row.sourceId || row.id.replace(/^(?:own-|quote-)/, '');
function quoteOperations(upserts, deletes, prior) {
    const operations = [];
    for (const id of deletes)
        operations.push({ url: '/quote/' + encodeURIComponent(id), method: 'DELETE', data: {} });
    for (const post of upserts) {
        const exists = prior.has(post.id);
        operations.push({
            url: exists ? '/quote/' + encodeURIComponent(post.id) : '/',
            method: exists ? 'PUT' : 'POST',
            data: {
                id: post.id,
                content: post.text,
                drawing_data: post.drawing_data,
                design: post.design ?? null,
                cardImage: post.cardImage ?? null,
            },
        });
    }
    return operations;
}

function collectionOperations(upserts, deletes, prior) {
    const operations = [];
    for (const id of deletes)
        operations.push({
            url: '/api/collections/' + encodeURIComponent(id),
            method: 'DELETE',
            data: {},
        });
    for (const collection of upserts) {
        const exists = prior.has(collection.id);
        operations.push({
            url: exists
                ? '/api/collections/' + encodeURIComponent(collection.id)
                : '/api/collections',
            method: exists ? 'PUT' : 'POST',
            data: collection,
        });
    }
    return operations;
}

function socialOperations(name, before, next) {
    const operations = [];
    const oldIds = new Set(before.map(sourceId)),
        newIds = new Set(next.map(sourceId));
    for (const id of oldIds)
        if (!newIds.has(id))
            operations.push({
                url: '/api/' + name + '/' + encodeURIComponent(id),
                method: 'DELETE',
                data: {},
            });
    for (const id of newIds)
        if (!oldIds.has(id))
            operations.push({
                url: '/api/' + name + '/' + encodeURIComponent(id),
                method: 'POST',
                data: {},
            });
    return operations;
}

export const store = {
    getItem(key) {
        return JSON.stringify(state[names[key]] || []);
    },
    setItem(key, value) {
        if (document.body.dataset.authenticated !== 'true')
            throw Error('Log in to save your changes.');
        const name = names[key];
        if (!name) throw Error('Unknown saved data.');
        const next = JSON.parse(value),
            before = structuredClone(state[name] || []);
        if (!Array.isArray(next)) throw Error('Invalid data.');
        const prior = new Map(before.map((p) => [p.id, p])),
            after = new Map(next.map((p) => [p.id, p]));
        const upserts = next.filter((p) => JSON.stringify(p) !== JSON.stringify(prior.get(p.id))),
            deletes = before.filter((p) => !after.has(p.id)).map((p) => p.id);
        if (!upserts.length && !deletes.length) return;
        let operations;
        if (name === 'posts') {
            operations = quoteOperations(upserts, deletes, prior);
        } else if (name === 'collections') {
            operations = collectionOperations(upserts, deletes, prior);
        } else {
            operations = socialOperations(name, before, next);
        }
        state[name] = next;
        pending++;
        queue = queue
            .then(async () => {
                if (failure) throw failure;
                for (const operation of operations)
                    await api(operation.url, operation.data, operation.method);
            })
            .catch(async (error) => {
                failure = error;
                try {
                    state = await api('/api/state', undefined, 'GET');
                } catch {}
                notice(error);
                changed(key);
            })
            .finally(() => pending--);
    },
};
export async function flush() {
    await queue;
    if (failure) {
        const error = failure;
        failure = null;
        throw error;
    }
}
export async function refresh() {
    if (pending) return;
    state = await api('/api/state', undefined, 'GET');
    for (const key of Object.keys(names)) changed(key);
}
// Wait for an in-flight save before moving to another server-rendered page.
document.addEventListener('click', async (event) => {
    const link = event.target.closest('a[href]');
    if (
        !pending ||
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        link.target ||
        link.hasAttribute('download') ||
        link.origin !== location.origin
    )
        return;
    if (link.pathname === location.pathname && link.hash) return;
    event.preventDefault();
    try {
        await flush();
        location.assign(link.href);
    } catch {}
});
window.addEventListener('pageshow', (event) => {
    if (event.persisted) refresh().catch(notice);
});

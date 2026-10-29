import { templateAssets, solidTemplates } from './card-templates.js';
import { store, flush } from './data-store.js';
import { createDesignedPreview } from './designed-post.js';
import { paintDrawing as paint } from './drawing-renderer.js';
const $ = (id) => document.getElementById(id);
const storageKey = 'quotiq.preview.posts.v1';
let posts = [];
try {
    const saved = JSON.parse(store.getItem(storageKey) || '[]');
    if (Array.isArray(saved))
        posts = saved.filter(
            (p) =>
                typeof p.id === 'string' &&
                typeof p.text === 'string' &&
                Array.isArray(p.drawing_data),
        );
} catch {
    $('publish-status').textContent =
        'Saved quotes could not be loaded. You can still create a new one.';
}
let drawing_data = [],
    redo = [],
    activeStroke = null,
    tool = 'pen',
    editingId = null,
    studioDrawing = [],
    alignment = 'center';
const drawing = $('drawing-canvas'),
    ctx = drawing.getContext('2d'),
    card = $('card-canvas'),
    cardCtx = card.getContext('2d');
async function showPanel(name) {
    if (['posts', 'favorites', 'reposts'].includes(name)) {
        await flush();
        window.location.assign(name === 'posts' ? '/my-quotes' : '/' + name);
        return;
    }
    if (!['draw', 'studio'].includes(name)) name = 'draw';
    if (name === 'studio' && !$('studio-text').value.trim() && !studioDrawing.length) {
        name = 'draw';
    }
    document.querySelectorAll('[data-panel]').forEach((button) => {
        const selected = button.dataset.panel === name;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
    });
    for (const panel of ['draw', 'studio']) $('panel-' + panel).hidden = panel !== name;
    history.replaceState(null, '', '#' + name);
    if (name === 'studio') renderCard();
}
document
    .querySelectorAll('[data-panel]')
    .forEach((b) =>
        b.addEventListener('click', () =>
            b.dataset.panel === 'studio' ? openStudioStep() : showPanel(b.dataset.panel),
        ),
    );
document
    .querySelectorAll('[data-open-panel]')
    .forEach((b) => b.addEventListener('click', () => showPanel(b.dataset.openPanel)));
document.querySelector('.workspace-tabs').addEventListener('keydown', (event) => {
    const tabs = [...document.querySelectorAll('[data-panel]')];
    const index = tabs.indexOf(document.activeElement);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next =
        event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    if (tabs[next].dataset.panel === 'studio') openStudioStep();
    else showPanel(tabs[next].dataset.panel);
    tabs[next].focus();
});
window.addEventListener('hashchange', () => showPanel(location.hash.slice(1)));
function redraw() {
    paint(drawing, drawing_data);
    $('draw-undo').disabled = drawing_data.length === 0;
    $('draw-redo').disabled = redo.length === 0;
}
function hasInk() {
    const pixels = ctx.getImageData(0, 0, 800, 500).data;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) return true;
    return false;
}
function point(event) {
    const rect = drawing.getBoundingClientRect();
    return {
        x: Math.max(0, Math.min(800, ((event.clientX - rect.left) * 800) / rect.width)),
        y: Math.max(0, Math.min(500, ((event.clientY - rect.top) * 500) / rect.height)),
    };
}
drawing.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || activeStroke) return;
    // touch-action handles touch scrolling; cancel only mouse selection.
    if (event.pointerType === 'mouse') event.preventDefault();
    drawing.setPointerCapture(event.pointerId);
    activeStroke = {
        tool,
        color: $('pen-color').value,
        size: Number($('pen-size').value),
        points: [point(event)],
        pointerId: event.pointerId,
    };
    drawing_data.push(activeStroke);
    redo = [];
    redraw();
});
drawing.addEventListener('pointermove', (event) => {
    if (!activeStroke || activeStroke.pointerId !== event.pointerId) return;
    activeStroke.points.push(point(event));
    redraw();
});
function endStroke(event) {
    if (activeStroke?.pointerId === event.pointerId) {
        activeStroke = null;
        if (drawing.hasPointerCapture(event.pointerId))
            drawing.releasePointerCapture(event.pointerId);
        redraw();
    }
}
drawing.addEventListener('pointerup', endStroke);
drawing.addEventListener('pointercancel', endStroke);
function setTool(value) {
    tool = value;
    $('tool-pen').classList.toggle('active', value === 'pen');
    $('tool-eraser').classList.toggle('active', value === 'eraser');
    $('tool-pen').setAttribute('aria-pressed', String(value === 'pen'));
    $('tool-eraser').setAttribute('aria-pressed', String(value === 'eraser'));
    drawing.classList.toggle('erasing', value === 'eraser');
}
$('tool-pen').onclick = () => setTool('pen');
$('tool-eraser').onclick = () => setTool('eraser');
$('pen-color').oninput = () => setTool('pen');
$('draw-undo').onclick = () => {
    if (drawing_data.length) {
        redo.push(drawing_data.pop());
        redraw();
    }
};
$('draw-redo').onclick = () => {
    if (redo.length) {
        drawing_data.push(redo.pop());
        redraw();
    }
};
$('draw-clear').onclick = () => {
    if (drawing_data.length) {
        drawing_data.push({
            tool: 'eraser',
            color: '#151515',
            size: 2000,
            points: [{ x: 400, y: 250 }],
        });
        redo = [];
        redraw();
    }
};
$('open-drawing').onclick = () => {
    $('drawing-editor').hidden = false;
    $('drawing-placeholder').hidden = true;
    $('open-drawing').querySelector('span').textContent = 'Edit drawing';
    drawing.focus();
};
$('draw-done').onclick = () => {
    $('publish-status').textContent = hasInk()
        ? 'Drawing attached. Add text or publish it on its own.'
        : 'Canvas is empty. Add text or draw something before publishing.';
    $('post-text').focus();
};
$('post-text').oninput = () => {
    $('post-characters').textContent = Array.from($('post-text').value).length;
    $('publish-status').textContent = '';
};
function savePosts(next) {
    try {
        store.setItem(storageKey, JSON.stringify(next));
        posts = next;
        return true;
    } catch {
        $('publish-status').textContent =
            'Could not save your quote. Your draft is still here; please try again.';
        return false;
    }
}
async function classifyQuote(text, hasDrawing) {
    const response = await fetch('/preview/classify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({ text: text || null, hasDrawing }),
    });
    const result = await response.json();
    if (!response.ok) throw Error(result.message || 'Could not save. Try again.');
    return result.category;
}
$('publish-preview').onclick = async () => {
    const text = $('post-text').value.trim(),
        ink = hasInk(),
        count = Array.from(text).length;
    if (!text && !ink) {
        $('publish-status').textContent = 'Add text or a drawing before publishing.';
        return;
    }
    if (text && (count < 3 || count > 155)) {
        $('publish-status').textContent = 'Quote text must contain 3–155 characters.';
        return;
    }
    const button = $('publish-preview');
    button.disabled = true;
    $('publish-status').textContent = 'Saving your quote…';
    try {
        const category = await classifyQuote(text, ink);
        const previous = posts.find((p) => p.id === editingId);
        const post = {
            ...(previous || {}),
            id: editingId || crypto.randomUUID(),
            text,
            drawing_data: ink ? structuredClone(drawing_data) : [],
            category,
            date: previous?.date || new Date().toISOString(),
        };
        const next = editingId
            ? posts.map((p) => (p.id === editingId ? post : p))
            : [post, ...posts];
        if (!savePosts(next)) return;
        await flush();
        editingId = null;
        drawing_data = [];
        redo = [];
        redraw();
        $('post-text').value = '';
        $('post-text').oninput();
        $('drawing-editor').hidden = true;
        $('drawing-placeholder').hidden = false;
        $('open-drawing').querySelector('span').textContent = 'Add a drawing';
        button.textContent = 'Publish quote →';
        showPanel('posts');
    } catch (error) {
        posts = JSON.parse(store.getItem(storageKey) || '[]');
        $('publish-status').textContent =
            error.message || 'Could not save. Your draft is still here.';
    } finally {
        button.disabled = false;
    }
};
const layerDefaults = {
    textX: 50,
    textY: 35,
    drawingX: 50,
    drawingY: 72,
    drawingScale: 65,
};
const layerInputs = {
    textX: 'text-x',
    textY: 'text-y',
    drawingX: 'drawing-x',
    drawingY: 'drawing-y',
    drawingScale: 'drawing-scale',
};
function applyLayout(layout = layerDefaults) {
    for (const [key, id] of Object.entries(layerInputs)) {
        $(id).value = layout[key] ?? layerDefaults[key];
    }
}
function currentLayout() {
    return Object.fromEntries(
        Object.entries(layerInputs).map(([key, id]) => [key, Number($(id).value)]),
    );
}
function applyDesign(design) {
    if (!design) return;
    selectedTemplate = design.template;
    $('studio-color').value = design.color;
    $('studio-font').value = design.font;
    $('studio-size').value = design.size;
    $('studio-position').value = design.position;
    alignment = design.alignment;
    applyLayout(design.layout || {
        ...layerDefaults,
        textY: design.position === 'top' ? 20 : design.position === 'bottom' ? 80 : 50,
    });
    document
        .querySelectorAll('[data-template]')
        .forEach((b) =>
            b.setAttribute('aria-pressed', String(b.dataset.template === selectedTemplate)),
        );
}
function usePost(post) {
    $('studio-source').value = post.id;
    $('studio-text').value = post.text;
    studioDrawing = structuredClone(post.drawing_data);
    $('studio-include-drawing').checked = true;
    applyDesign(post.design);
    showPanel('studio');
}
function linesFor(text, fontSize, maxWidth) {
    cardCtx.font = `${fontSize}px "${$('studio-font').value}"`;
    const lines = [];
    for (const paragraph of text.split('\n')) {
        let line = '';
        for (const word of paragraph.split(/\s+/u)) {
            if (!word) continue;
            const next = line ? line + ' ' + word : word;
            if (cardCtx.measureText(next).width <= maxWidth) {
                line = next;
                continue;
            }
            if (line) {
                lines.push(line);
                line = '';
            }
            if (cardCtx.measureText(word).width > maxWidth) {
                for (const character of Array.from(word)) {
                    if (cardCtx.measureText(line + character).width > maxWidth && line) {
                        lines.push(line);
                        line = '';
                    }
                    line += character;
                }
            } else line = word;
        }
        lines.push(line);
    }
    return lines;
}
const templateReady = (key) => Object.hasOwn(solidTemplates, key) || templateImages.has(key);
const templateTextColor = (key) =>
    key === 'plain-black' ? '#f5f2ed' : Object.hasOwn(solidTemplates, key) ? '#151515' : '#493b31';
const templateImages = new Map();
let selectedTemplate = 'botanical';
function decorate(c, key) {
    c.fillStyle = solidTemplates[key] || '#F5F2ED';
    c.fillRect(0, 0, 1000, 1200);
    const image = templateImages.get(key);
    if (image) c.drawImage(image, 0, 0, 1000, 1200);
}
function renderTemplateThumbnail(button) {
    const canvas = button.querySelector('canvas'),
        c = canvas.getContext('2d');
    c.setTransform(0.14, 0, 0, 0.14, 0, 0);
    decorate(c, button.dataset.template);
    c.fillStyle = templateTextColor(button.dataset.template);
    c.textAlign = 'center';
    c.textBaseline = 'top';
    c.font = '54px Georgia';
    c.fillText('Your quote', 500, 510);
    c.fillText('here.', 500, 575);
    c.font = '24px Georgia';
    c.fillText('— Your name', 500, 695);
}
function currentDesignedPost() {
    return {
        text: $('studio-text').value.trim(),
        drawing_data: studioDrawing,
        author: $('studio-author').value || 'Your name',
        design: {
            template: selectedTemplate,
            color: $('studio-color').value,
            font: $('studio-font').value,
            size: $('studio-size').value,
            position: $('studio-position').value,
            alignment,
            layout: currentLayout(),
        },
    };
}
function refreshCardPreview() {
    let host = $('studio-card-preview');
    if (!host) {
        host = document.createElement('div');
        host.id = 'studio-card-preview';
        host.className = 'compact-card-preview';
        card.after(host);
        card.hidden = true;
    }
    host.replaceChildren(createDesignedPreview(currentDesignedPost()));
}
function renderCard() {
    const c = cardCtx,
        color = $('studio-color').value,
        text = $('studio-text').value.trim(),
        include = studioDrawing.length;
    const author = $('studio-author').value.trim();
    c.clearRect(0, 0, 1000, 1200);
    decorate(c, selectedTemplate);
    c.fillStyle = color;
    c.textBaseline = 'top';
    c.textAlign = 'left';
    const maxHeight = include ? 280 : 580;
    let size = Number($('studio-size').value),
        lines = linesFor(text, size, 620);
    while (lines.length * size * 1.25 > maxHeight && size > 16) {
        size--;
        lines = linesFor(text, size, 620);
    }
    c.font = `${size}px "${$('studio-font').value}"`;
    c.textAlign = alignment;
    const x = alignment === 'center' ? 500 : alignment === 'right' ? 810 : 190;
    const blockHeight = lines.length * size * 1.25;
    const top = include ? 255 : 300;
    const room = maxHeight - blockHeight;
    const position = $('studio-position').value;
    const y = top + (position === 'top' ? 0 : position === 'bottom' ? room : room / 2);
    lines.forEach((line, i) => c.fillText(line, x, y + i * size * 1.25));
    if (include) {
        const layer = document.createElement('canvas');
        layer.width = 800;
        layer.height = 500;
        paint(layer, studioDrawing);
        if (text) c.drawImage(layer, 140, 610, 720, 450);
        else c.drawImage(layer, 140, 350, 720, 450);
    }
    c.fillStyle = color;
    c.globalAlpha = 0.8;
    c.font = '25px Arial';
    c.textAlign = 'center';
    if (author)
        c.fillText('— ' + author, 500, include ? 1090 : Math.min(1000, y + blockHeight + 50), 620);
    c.globalAlpha = 1;
    refreshCardPreview();
    $('text-layout-controls').hidden = !text;
    $('drawing-layout-controls').hidden = !include;
    $('size-output').textContent = $('studio-size').value;
    $('studio-download').disabled = !templateReady(selectedTemplate);
    $('publish-card').disabled = !templateReady(selectedTemplate);
    $('studio-status').textContent = templateReady(selectedTemplate) ? '' : 'Loading template…';
}
function resetStudio() {
    applyLayout();
    selectedTemplate = 'botanical';
    $('studio-color').value = '#493b31';
    $('studio-font').value = 'Georgia';
    $('studio-size').value = '64';
    $('studio-position').value = 'middle';
    alignment = 'center';
    document
        .querySelectorAll('[data-template]')
        .forEach((b) =>
            b.setAttribute('aria-pressed', String(b.dataset.template === selectedTemplate)),
        );
    renderCard();
}
for (const id of [
    'studio-color',
    'studio-font',
    'studio-size',
    'studio-position',
    ...Object.values(layerInputs),
])
    $(id).addEventListener('input', renderCard);
document.querySelectorAll('[data-template]').forEach((button) => {
    renderTemplateThumbnail(button);
    button.onclick = () => {
        selectedTemplate = button.dataset.template;
        $('studio-color').value = templateTextColor(selectedTemplate);
        document
            .querySelectorAll('[data-template]')
            .forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        renderCard();
    };
});
Promise.allSettled(
    Object.entries(templateAssets).map(
        ([key, url]) =>
            new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => {
                    templateImages.set(key, image);
                    const button = document.querySelector('[data-template="' + key + '"]');
                    renderTemplateThumbnail(button);
                    if (selectedTemplate === key) renderCard();
                    resolve();
                };
                image.onerror = () => {
                    if (selectedTemplate === key) {
                        $('studio-status').textContent =
                            'The template could not load. Refresh the page to try again.';
                        $('studio-download').disabled = true;
                    }
                    reject(new Error('Template failed: ' + key));
                };
                image.src = url;
            }),
    ),
);
$('studio-reset').onclick = resetStudio;
$('studio-download').onclick = async () => {
    if (!$('studio-text').value.trim() && !studioDrawing.length) return;
    renderCard();
    const { downloadPost } = await import('./post-download.js');
    await downloadPost($('studio-card-preview').firstElementChild, $('studio-download'));
};
redraw();
const selectedQuote = new URLSearchParams(location.search).get('quote');
if (selectedQuote && Array.from(selectedQuote).length <= 155) {
    $('studio-text').value = selectedQuote;
    const author = new URLSearchParams(location.search).get('author');
    if (author) $('studio-author').value = author.slice(0, 50);
}
const requestedPost = new URLSearchParams(location.search).get('post');
const requestedEdit = new URLSearchParams(location.search).get('edit');
const existing = posts.find((p) => p.id === (requestedPost || requestedEdit));
applyDesign(existing?.design);
if (existing?.isGolden) {
    $('continue-to-studio').hidden = true;
    $('tab-studio').hidden = true;
    $('open-drawing').hidden = true;
}
if (existing && requestedEdit) {
    editingId = existing.id;
    $('post-text').value = existing.text;
    $('post-text').oninput();
    drawing_data = structuredClone(existing.drawing_data);
    redraw();
    $('drawing-editor').hidden = !drawing_data.length;
    $('drawing-placeholder').hidden = !!drawing_data.length;
    $('publish-preview').textContent = 'Save changes →';
    showPanel('draw');
} else if (existing && requestedPost) {
    usePost(existing);
} else {
    renderCard();
    showPanel(location.hash.slice(1));
}

function continueToStudio() {
    const text = $('post-text').value.trim(),
        ink = hasInk(),
        count = Array.from(text).length;
    if (!text && !ink) {
        $('publish-status').textContent = 'Write a quote or add a drawing first.';
        $('post-text').focus();
        return;
    }
    if (text && (count < 3 || count > 155)) {
        $('publish-status').textContent = 'Quote text must contain 3–155 characters.';
        return;
    }
    $('studio-source').value = editingId || 'draft';
    $('studio-text').value = text;
    $('studio-author').value = document.body.dataset.userName || 'Your name';
    studioDrawing = ink ? structuredClone(drawing_data) : [];
    showPanel('studio');
}
function openStudioStep() {
    if (!$('panel-draw').hidden || (!$('studio-text').value.trim() && !studioDrawing.length))
        continueToStudio();
    else showPanel('studio');
}
$('continue-to-studio').onclick = continueToStudio;
$('publish-card').onclick = async () => {
    const button = $('publish-card'),
        text = $('studio-text').value.trim();
    if (!text && !studioDrawing.length) {
        showPanel('draw');
        return;
    }
    renderCard();
    button.disabled = true;
    $('studio-status').textContent = 'Saving your card…';
    try {
        const category = await classifyQuote(text, studioDrawing.length > 0);
        const old = posts.find((p) => p.id === $('studio-source').value);
        const { capturePost } = await import('./post-download.js');
        const thumbnail = await capturePost($('studio-card-preview').firstElementChild);
        const post = {
            id: old?.id || crypto.randomUUID(),
            text,
            drawing_data: structuredClone(studioDrawing),
            category,
            date: old?.date || new Date().toISOString(),
            cardImage: thumbnail.toDataURL('image/jpeg', 0.88),
            design: {
                template: selectedTemplate,
                color: $('studio-color').value,
                font: $('studio-font').value,
                size: $('studio-size').value,
                position: $('studio-position').value,
                alignment,
                layout: currentLayout(),
            },
        };
        const next = old ? posts.map((p) => (p.id === old.id ? post : p)) : [post, ...posts];
        if (!savePosts(next)) {
            $('studio-status').textContent = $('publish-status').textContent;
            return;
        }
        await flush();
        $('studio-source').value = post.id;
        editingId = null;
        drawing_data = [];
        redo = [];
        redraw();
        $('post-text').value = '';
        $('post-text').oninput();
        showPanel('posts');
    } catch (error) {
        posts = JSON.parse(store.getItem(storageKey) || '[]');
        $('studio-status').textContent =
            error.message || 'Could not publish. Your design is still here.';
    } finally {
        button.disabled = false;
    }
};

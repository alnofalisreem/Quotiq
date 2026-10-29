import { paintDrawing } from './drawing-renderer.js';
import { showDesignedPost } from './designed-post.js';

// Shared content keeps cards consistent across Explore, My Quotes and saved lists.
export function createQuoteBody(
    article,
    post,
    {
        textClass = 'preview-post-text',
        drawingLabel = 'Quote drawing',
        imageAlt = 'Quote card',
        useDesign = Boolean(post.cardImage),
    } = {},
) {
    const body = document.createElement('div');
    const drawing = post.drawing_data || [];
    body.className = 'my-quote-body';

    if (useDesign) {
        body.dataset.layout = 'designed';
    } else if (post.text && drawing.length) {
        body.dataset.layout = 'mixed';
    } else {
        body.dataset.layout = drawing.length ? 'drawing' : 'text';
    }

    if (useDesign && post.design) {
        showDesignedPost(article, body, post);
        return body;
    }

    if (post.cardImage) {
        const image = document.createElement('img');
        image.src = post.cardImage;
        image.alt = post.text || imageAlt;
        image.className = 'published-card-image';
        body.append(image);
        return body;
    }

    if (post.text) {
        const text = document.createElement('p');
        text.className = textClass;
        text.textContent = post.text;
        body.append(text);
    }

    if (drawing.length) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 500;
        canvas.setAttribute('aria-label', drawingLabel);
        paintDrawing(canvas, drawing);
        body.append(canvas);
    }

    return body;
}

export function createDownloadButton(label = 'Download image') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-button';
    button.setAttribute('data-download-post', '');
    button.setAttribute('data-export-ignore', '');
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML =
        '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg>';
    return button;
}

import { templateAssets, solidTemplates } from './card-templates.js';
import { paintDrawing } from './drawing-renderer.js';
export function showDesignedPost(article, body, post) {
    const design = post.design;
    if (!design) return;
    article.classList.add('designed-quote');
    article.style.backgroundColor = solidTemplates[design.template] || '#F5F2ED';
    if (templateAssets[design.template])
        article.style.backgroundImage = `url('${templateAssets[design.template]}')`;
    article.style.color = design.color || '#151515';
    body.replaceChildren();
    if (post.cardImage) {
        const original = document.createElement('img');
        original.src = post.cardImage;
        original.alt = '';
        original.className = 'published-card-image original-card-export';
        original.hidden = true;
        body.append(original);
    }
    body.style.textAlign = design.alignment || 'center';
    body.style.justifyContent =
        design.position === 'top'
            ? 'flex-start'
            : design.position === 'bottom'
              ? 'flex-end'
              : 'center';
    if (post.text) {
        const text = document.createElement('p');
        text.className = 'preview-post-text';
        text.textContent = post.text;
        text.style.fontFamily = design.font || 'Georgia';
        text.style.fontSize = Math.max(18, Math.min(28, Number(design.size || 64) / 3)) + 'px';
        text.dataset.preferredSize = parseFloat(text.style.fontSize);
        body.append(text);
    }
    if (post.drawing_data?.length) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 500;
        paintDrawing(canvas, post.drawing_data);
        body.append(canvas);
    }
    // New cards position their text and drawing independently. Older cards keep their layout.
    if (design.layout) {
        const layout = design.layout;
        body.style.position = 'relative';
        body.style.overflow = 'hidden';
        const text = body.querySelector('p');
        const drawing = body.querySelector('canvas');
        if (text) {
            Object.assign(text.style, {
                position: 'absolute',
                left: `clamp(40%, ${layout.textX}%, 60%)`,
                top: `clamp(22.5%, ${layout.textY}%, 77.5%)`,
                transform: 'translate(-50%, -50%)',
                width: '80%',
                maxHeight: 'none',
                margin: '0',
                overflow: 'visible',
            });
        }
        if (drawing) {
            const size = Number(layout.drawingScale);
            const height = size * 0.65;
            Object.assign(drawing.style, {
                position: 'absolute',
                left: `clamp(${size / 2}%, ${layout.drawingX}%, ${100 - size / 2}%)`,
                top: `clamp(${height / 2}%, ${layout.drawingY}%, ${100 - height / 2}%)`,
                transform: 'translate(-50%, -50%)',
                width: `${size}%`,
                height: `${height}%`,
                maxWidth: 'none',
                maxHeight: 'none',
                objectFit: 'contain',
                margin: '0',
            });
        }
    }
    const fit = () => {
        const text = body.querySelector('p');
        if (!text || !body.clientHeight) return;
        let size = Number(text.dataset.preferredSize);
        text.style.fontSize = size + 'px';
        while (
            (design.layout
                ? text.scrollHeight > body.clientHeight * 0.45
                : body.scrollHeight > body.clientHeight + 1) && size > 11
        ) {
            size -= 0.5;
            text.style.fontSize = size + 'px';
        }
    };
    const observer = new ResizeObserver(() => {
        if (!article.isConnected) {
            observer.disconnect();
            return;
        }
        fit();
    });
    observer.observe(body);
    requestAnimationFrame(fit);
}

export function createDesignedPreview(post) {
    const article = document.createElement('article');
    article.className = 'preview-post';
    article.style.height = '226px';
    article.style.minHeight = '226px';
    const category = document.createElement('span');
    category.className = 'preview-post-category';
    category.textContent = post.category || 'Quote';
    article.append(category);
    const body = document.createElement('div');
    body.className = 'my-quote-body';
    body.dataset.layout = 'designed';
    article.append(body);
    const author = document.createElement('div');
    author.className = 'quote-author';
    author.textContent = post.author || 'Your name';
    article.append(author);
    showDesignedPost(article, body, post);
    return article;
}

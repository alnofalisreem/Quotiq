import html2canvas from 'html2canvas';

export function canDownloadPosts() {
    return document.body.dataset.authenticated === 'true';
}

function requestAccount() {
    const dialog = document.getElementById('auth-dialog');
    if (!dialog) {
        window.location.assign('/login');
        return;
    }
    document.getElementById('auth-dialog-message').textContent =
        'Log in to download this post as an image.';
    const link = dialog.querySelector('.preview-dialog-link');
    if (link) link.href = '/preview#draw';
    dialog.showModal();
}

function announce(message) {
    let status = document.getElementById('post-download-status');
    if (!status) {
        status = document.createElement('p');
        status.id = 'post-download-status';
        status.className = 'download-notice';
        status.setAttribute('role', 'status');
        document.body.append(status);
    }
    status.textContent = message;
    clearTimeout(status.hideTimer);
    status.hideTimer = setTimeout(() => status.remove(), 5000);
}

export async function capturePost(post) {
    await document.fonts.ready;
    await Promise.all([...post.querySelectorAll('img')].map((img) => img.decode()));
    const captured = await html2canvas(post, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        ignoreElements: (element) => element.hasAttribute('data-export-ignore'),
        onclone: (_document, element) => {
            element.style.transform = 'none';
            element.style.width = '224px';
            element.style.height = '226px';
            element.style.minHeight = '226px';
            element.style.boxSizing = 'border-box';
            const body = element.querySelector('.my-quote-body');
            const text = body?.querySelector('p');
            if (text) {
                let size = parseFloat(_document.defaultView.getComputedStyle(text).fontSize);
                while (
                    (text.style.position === 'absolute'
                        ? text.scrollHeight > body.clientHeight * 0.45
                        : body.scrollHeight > body.clientHeight + 1) && size > 11
                ) {
                    size -= 0.5;
                    text.style.fontSize = size + 'px';
                }
            }
            element
                .querySelectorAll('.quote-card-top [data-social], .quote-card-bottom button')
                .forEach((button) => button.remove());
            for (let parent = element.parentElement; parent; parent = parent.parentElement)
                parent.style.overflow = 'visible';
        },
    });
    const canvas = document.createElement('canvas');
    canvas.width = 448;
    canvas.height = 452;
    canvas.getContext('2d').drawImage(captured, 0, 0);
    return canvas;
}

export async function downloadPost(post, button) {
    if (!canDownloadPosts()) {
        requestAccount();
        return;
    }
    if (!post || button.disabled) return;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    try {
        const canvas = await capturePost(post);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('Image generation failed');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'quotiq-post.png';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        announce('Your post image is ready.');
    } catch (error) {
        console.error('Post download failed:', error);
        announce('The image could not be downloaded. Please try again.');
    } finally {
        button.disabled = false;
        button.removeAttribute('aria-busy');
    }
}

document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-download-post]');
    if (!button) return;
    event.preventDefault();
    downloadPost(button.closest('.quote-card, .daily-quote, .preview-post'), button);
});

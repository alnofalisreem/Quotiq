import { createQuoteBody, createDownloadButton } from './quote-card.js';
import { state, refresh } from './data-store.js';
import { createSocialButton, updateSocialButtons } from './quote-social.js';
const grid = document.getElementById('quote-grid');
function render() {
    if (!grid) return;
    grid.replaceChildren();
    for (const post of state.public || []) {
        if (post.expiresAt && post.expiresAt <= Date.now()) continue;
        const article = document.createElement('article');
        article.className = 'quote-card card-' + post.background_color;
        article.dataset.postId = (post.owned ? 'own-' : 'quote-') + post.id;
        article.dataset.sourceId = post.id;
        article.dataset.postKind = post.owned ? 'own' : 'community';
        article.dataset.text = (post.text + ' ' + post.author).toLowerCase();
        article.dataset.quoteCategory = post.category;
        if (post.expiresAt) article.dataset.expiresAt = post.expiresAt;
        const top = document.createElement('div');
        top.className = 'quote-card-top';
        const category = document.createElement('span');
        category.className = 'quote-category';
        category.textContent = post.isGolden ? 'Golden Daily Quote' : post.category;
        top.append(category, createSocialButton('favorites'));
        article.append(top);
        if (post.isGolden) article.classList.add('golden-quote');
        article.append(
            createQuoteBody(article, post, {
                textClass: 'quote-card-text',
                useDesign: Boolean(post.design),
            }),
        );
        const footer = document.createElement('div');
        footer.className = 'quote-card-bottom';
        const author = document.createElement('span');
        author.className = 'quote-author';
        author.textContent = post.author;
        const date = document.createElement('time');
        date.className = 'quote-date';
        date.dateTime = post.date;
        date.textContent = new Date(post.date).toLocaleDateString();
        footer.append(author, date);
        footer.append(createDownloadButton('Download post image'));
        if (!post.owned) footer.append(createSocialButton('reposts'));
        article.append(footer);
        grid.append(article);
    }
    updateSocialButtons();
    window.dispatchEvent(new Event('quotiq:public-rendered'));
}
window.addEventListener('quotiq:posts-change', render);
render();
// Refresh shared posts across accounts and expire golden cards while the page stays open.
if (grid)
    setInterval(() => {
        if (!document.hidden) refresh().catch(() => {});
    }, 30000);

if (grid)
    setInterval(() => {
        if (
            [...grid.querySelectorAll('[data-expires-at]')].some(
                (card) => Number(card.dataset.expiresAt) <= Date.now(),
            )
        )
            render();
    }, 1000);

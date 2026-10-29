import { flush } from './data-store.js';
import './public-quotes.js';
import './quote-social.js';
import './daily-quote.js';
import './post-download.js';

const dialog = document.querySelector('#auth-dialog');
document.querySelectorAll('[data-auth]').forEach((button) =>
    button.addEventListener('click', () => {
        if (!dialog) {
            window.location.assign('/login');
            return;
        }
        document.querySelector('#auth-dialog-message').textContent =
            `${button.dataset.auth}. Log in to make it yours.`;
        const previewLink = dialog.querySelector('.preview-dialog-link');
        if (previewLink) {
            const parent = button.closest('.quote-card, .daily-quote');
            const text = parent
                ?.querySelector('.quote-card-text, blockquote')
                ?.textContent.replace(/^[“]|[”]$/g, '')
                .trim();
            const author = parent
                ?.querySelector('.quote-author, .daily-content > p')
                ?.textContent.replace(/^—\s*/, '')
                .trim();
            previewLink.href =
                '/preview' +
                (text
                    ? '?' +
                      new URLSearchParams({ quote: text, author: author || 'Your name' }).toString()
                    : '') +
                (text ? '#studio' : '#draw');
        }
        dialog.showModal();
    }),
);
dialog?.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) {
        const box = dialog.getBoundingClientRect();
        if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
        )
            dialog.close();
    }
});
const mobileToggle = document.querySelector('.mobile-menu-button');
const mobileNavigation = document.getElementById('mobile-nav');
function closeMobileNavigation(restoreFocus = false) {
    if (!mobileToggle || !mobileNavigation) return;
    mobileNavigation.hidden = true;
    mobileToggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) mobileToggle.focus();
}
mobileToggle?.addEventListener('click', () => {
    mobileNavigation.hidden = !mobileNavigation.hidden;
    mobileToggle.setAttribute('aria-expanded', String(!mobileNavigation.hidden));
});
mobileNavigation?.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) closeMobileNavigation();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNavigation && !mobileNavigation.hidden) {
        closeMobileNavigation(true);
    }
});
document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMobileNavigation();
});
window.addEventListener('resize', () => {
    if (window.innerWidth > 1100) closeMobileNavigation();
});
const grid = document.querySelector('#quote-grid');
let selectedCategory = 'All quotes';
const search = document.querySelector('#quote-search');
function filterQuotes() {
    if (!grid) return;
    const term = search.value.toLowerCase().trim();
    if (term && window.innerWidth <= 1100) {
        grid.classList.add('expanded');
        const viewAll = document.querySelector('#view-all');
        viewAll.querySelector('[data-view-all-label]').textContent = 'Show less';
        viewAll.setAttribute('aria-expanded', 'true');
    }
    let count = 0;
    grid.querySelectorAll('.quote-card').forEach((card) => {
        const visible =
            (selectedCategory === 'All quotes' ||
                card.dataset.quoteCategory === selectedCategory) &&
            `${card.dataset.text} ${card.dataset.quoteCategory.toLowerCase()}`.includes(term);
        card.hidden = !visible;
        if (visible) count++;
    });
    document.querySelector('#empty-results').hidden = count !== 0;
    document
        .querySelectorAll('.carousel-arrow')
        .forEach((button) => (button.hidden = count < 5 || grid.classList.contains('expanded')));
    document.querySelector('#results-count').textContent =
        term || selectedCategory !== 'All quotes'
            ? `${count} ${count === 1 ? 'quote' : 'quotes'} found`
            : '';
    grid.scrollLeft = 0;
}
search?.addEventListener('input', filterQuotes);
search?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (grid) {
            filterQuotes();
            search.blur();
            closeMobileNavigation();
            requestAnimationFrame(() =>
                document.querySelector('#explore').scrollIntoView({ behavior: 'smooth' }),
            );
        } else window.location.assign(`/?search=${encodeURIComponent(search.value)}#explore`);
    }
});
const initialSearch = new URLSearchParams(window.location.search).get('search');
if (initialSearch && search && grid) {
    search.value = initialSearch;
    filterQuotes();
    requestAnimationFrame(() =>
        document.querySelector('#explore').scrollIntoView({ behavior: 'smooth' }),
    );
}
document.querySelectorAll('[data-category]').forEach((button) =>
    button.addEventListener('click', () => {
        selectedCategory = button.dataset.category;
        document.querySelectorAll('[data-category]').forEach((chip) => {
            chip.classList.toggle('active', chip === button);
            chip.setAttribute('aria-pressed', String(chip === button));
        });
        filterQuotes();
    }),
);
function moveQuoteCarousel(direction) {
    if (!grid || grid.classList.contains('expanded')) return;
    const cards = [...grid.querySelectorAll('.quote-card:not([hidden])')];
    if (cards.length < 2) return;
    const start = cards[0].offsetLeft;
    const step = cards[1].offsetLeft - start;
    if (step <= 0) return;
    const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
    const pageSize = Math.max(1, Math.round((grid.clientWidth + gap) / step));
    const current = Math.round(grid.scrollLeft / step);
    const lastPage = Math.max(0, cards.length - pageSize);
    const next = Math.max(0, Math.min(lastPage, current + direction * pageSize));
    grid.scrollTo({ left: cards[next].offsetLeft - start, behavior: 'smooth' });
}

document.querySelector('.carousel-arrow.next')
    ?.addEventListener('click', () => moveQuoteCarousel(1));
document.querySelector('.carousel-arrow.previous')
    ?.addEventListener('click', () => moveQuoteCarousel(-1));

document.querySelector('#view-all')?.addEventListener('click', (event) => {
    const expanded = grid.classList.toggle('expanded');
    event.currentTarget.querySelector('[data-view-all-label]').textContent = expanded
        ? 'Show less'
        : 'View all';
    event.currentTarget.setAttribute('aria-expanded', String(expanded));
    document
        .querySelectorAll('.carousel-arrow')
        .forEach(
            (button) =>
                (button.hidden =
                    expanded || grid.querySelectorAll('.quote-card:not([hidden])').length < 5),
        );
});

document.querySelectorAll('.password-toggle').forEach((button) =>
    button.addEventListener('click', () => {
        const input = document.getElementById(button.getAttribute('aria-controls'));
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        button.setAttribute('aria-pressed', String(show));
    }),
);

const accountContainer = document.getElementById('user-account');
const accountToggle = document.getElementById('account-menu-toggle');
const accountDropdown = document.getElementById('account-dropdown');
const accountMember = document.body.dataset.authenticated === 'true';
if (accountContainer && accountMember) {
    accountContainer.hidden = false;
    document.querySelector('.account-links').hidden = true;
    document
        .querySelectorAll('#mobile-nav a[href$="/login"], #mobile-nav a[href$="/signup"]')
        .forEach((link) => (link.hidden = true));
    document.querySelectorAll('[data-auth="Create your own quote card"]').forEach((button) =>
        button.addEventListener(
            'click',
            (event) => {
                event.stopImmediatePropagation();
                window.location.assign('/preview#draw');
            },
            true,
        ),
    );
    function closeAccountMenu(restoreFocus = false) {
        accountDropdown.hidden = true;
        accountToggle.setAttribute('aria-expanded', 'false');
        if (restoreFocus) accountToggle.focus();
    }
    accountToggle.addEventListener('click', () => {
        const open = accountDropdown.hidden;
        accountDropdown.hidden = !open;
        accountToggle.setAttribute('aria-expanded', String(open));
    });
    accountToggle.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            accountDropdown.hidden = false;
            accountToggle.setAttribute('aria-expanded', 'true');
            accountDropdown.querySelector('a').focus();
        }
    });
    document.addEventListener('click', (event) => {
        if (!accountContainer.contains(event.target)) closeAccountMenu();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !accountDropdown.hidden) closeAccountMenu(true);
    });
    document.addEventListener('focusin', (event) => {
        if (!accountContainer.contains(event.target)) closeAccountMenu();
    });
    accountDropdown
        .querySelectorAll('a')
        .forEach((link) => link.addEventListener('click', () => closeAccountMenu()));
}

document.querySelectorAll('[data-member-link]').forEach((link) =>
    link.addEventListener('click', (event) => {
        const member = document.body.dataset.authenticated === 'true';
        if (member) return;
        event.preventDefault();
        const dialog = document.getElementById('auth-dialog');
        if (!dialog) {
            window.location.assign('/login');
            return;
        }
        document.getElementById('auth-dialog-message').textContent =
            'Log in to organize your quote collections.';
        const preview = dialog.querySelector('.preview-dialog-link');
        if (preview) preview.href = '/preview#draw';
        dialog.showModal();
    }),
);

window.addEventListener('quotiq:public-rendered', filterQuotes);
filterQuotes();
document.querySelectorAll('.logout-form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            await flush();
            form.submit();
        } catch {}
    });
});

import { api, state, refresh } from './data-store.js';
const composer = document.getElementById('daily-composer');
if (composer) {
    const form = document.getElementById('daily-form'),
        guest = document.getElementById('daily-guest'),
        input = document.getElementById('daily-text'),
        submit = document.getElementById('daily-publish'),
        status = document.getElementById('daily-status'),
        count = document.getElementById('daily-character-count');
    function render() {
        const member = document.body.dataset.authenticated === 'true';
        const blocked = member && state.goldenAvailableAt > Date.now();
        composer.hidden = blocked;
        form.hidden = !member || blocked;
        guest.hidden = member;
    }
    input.addEventListener('input', () => {
        count.textContent = Array.from(input.value).length;
        status.textContent = '';
    });
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (submit.disabled) return;
        submit.disabled = true;
        try {
            await api('/api/golden-quotes', { content: input.value.trim() });
            input.value = '';
            count.textContent = '0';
            await refresh();
            render();
            document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            status.textContent = error.message;
        } finally {
            submit.disabled = false;
        }
    });
    window.addEventListener('quotiq:posts-change', render);
    setInterval(render, 1000);
    render();
}

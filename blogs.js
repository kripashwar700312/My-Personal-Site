/* Blog list — rendered into #blog-list on blog.html */
(function () {
    'use strict';

    const list = document.getElementById('blog-list');
    if (!list) return;

    const posts = [
        {
            id: 'blog1',
            title: 'Designing service boundaries that survive contact with production',
            date: '2025-09-07',
            tags: ['Microservices', 'Java'],
            summary: 'Splitting a monolith is easy. Splitting it along boundaries that still make sense a year later is the hard part.',
            content: '<p>Coming soon.</p>'
        },
        {
            id: 'blog2',
            title: 'Spring Boot startup time: where the seconds actually go',
            date: '2025-09-06',
            tags: ['Spring Boot', 'Performance'],
            summary: 'A practical pass through classpath scanning, lazy initialisation and the trade-offs of each.',
            content: '<p>Coming soon.</p>'
        }
    ];

    const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    posts.forEach((post, i) => {
        const card = document.createElement('article');
        card.className = 'card blog-card spotlight';
        card.dataset.reveal = '';
        card.style.setProperty('--d', `${i * 90}ms`);
        card.innerHTML = `
            <div class="blog-meta">
                <time datetime="${post.date}">${fmt(post.date)}</time>
                <div class="chips">${post.tags.map((t) => `<span>${t}</span>`).join('')}</div>
            </div>
            <h3>${post.title}</h3>
            <p>${post.summary}</p>
            <button class="blog-more" type="button" aria-expanded="false">
                Read more <svg class="icon"><use href="#i-arrow-ur"/></svg>
            </button>
            <div class="blog-body">${post.content}</div>
        `;
        list.appendChild(card);
    });

    list.addEventListener('click', (e) => {
        const btn = e.target.closest('.blog-more');
        if (!btn) return;

        const body = btn.parentElement.querySelector('.blog-body');
        const open = btn.getAttribute('aria-expanded') === 'true';

        body.style.maxHeight = open ? '' : `${body.scrollHeight}px`;
        btn.setAttribute('aria-expanded', String(!open));
        btn.firstChild.textContent = open ? 'Read more ' : 'Read less ';
    });

    // Fade the cards in.
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.15 });
        list.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    } else {
        list.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in'));
    }

    // Mouse-follow spotlight, matching the main page.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        list.querySelectorAll('.spotlight').forEach((card) => {
            card.addEventListener('pointermove', (ev) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${ev.clientX - r.left}px`);
                card.style.setProperty('--my', `${ev.clientY - r.top}px`);
            });
        });
    }
})();

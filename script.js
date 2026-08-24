/* ═══════════════════════════════════════════════════════════
   Kripashwar Dhungana — Portfolio interactions
   ═══════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $  = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* ── Experience maths ─────────────────────────────────── */
    const START = new Date(2018, 11, 16); // 16 Dec 2018

    function diffFrom(startDate) {
        const now = new Date();
        let years  = now.getFullYear() - startDate.getFullYear();
        let months = now.getMonth() - startDate.getMonth();
        let days   = now.getDate() - startDate.getDate();

        if (days < 0) {
            months -= 1;
            days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years -= 1;
            months += 12;
        }
        return { years, months, days };
    }

    function renderExperienceCounter() {
        const el = $('#experience-counter');
        if (!el) return;
        const { years, months, days } = diffFrom(START);
        el.innerHTML =
            `${years}<u>yrs</u> ${months}<u>mos</u> ${days}<u>days</u>`;
    }

    /* Keep static [data-count] stats in sync with the live experience maths
       so the hero number never drifts from the running counter. */
    function syncDerivedCounts() {
        const { years } = diffFrom(START);
        $$('[data-count-source="experience-years"]').forEach((el) => {
            el.dataset.count = String(years);
        });
    }

    function renderAboutExperience() {
        const el = $('#dynamic-about-exp');
        if (!el) return;
        const { years, months } = diffFrom(START);
        const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six',
                       'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
        const yearWord = words[years] || String(years);
        const half = months >= 6 ? ' and a half' : '';
        el.textContent = `over ${yearWord}${half} years`;
    }

    /* ── Split hero headline into animatable words ─────────── */
    function splitLines() {
        $$('[data-split]').forEach((line, li) => {
            const html = line.innerHTML;
            // Preserve inline markup (e.g. <em class="grad">) by splitting on
            // top-level text nodes only.
            const wrap = document.createElement('span');
            wrap.innerHTML = html;

            const build = (node, out) => {
                node.childNodes.forEach((child) => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        child.textContent.split(/(\s+)/).forEach((chunk) => {
                            if (!chunk.trim()) { out.appendChild(document.createTextNode(chunk)); return; }
                            const w = document.createElement('span');
                            w.className = 'word';
                            w.textContent = chunk;
                            out.appendChild(w);
                        });
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        const clone = child.cloneNode(false);
                        clone.classList.add('word');
                        clone.textContent = child.textContent;
                        out.appendChild(clone);
                    }
                });
            };

            const frag = document.createDocumentFragment();
            build(wrap, frag);
            line.innerHTML = '';
            line.appendChild(frag);

            $$('.word', line).forEach((w, wi) => {
                w.style.setProperty('--d', `${li * 110 + wi * 55}ms`);
            });
        });
    }

    /* ── Reveal on scroll ─────────────────────────────────── */
    function initReveal() {
        const targets = [...$$('[data-reveal]'), ...$$('.line')];

        if (reduced || !('IntersectionObserver' in window)) {
            targets.forEach((el) => el.classList.add('in'));
            return;
        }

        $$('[data-reveal]').forEach((el) => {
            const d = el.dataset.delay;
            if (d) el.style.setProperty('--d', `${d}ms`);
        });

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('in');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        targets.forEach((el) => io.observe(el));
    }

    /* ── Animated number counters ─────────────────────────── */
    function initCounters() {
        const nums = $$('[data-count]');
        if (!nums.length) return;

        if (reduced || !('IntersectionObserver' in window)) {
            nums.forEach((el) => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                io.unobserve(el);

                const target = Number(el.dataset.count) || 0;
                const suffix = el.dataset.suffix || '';
                const duration = 1400;
                const t0 = performance.now();

                const tick = (now) => {
                    const p = Math.min((now - t0) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.6 });

        nums.forEach((el) => io.observe(el));
    }

    /* ── Scroll: progress bar, nav state, rail, back-to-top ── */
    function initScroll() {
        const bar    = $('#scrollBar');
        const rail   = $('#railFill');
        const toTop  = $('#toTop');
        const tl     = $('.timeline');
        let ticking  = false;

        const update = () => {
            const y = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;

            if (bar) bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

            document.body.classList.toggle('scrolled', y > 24);
            if (toTop) toTop.classList.toggle('show', y > 600);

            if (rail && tl) {
                const r = tl.getBoundingClientRect();
                const start = window.innerHeight * 0.75;
                const p = (start - r.top) / (r.height + start - window.innerHeight * 0.35);
                rail.style.height = `${Math.max(0, Math.min(1, p)) * 100}%`;
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, { passive: true });

        window.addEventListener('resize', update, { passive: true });
        update();

        if (toTop) {
            toTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
            });
        }
    }

    /* ── Nav: scroll-spy + sliding pill ───────────────────── */
    function initNav() {
        const links = $$('.nav-links a[data-nav]');
        const pill  = $('.nav-pill');
        if (!links.length) return;

        const movePill = (el) => {
            if (!pill || !el) return;
            pill.style.width = `${el.offsetWidth}px`;
            pill.style.transform = `translateX(${el.offsetLeft}px)`;
            pill.style.opacity = '1';
        };

        const activeLink = () => links.find((l) => l.classList.contains('active'));

        links.forEach((link) => {
            link.addEventListener('mouseenter', () => movePill(link));
        });

        const list = $('#navLinks');
        if (list) {
            list.addEventListener('mouseleave', () => {
                const a = activeLink();
                if (a) movePill(a);
                else if (pill) pill.style.opacity = '0';
            });
        }

        const sections = links
            .map((l) => $(l.getAttribute('href')))
            .filter(Boolean);

        if (!('IntersectionObserver' in window)) return;

        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
                const a = activeLink();
                if (a) movePill(a);
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach((s) => spy.observe(s));
    }

    /* ── Mobile menu ──────────────────────────────────────── */
    function initMobileMenu() {
        const menu   = $('#mobileMenu');
        const toggle = $('#navToggle');
        const close  = $('#navClose');
        if (!menu || !toggle) return;

        const open = () => {
            menu.hidden = false;
            requestAnimationFrame(() => menu.classList.add('open'));
            toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        };

        const shut = () => {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            setTimeout(() => { menu.hidden = true; }, reduced ? 0 : 350);
        };

        toggle.addEventListener('click', open);
        if (close) close.addEventListener('click', shut);
        $$('a', menu).forEach((a) => a.addEventListener('click', shut));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menu.hidden) shut();
        });
    }

    /* ── Spotlight cards (mouse-follow glow) ──────────────── */
    function initSpotlight() {
        if (!finePointer) return;
        $$('.spotlight').forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                card.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        });
    }

    /* ── 3D tilt ──────────────────────────────────────────── */
    function initTilt() {
        if (!finePointer || reduced) return;
        const MAX = 7;

        $$('[data-tilt]').forEach((el) => {
            let raf = null;

            const move = (e) => {
                if (raf) return;
                raf = requestAnimationFrame(() => {
                    const r = el.getBoundingClientRect();
                    const px = (e.clientX - r.left) / r.width - 0.5;
                    const py = (e.clientY - r.top) / r.height - 0.5;
                    el.style.transform =
                        `perspective(900px) rotateX(${-py * MAX}deg) rotateY(${px * MAX}deg) translateY(-4px)`;
                    raf = null;
                });
            };

            el.addEventListener('pointermove', move);
            el.addEventListener('pointerleave', () => {
                if (raf) { cancelAnimationFrame(raf); raf = null; }
                el.style.transform = '';
            });
        });
    }

    /* ── Magnetic buttons ─────────────────────────────────── */
    function initMagnetic() {
        if (!finePointer || reduced) return;
        const PULL = 0.28;

        $$('[data-magnetic]').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * PULL;
                const y = (e.clientY - r.top - r.height / 2) * PULL;
                el.style.transform = `translate(${x}px, ${y}px)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
    }

    /* ── Custom cursor ────────────────────────────────────── */
    function initCursor() {
        if (!finePointer || reduced) return;

        const dot  = $('.cursor-dot');
        const ring = $('.cursor-ring');
        if (!dot || !ring) return;

        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let rx = mx, ry = my;

        window.addEventListener('pointermove', (e) => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px)`;
            document.body.classList.add('cursor-ready');
        }, { passive: true });

        const loop = () => {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            ring.style.transform = `translate(${rx}px, ${ry}px)`;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);

        const hot = 'a, button, [data-tilt], .about-points li';
        document.addEventListener('pointerover', (e) => {
            if (e.target.closest(hot)) document.body.classList.add('cursor-hot');
        });
        document.addEventListener('pointerout', (e) => {
            if (e.target.closest(hot)) document.body.classList.remove('cursor-hot');
        });
        document.addEventListener('pointerleave', () => document.body.classList.remove('cursor-ready'));
    }

    /* ── Copy email + toast ───────────────────────────────── */
    function toast(message) {
        const el = $('#toast');
        if (!el) return;
        el.textContent = message;
        el.classList.add('show');
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.remove('show'), 2200);
    }

    function initCopy() {
        const btn = $('#copyMail');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            const mail = btn.dataset.mail;
            try {
                await navigator.clipboard.writeText(mail);
            } catch (err) {
                const ta = document.createElement('textarea');
                ta.value = mail;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); } catch (_) { /* no-op */ }
                document.body.removeChild(ta);
            }

            const label = $('span', btn);
            if (label) label.textContent = 'Copied';
            btn.classList.add('copied');
            toast('Email copied to clipboard');

            setTimeout(() => {
                if (label) label.textContent = 'Copy';
                btn.classList.remove('copied');
            }, 2200);
        });
    }

    /* ── Boot ─────────────────────────────────────────────── */
    function init() {
        const year = $('#year');
        if (year) year.textContent = new Date().getFullYear();

        renderExperienceCounter();
        renderAboutExperience();
        setInterval(renderExperienceCounter, 60 * 1000);

        splitLines();
        initReveal();
        syncDerivedCounts();
        initCounters();
        initScroll();
        initNav();
        initMobileMenu();
        initSpotlight();
        initTilt();
        initMagnetic();
        initCursor();
        initCopy();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

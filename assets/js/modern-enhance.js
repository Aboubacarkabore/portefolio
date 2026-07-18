(function () {
    "use strict";

    /* ==========================================================
       Scroll reveal (IntersectionObserver)
       ========================================================== */
    function initScrollReveal() {
        var items = document.querySelectorAll('[data-reveal]');
        if (!items.length) return;

        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var delay = entry.target.getAttribute('data-reveal-delay') || 0;
                    setTimeout(function () {
                        entry.target.classList.add('is-visible');
                    }, parseInt(delay, 10));
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        items.forEach(function (el) { observer.observe(el); });
    }

    /* ==========================================================
       Language proficiency bars (animate width on reveal)
       ========================================================== */
    function initLangBars() {
        var bars = document.querySelectorAll('.lang-bar span[data-width]');
        if (!bars.length || !('IntersectionObserver' in window)) {
            bars.forEach(function (el) { el.style.width = el.getAttribute('data-width') + '%'; });
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.width = entry.target.getAttribute('data-width') + '%';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        bars.forEach(function (el) { observer.observe(el); });
    }

    /* ==========================================================
       Hero typing effect
       ========================================================== */
    function initTypingEffect() {
        var el = document.getElementById('hero-typing-text');
        if (!el) return;

        var words = [
            'Lead Développeur Full-Stack',
            'Expert Angular, Spring Boot, Flutter',
            'Formateur & Mentor Technique'
        ];

        var wordIndex = 0, charIndex = 0, deleting = false;
        var typeSpeed = 65, deleteSpeed = 35, pauseEnd = 1600, pauseStart = 400;

        function tick() {
            var current = words[wordIndex];

            if (!deleting) {
                charIndex++;
                el.textContent = current.substring(0, charIndex);
                if (charIndex === current.length) {
                    deleting = true;
                    return setTimeout(tick, pauseEnd);
                }
                return setTimeout(tick, typeSpeed);
            } else {
                charIndex--;
                el.textContent = current.substring(0, charIndex);
                if (charIndex === 0) {
                    deleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    return setTimeout(tick, pauseStart);
                }
                return setTimeout(tick, deleteSpeed);
            }
        }

        tick();
    }

    /* ==========================================================
       Contact form — validation visuelle + envoi direct (FormSubmit)
       ========================================================== */
    function initContactForm() {
        var form = document.getElementById('ask-contact-form');
        if (!form) return;

        var note = form.querySelector('.ask-form-note');
        var submitBtn = form.querySelector('.ask-form-submit');
        var submitLabel = submitBtn ? submitBtn.childNodes[0].textContent : '';
        var fields = {
            name: form.querySelector('[name="name"]'),
            email: form.querySelector('[name="email"]'),
            subject: form.querySelector('[name="subject"]'),
            message: form.querySelector('[name="message"]')
        };

        function validators() {
            return {
                name: fields.name.value.trim().length >= 2,
                email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim()),
                subject: fields.subject.value.trim().length >= 2,
                message: fields.message.value.trim().length >= 10
            };
        }

        function setFieldState(field, isValid) {
            var group = field.closest('.ask-form-group');
            if (!group) return;
            if (field.value.trim() === '') {
                group.classList.remove('is-valid', 'is-invalid');
                return;
            }
            group.classList.toggle('is-valid', isValid);
            group.classList.toggle('is-invalid', !isValid);
        }

        Object.keys(fields).forEach(function (key) {
            var field = fields[key];
            if (!field) return;
            ['input', 'blur'].forEach(function (evt) {
                field.addEventListener(evt, function () {
                    var valid = validators()[key];
                    setFieldState(field, valid);
                });
            });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var results = validators();
            var allValid = Object.keys(results).every(function (k) { return results[k]; });

            Object.keys(fields).forEach(function (key) {
                setFieldState(fields[key], results[key]);
            });

            if (!allValid) {
                if (note) {
                    note.textContent = 'Merci de corriger les champs en rouge avant l\'envoi.';
                    note.className = 'ask-form-note error';
                }
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.childNodes[0].textContent = 'Envoi en cours... ';
            }
            if (note) {
                note.textContent = '';
                note.className = 'ask-form-note';
            }

            var endpoint = 'https://formsubmit.co/ajax/boubaKabore50@gmail.com';
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: fields.name.value.trim(),
                    email: fields.email.value.trim(),
                    subject: fields.subject.value.trim(),
                    message: fields.message.value.trim(),
                    _subject: '[Portfolio] ' + fields.subject.value.trim(),
                    _template: 'table'
                })
            })
                .then(function (response) {
                    if (!response.ok) throw new Error('Envoi impossible');
                    form.reset();
                    Object.keys(fields).forEach(function (key) {
                        var group = fields[key].closest('.ask-form-group');
                        if (group) group.classList.remove('is-valid', 'is-invalid');
                    });
                    if (note) {
                        note.textContent = 'Message envoyé avec succès ! Je vous répondrai rapidement.';
                        note.className = 'ask-form-note success';
                    }
                })
                .catch(function () {
                    if (note) {
                        note.textContent = 'Une erreur est survenue. Merci de réessayer ou de m\'écrire directement à boubaKabore50@gmail.com.';
                        note.className = 'ask-form-note error';
                    }
                })
                .finally(function () {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.childNodes[0].textContent = submitLabel;
                    }
                });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initScrollReveal();
        initLangBars();
        initTypingEffect();
        initContactForm();
    });
})();

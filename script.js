document.addEventListener('DOMContentLoaded', function () {

    // --- El resto de tu código JavaScript puede ir aquí ---

    // Ejemplo: Menú hamburguesa (si lo necesitas para móvil)
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const body = document.body;
 
    // Función para abrir/cerrar el menú
    const toggleMenu = () => {
        const isActive = mobileMenu.classList.contains('is-active');
        hamburger.classList.toggle('is-active', !isActive);
        mobileMenu.classList.toggle('is-active', !isActive);
        overlay.classList.toggle('is-active', !isActive);
        body.classList.toggle('no-scroll', !isActive); // Evita el scroll del body cuando el menú está abierto
        hamburger.setAttribute('aria-expanded', !isActive);
        mobileMenu.setAttribute('aria-hidden', isActive);
    };
 
    if (hamburger && mobileMenu && overlay) {
        hamburger.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu); // Cierra el menú al hacer clic en el overlay
 
        // Cierra el menú al hacer scroll
        window.addEventListener('scroll', () => {
            if (mobileMenu.classList.contains('is-active')) {
                toggleMenu();
            }
        }, { passive: true });
    }

    // --- Script para el año actual en el footer ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Script para ocultar/mostrar el header al hacer scroll ---
    const header = document.querySelector('.site-header');
    let lastScrollY = window.scrollY;

    if (header) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
                // Scrolling down & past the header
                header.classList.add('header-hidden');
            } else {
                // Scrolling up or at the top
                header.classList.remove('header-hidden');
            }

            lastScrollY = currentScrollY;
        });
    }

    // --- Script para la animación de conteo en la sección de cifras ---
    const cifrasSection = document.querySelector('.cifras-container');

    const animateCount = (element) => {
        const target = +element.dataset.count;
        const duration = 2000; // 2 segundos
        const stepTime = Math.abs(Math.floor(duration / target));
        let current = 0;

        const timer = setInterval(() => {
            current += 1;
            if (element.dataset.count === "95") { // Caso especial para el porcentaje
                element.textContent = `${current}%`;
            } else {
                element.textContent = `+${current.toLocaleString()}`;
            }

            if (current === target) {
                clearInterval(timer);
            }
        }, stepTime);
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.cifra-number');
                counters.forEach(counter => {
                    // Evita que la animación se repita si ya se ejecutó
                    if (!counter.dataset.animated) {
                        animateCount(counter);
                        counter.dataset.animated = 'true';
                    }
                });
                // Opcional: deja de observar una vez que la animación ha comenzado
                // observer.unobserve(entry.target);
            }
        });
    };

    const observerOptions = {
        root: null,
        threshold: 0.3 // Se activa cuando el 30% de la sección es visible
    };

    if (cifrasSection) {
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        observer.observe(cifrasSection);
    }

    // --- Script para el acordeón de Pilares ---
    const accordionItems = document.querySelectorAll('.pilar-accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.pilar-accordion-header');

        header.addEventListener('click', () => {
            const wasActive = item.classList.contains('active');

            // Cerrar todos los acordeones
            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.pilar-accordion-header').setAttribute('aria-expanded', 'false');
            });

            // Si el que se clickeó no estaba activo, abrirlo
            if (!wasActive) {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // --- Panel de Accesibilidad (Inyección Dinámica) ---
    (function initAccessibility() {
        // 1. Inyectar CSS si no existe
        if (!document.getElementById('access-css')) {
            const style = document.createElement('style');
            style.id = 'access-css';
            style.textContent = `
                #accessibility-widget { position: fixed; right: 20px; bottom: 100px; z-index: 10000; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
                
                .access-toggle { width: 45px; height: 45px; border-radius: 50%; background: #003366; border: 2px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.25); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.3s; }
                .access-toggle:hover { transform: scale(1.1); }
                .access-toggle svg { width: 24px; height: 24px; fill: #fff; }

                .access-panel { background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); padding: 8px; display: flex; flex-direction: column; gap: 5px; opacity: 0; transform: translateY(20px) scale(0.9); pointer-events: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: bottom right; margin-bottom: 5px; }
                .access-panel.active { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }

                .access-btn { width: 36px; height: 36px; border: none; border-radius: 8px; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s; padding: 0; }
                .access-btn:hover { background: #f0f3f7; }
                .access-btn img { width: 20px; height: 20px; opacity: 0.8; transition: opacity .2s; }
                .access-btn:hover img { opacity: 1; }
                
                .divider { width: 80%; height: 1px; background: #e2e2e2; margin: 2px auto; }
                .access-btn.reset { background: #f8f8f8; }
                
                /* Alto Contraste (Filtro inteligente) */
                html.high-contrast { filter: invert(1) hue-rotate(180deg); }
                html.high-contrast img, 
                html.high-contrast video, 
                html.high-contrast .logo-3d img,
                html.high-contrast #accessibility-widget { filter: invert(1) hue-rotate(180deg); }
                html.high-contrast #accessibility-widget img { filter: none; }
                
                /* Modo Lectura */
                body.reading-mode { cursor: help !important; }
            `;
            document.head.appendChild(style);
        }

        // 2. Inyectar HTML si no existe
        if (!document.getElementById('accessibility-widget')) {
            const widget = document.createElement('div');
            widget.id = 'accessibility-widget';
            widget.innerHTML = `
                <div class="access-panel" id="accessPanel">
                <button class="access-btn" id="acc-info" title="Información" aria-label="Información de accesibilidad">
                    <img src="https://rutanmedellin.org/hubfs/raw_assets/public/rutan2025/images/iconos-accesibilidad/informacion.svg" alt="Información">
                </button>
                <button class="access-btn" id="acc-read" title="Lectura de texto" aria-label="Activar lectura de texto">
                    <img src="https://rutanmedellin.org/hubfs/raw_assets/public/rutan2025/images/iconos-accesibilidad/escuchar.svg" alt="Lectura de texto">
                </button>
                <div class="divider"></div>
                <button class="access-btn" id="acc-inc" title="Aumentar texto" aria-label="Aumentar tamaño de texto">
                    <img src="https://rutanmedellin.org/hubfs/raw_assets/public/rutan2025/images/iconos-accesibilidad/aumentar_texto.svg" alt="Aumentar texto">
                </button>
                <button class="access-btn" id="acc-dec" title="Reducir texto" aria-label="Reducir tamaño de texto">
                    <img src="https://rutanmedellin.org/hubfs/raw_assets/public/rutan2025/images/iconos-accesibilidad/disminuir_texto.svg" alt="Reducir texto">
                </button>
                <div class="divider"></div>
                <button class="access-btn" id="acc-contrast" title="Alto contraste" aria-label="Activar alto contraste">
                    <img src="https://rutanmedellin.org/hubfs/raw_assets/public/rutan2025/images/iconos-accesibilidad/modo_oscuro.svg" alt="Alto contraste">
                </button>
                <button class="access-btn reset" id="acc-reset" title="Reiniciar" aria-label="Reiniciar ajustes">
                    <img src="https://rutanmedellin.org/hubfs/raw_assets/public/rutan2025/images/iconos-accesibilidad/recargar.svg" alt="Reiniciar">
                </button>
                </div>
                <button class="access-toggle" id="accessToggle" aria-label="Menú de Accesibilidad" title="Accesibilidad">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>
                </button>
            `;
            document.body.appendChild(widget);
        }

        // 3. Lógica de los botones
        const html = document.documentElement;
        const body = document.body;
        let fontSize = 100;
        let reading = false;
        const synth = window.speechSynthesis;

        // Toggle del menú
        document.getElementById('accessToggle').addEventListener('click', () => {
            document.getElementById('accessPanel').classList.toggle('active');
        });

        // Aumentar Texto
        document.getElementById('acc-inc').addEventListener('click', () => {
            if (fontSize < 150) { fontSize += 10; html.style.fontSize = fontSize + '%'; }
        });

        // Reducir Texto
        document.getElementById('acc-dec').addEventListener('click', () => {
            if (fontSize > 70) { fontSize -= 10; html.style.fontSize = fontSize + '%'; }
        });

        // Alto Contraste
        document.getElementById('acc-contrast').addEventListener('click', () => {
            html.classList.toggle('high-contrast');
        });

        // Modo Lectura
        document.getElementById('acc-read').addEventListener('click', () => {
            reading = !reading;
            body.classList.toggle('reading-mode', reading);
            if (!reading) synth.cancel();
            else alert('Modo lectura activado. Haz clic en cualquier texto para escucharlo.');
        });

        document.addEventListener('click', (e) => {
            if (reading && !e.target.closest('.access-panel')) {
                const text = e.target.innerText;
                if (text) {
                    synth.cancel();
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'es-ES';
                    synth.speak(utterance);
                }
            }
        });

        // Información
        document.getElementById('acc-info').addEventListener('click', () => {
            alert('Herramientas de Accesibilidad:\\n\\n- Lectura: Activa y haz clic en textos para escuchar.\\n- Tamaño: Aumenta o reduce el tamaño de la fuente.\\n- Contraste: Invierte colores para reducir fatiga visual.\\n- Reiniciar: Vuelve a la configuración original.');
        });

        // Reiniciar
        document.getElementById('acc-reset').addEventListener('click', () => {
            fontSize = 100;
            html.style.fontSize = '';
            html.classList.remove('high-contrast');
            reading = false;
            body.classList.remove('reading-mode');
            synth.cancel();
        });
    })();

});
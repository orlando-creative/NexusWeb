// --- CONFIGURACIÓN DE SUPABASE ---
// REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO DE SUPABASE
const supabaseUrl = 'https://nuevpudrinxciynmisjw.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXZwdWRyaW54Y2l5bm1pc2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDg1NDMsImV4cCI6MjA4MjY4NDU0M30.seDOH6NCtWxXUl1xnZXGnQsacZrzB2bcG38K-o8p7cQ';

// CORRECCIÓN DEL ERROR: Usamos 'supabaseClient' en lugar de 'supabase' 
// para no chocar con la librería global.
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

try {
    if (supabaseClient) {
        console.log("Supabase inicializado correctamente.");
    } else {
        console.warn("Librería Supabase no detectada. Las reseñas no funcionarán.");
    }
} catch (error) {
    console.error("Error al inicializar Supabase:", error);
}

// --- Lógica General (Se ejecuta cuando el HTML ha cargado) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. MENÚ DE HAMBURGUESA (Móvil)
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = menuBtn ? menuBtn.querySelector('i') : null;

    if (menuBtn && mobileMenu) {
        // Función para alternar el menú
        const toggleMenu = (e) => {
            e.stopPropagation(); // Evitar que el click llegue al document
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
                // Abrir
                mobileMenu.classList.remove('hidden');
                // Pequeño delay para permitir que la transición CSS funcione
                setTimeout(() => {
                    mobileMenu.classList.remove('opacity-0', '-translate-y-4');
                    mobileMenu.classList.add('opacity-100', 'translate-y-0');
                }, 10);
                
                if (menuIcon) {
                    menuIcon.classList.remove('fa-bars');
                    menuIcon.classList.add('fa-times');
                }
            } else {
                // Cerrar
                mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                mobileMenu.classList.add('opacity-0', '-translate-y-4');
                
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                }, 300); // Esperar a que termine la animación
                
                if (menuIcon) {
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
            }
        };

        menuBtn.addEventListener('click', toggleMenu);

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                // Reutilizamos la lógica de cerrar
                mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                mobileMenu.classList.add('opacity-0', '-translate-y-4');
                setTimeout(() => mobileMenu.classList.add('hidden'), 300);
                if (menuIcon) {
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
            }
        });
    } else {
        console.error("No se encontraron los elementos del menú (menuBtn o mobileMenu).");
    }

    // 2. NAVEGACIÓN DE PÁGINA ÚNICA (SPA)
    initSpaNavigation();

    // 3. CARGAR RESEÑAS
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (reviewsContainer && supabaseClient) {
        loadReviews();
    }
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (portfolioGrid && supabaseClient) {
        loadPortfolio();
    }

    // 4. MANEJO DE FORMULARIOS
    initForms();

    // 5. EFECTOS DE SCROLL (Navbar y Animaciones)
    initScrollEffects();

    // 6. FILTRO DE PORTAFOLIO
    initPortfolioFilter();

    // 7. PORTFOLIO CARD TILT EFFECT
    initPortfolioTilt();
});

function initSpaNavigation() {
    // Desplazamiento suave (Smooth Scrolling)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                // Cerrar menú móvil al hacer clic en un enlace
                const mobileMenu = document.getElementById('mobileMenu');
                const menuBtn = document.getElementById('menuBtn');
                const menuIcon = menuBtn ? menuBtn.querySelector('i') : null;
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.remove('opacity-100', 'translate-y-0');
                    mobileMenu.classList.add('opacity-0', '-translate-y-4');
                    setTimeout(() => mobileMenu.classList.add('hidden'), 300);
                    if (menuIcon) {
                        menuIcon.classList.remove('fa-times');
                        menuIcon.classList.add('fa-bars');
                    }
                }
            }
        });
    });

    // Resaltar enlace activo al desplazarse
    const sections = document.querySelectorAll('header[id], section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('#mobileMenu a');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });

                mobileLinks.forEach(link => {
                    link.classList.remove('bg-blue-800', 'text-white');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('bg-blue-800', 'text-white');
                    }
                });
            }
        });
    }, { rootMargin: "-50% 0px -50% 0px" }); // Se activa cuando la sección está en el medio

    sections.forEach(section => {
        observer.observe(section);
    });
}

function initScrollEffects() {
    // Navbar Glass Effect
    const nav = document.querySelector('.glass-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Reveal Animations on Scroll
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
}

function initPortfolioFilter() {
    const filterContainer = document.querySelector('.portfolio-filters');
    if (!filterContainer) return;

    const filterButtons = filterContainer.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.dataset.filter;
            // Se buscan los items DENTRO del manejador de click para no usar una lista obsoleta
            const portfolioItems = document.querySelectorAll('#portfolioGrid .portfolio-item');

            portfolioItems.forEach(item => {
                const itemCategory = item.dataset.category;
                const shouldShow = (filter === 'all' || itemCategory === filter);

                item.classList.toggle('hidden', !shouldShow);
            });
        });
    });
}

function initPortfolioTilt() {
    const items = document.querySelectorAll('.portfolio-item');
    items.forEach(item => {
        const card = item.querySelector('.portfolio-card');
        if (!card) return;

        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8; // Rotación máxima de 8 grados
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(15px)`;
        });

        item.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
        });
    });
}

// --- Funciones Auxiliares ---

// Función para el carrusel de la sección de servicios
function moveCarousel(btn, direction) {
    const container = btn.parentElement;
    const track = container.querySelector('.carousel-track');
    const slides = track.querySelectorAll('.carousel-slide');
    
    let currentIndex = parseInt(track.dataset.index || 0);
    currentIndex += direction;
    
    if (currentIndex >= slides.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = slides.length - 1;
    
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    track.dataset.index = currentIndex;
}

function getStarsHTML(rating) {
    return Array(5).fill(0).map((_, i) => 
        i < rating ? '<i class="fas fa-star text-yellow-400"></i>' : '<i class="far fa-star text-gray-300"></i>'
    ).join('');
}

async function loadPortfolio() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!supabaseClient) return;
    portfolioGrid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500"><i class="fas fa-circle-notch fa-spin text-2xl mb-2"></i><br>Cargando proyectos...</div>`;
    try {
        const { data, error } = await supabaseClient
            .from('projects')
            .select('*')
            .eq('is_visible', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        portfolioGrid.innerHTML = ''; // Limpiar loader

        if (!data || data.length === 0) {
            portfolioGrid.innerHTML = '<div class="col-span-full text-center text-gray-500">Pronto agregaremos nuevos proyectos.</div>';
            return;
        }

        data.forEach(project => {
            // Definir colores según categoría
            let categoryColor = 'text-blue-500';
            if(project.category === 'corporativo') categoryColor = 'text-purple-500';
            if(project.category === 'app') categoryColor = 'text-green-500';

            const item = document.createElement('div');
            item.className = 'portfolio-item fade-in-up';
            item.setAttribute('data-category', project.category);
            
            item.innerHTML = `
                <div class="bg-white rounded-2xl overflow-hidden shadow-lg portfolio-card">
                    <a href="${project.link || '#'}" target="_blank" class="block h-56 image-container">
                        <img src="${project.image_url}" alt="${project.title}" class="w-full h-full object-cover">
                        <div class="overlay">
                            <i class="fas fa-link text-2xl text-white"></i>
                        </div>
                    </a>
                    <div class="p-5">
                        <span class="text-xs font-bold ${categoryColor} uppercase tracking-wider">${project.category}</span>
                        <h3 class="text-lg font-bold text-gray-800 mt-1">${project.title}</h3>
                    </div>
                </div>
            `;
            portfolioGrid.appendChild(item);
        });

        // Re-inicializar efectos después de cargar
        initPortfolioTilt();

    } catch (error) {
        console.error("Error cargando portafolio:", error);
        portfolioGrid.innerHTML = '<div class="col-span-full text-center text-red-400">Error al cargar proyectos.</div>';
    }
}

async function loadReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (supabaseClient) {
        const { data, error } = await supabaseClient
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        reviewsContainer.innerHTML = '';
        if (!data || data.length === 0) {
            reviewsContainer.innerHTML = '<p class="text-gray-400 italic text-center">Sé el primero en dejar una reseña.</p>';
            return;
        }

        data.forEach(review => {
            const div = document.createElement('div');
            div.className = 'bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm fade-in-up';
            div.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <span class="font-bold text-white">${review.name}</span>
                    <div class="text-sm">${getStarsHTML(review.rating)}</div>
                </div>
                <p class="text-gray-300 text-sm leading-relaxed">"${review.message}"</p>
                <span class="text-xs text-gray-500 mt-2 block">${new Date(review.created_at).toLocaleDateString()}</span>
            `;
            reviewsContainer.appendChild(div);
        });
    } else {
        // Si Supabase no está inicializado, no mostramos nada o un mensaje estático.
        reviewsContainer.innerHTML = '<p class="text-gray-400 italic text-center">No se pudieron cargar las reseñas.</p>';
    }
}

function initForms() {
    // Formulario de Reseñas
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {

        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!supabaseClient) return alert("Configura Supabase primero.");

            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

            const name = document.getElementById('name').value;
            const message = document.getElementById('message').value;
            const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;

            try {
                const { error } = await supabaseClient
                    .from('reviews')
                    .insert([{ name, message, rating: parseInt(rating) }]);

                if (error) throw error;
                
                reviewForm.reset();
                // Reset stars to default (5 stars checked)
                const defaultStar = document.getElementById('star5');
                if (defaultStar) defaultStar.checked = true;
                alert('¡Gracias por tu reseña!');
                
                // Si estamos en la misma página que la lista, recargar
                if (document.getElementById('reviewsContainer')) loadReviews();

            } catch (error) {
                console.error(error);
                alert('Error al guardar.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Formulario de WhatsApp
    const whatsappForm = document.getElementById('whatsappForm');
    if (whatsappForm) {
        whatsappForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName').value;
            const service = document.getElementById('contactService').value;
            const message = document.getElementById('contactMessage').value;
            
            const text = `Hola Nexus Web, soy *${name}*.\nEstoy interesado en: *${service}*.\n\nDetalles del proyecto:\n${message}`;
            window.open(`https://wa.me/59162755177?text=${encodeURIComponent(text)}`, '_blank');
        });
    }
}
// --- CONFIGURACIÓN DE SUPABASE ---
// REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO DE SUPABASE
const supabaseUrl = 'https://nuevpudrinxciynmisjw.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZXZwdWRyaW54Y2l5bm1pc2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDg1NDMsImV4cCI6MjA4MjY4NDU0M30.seDOH6NCtWxXUl1xnZXGnQsacZrzB2bcG38K-o8p7cQ';

// CORRECCIÓN DEL ERROR: Usamos 'supabaseClient' en lugar de 'supabase' 
// para no chocar con la librería global.
let supabaseClient;

try {
    if (window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
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

    // 2. RESALTAR ENLACE ACTIVO
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, #mobileMenu a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === 'index.html' && href === './') || (href.includes(currentPath) && currentPath !== '')) {
            link.classList.add('active');
            if (link.closest('#mobileMenu')) {
                link.classList.add('bg-blue-800', 'text-white');
            }
        }
    });

    // 3. CARGAR RESEÑAS
    const reviewsContainer = document.getElementById('reviewsContainer');
    if (reviewsContainer && supabaseClient) {
        loadReviews();
    }

    // 4. MANEJO DE FORMULARIOS
    initForms();
});

// --- Funciones Auxiliares ---

function getStarsHTML(rating) {
    return Array(5).fill(0).map((_, i) => 
        i < rating ? '<i class="fas fa-star text-yellow-400"></i>' : '<i class="far fa-star text-gray-300"></i>'
    ).join('');
}

async function loadReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    try {
        // Usamos supabaseClient aquí
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

    } catch (error) {
        console.error("Error cargando reseñas:", error);
        reviewsContainer.innerHTML = '<p class="text-red-400 text-sm text-center">Error de conexión con reseñas.</p>';
    }
}

function initForms() {
    // Formulario de Reseñas
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        // Estrellas visuales
        const starsInputs = document.querySelectorAll('input[name="rating"]');
        starsInputs.forEach((input, idx) => {
            input.addEventListener('change', () => {
                 document.querySelectorAll('.star-label i').forEach((icon, i) => {
                     icon.className = i <= idx ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-400';
                 });
            });
        });

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
                document.querySelectorAll('.star-label i').forEach(icon => icon.className = 'fas fa-star text-yellow-400');
                document.getElementById('star5').checked = true;
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
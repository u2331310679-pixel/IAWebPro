// IAWebPro - Interactive JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });

    mobileMenuClose.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
    });

    // Close mobile menu when clicking outside
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });

    // Hero Slider Functionality
    let currentSlide = 0;
    const totalSlides = 3;
    const slideIndicators = document.querySelectorAll('.slide-indicator');
    
    function showSlide(slideIndex) {
        // Hide all slides
        for (let i = 0; i < totalSlides; i++) {
            const slide = document.getElementById(`slide-${i}`);
            if (slide) {
                slide.style.opacity = '0';
                slide.style.pointerEvents = 'none';
            }
        }
        
        // Show current slide
        const activeSlide = document.getElementById(`slide-${slideIndex}`);
        if (activeSlide) {
            activeSlide.style.opacity = '1';
            activeSlide.style.pointerEvents = 'auto';
        }
        
        // Update indicators
        slideIndicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'bg-cyan-400', 'w-8');
            indicator.classList.add('bg-gray-600');
            
            if (index === slideIndex) {
                indicator.classList.add('active', 'bg-cyan-400', 'w-8');
                indicator.classList.remove('bg-gray-600');
            }
        });
        
        currentSlide = slideIndex;
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }
    
    // Auto-rotate slides every 5 seconds
    let slideInterval = setInterval(nextSlide, 5000);
    
    // Manual slide control
    slideIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            clearInterval(slideInterval);
            showSlide(index);
            slideInterval = setInterval(nextSlide, 5000);
        });
    });
    
    // Pause auto-rotation on hover
    const heroSection = document.querySelector('section');
    heroSection.addEventListener('mouseenter', function() {
        clearInterval(slideInterval);
    });
    
    heroSection.addEventListener('mouseleave', function() {
        slideInterval = setInterval(nextSlide, 5000);
    });

    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize Supabase when page loads
    document.addEventListener('DOMContentLoaded', async function() {
        const supabaseReady = await initSupabase();
        if (!supabaseReady || !SupabaseService.isConfigured()) {
            console.warn('⚠️ Supabase no configurado. Usando modo fallback.');
        }
    });

    // Contact Form Handling - Supabase + Gmail Integration
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Always prevent default form submission
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const company = formData.get('company') || 'No especificada';
        const businessType = formData.get('business-type');
        const websiteGoal = formData.get('website-goal');
        const budget = formData.get('budget');
        const automation = formData.get('automation');
        const message = formData.get('message') || 'Sin mensaje adicional';
        
        // Simple validation
        if (!name || !email || !businessType || !websiteGoal || !budget || !automation) {
            alert('Por favor, completa todos los campos obligatorios marcados con *');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, ingresa un email válido.');
            return;
        }
        
        // Get display values for selects
        const businessTypeText = getSelectText('business-type', businessType);
        const websiteGoalText = getSelectText('website-goal', websiteGoal);
        const budgetText = getSelectText('budget', budget);
        const automationText = getSelectText('automation', automation);
        
        // Determine recommended plan based on answers
        const recommendedPlan = getRecommendedPlan(budget, automation, websiteGoal);
        
        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = '⚡ Procesando...';
        submitButton.disabled = true;
        
        // Try to save to Supabase first
        let leadSaved = false;
        if (window.supabase && SupabaseService.isConfigured()) {
            const leadData = {
                name,
                email,
                company,
                businessType,
                websiteGoal,
                budget,
                automation,
                message
            };
            
            const result = await SupabaseService.createLead(leadData);
            if (result.success) {
                leadSaved = true;
                console.log('✅ Lead guardado en Supabase:', result.data);
                
                // Auto-create activation ticket
                await SupabaseService.createTicket({
                    client_id: result.data.id,
                    title: `Nuevo lead: ${name}`,
                    description: `Lead calificado desde el formulario de contacto. Plan recomendado: ${recommendedPlan.name}`,
                    type: 'activation',
                    priority: 'high'
                });
            } else {
                console.error('❌ Error guardando en Supabase:', result.error);
            }
        }
        
        // Create email content
        const subject = encodeURIComponent('🚀 NUEVO LEAD CALIFICADO - IAWebPro');
        const body = encodeURIComponent(`🎯 LEAD CALIFICADO - ACCIÓN REQUERIDA

DATOS DEL CLIENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Nombre: ${name}
📧 Email: ${email}
🏢 Empresa: ${company}

📊 INFORMACIÓN DE CALIFICACIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏭 Tipo de Negocio: ${businessTypeText}
🎯 Objetivo Web: ${websiteGoalText}
💰 Presupuesto: ${budgetText}
🤖 Automatización: ${automationText}

💡 RECOMENDACIÓN AUTOMÁTICA: ${recommendedPlan.name}
${recommendedPlan.reason}

${leadSaved ? '💾 LEAD GUARDADO EN BASE DE DATOS: ✅ Sí' : '💾 LEAD GUARDADO EN BASE DE DATOS: ❌ Error (revisar configuración)'}

💬 MENSAJE ADICIONAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Fecha: ${new Date().toLocaleDateString('es-ES')}
🕐 Hora: ${new Date().toLocaleTimeString('es-ES')}

Para responder, simplemente responde a este email o escribe directamente a: ${email}

¡Saludos!
Sistema de contacto IAWebPro`);
        
        // Create Gmail web URL
        const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=u2331310679@gmail.com&su=${subject}&body=${body}`;
        
        // Update button text
        submitButton.textContent = 'Abriendo Gmail...';
        
        // Open Gmail Web directly
        window.open(gmailURL, '_blank');
        
        // Show success message
        setTimeout(() => {
            const successMessage = leadSaved 
                ? `¡Perfecto! ${name} ha sido guardado en la base de datos y se ha abierto Gmail con el mensaje listo.` 
                : `Se ha abierto Gmail con el mensaje de ${name}. ${SupabaseService.isConfigured() ? 'Error guardando en base de datos.' : 'Configura Supabase para guardar automáticamente.'}`;
            
            alert(successMessage);
            contactForm.reset();
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    });

    // Helper function to get select option text
    function getSelectText(selectId, value) {
        const select = document.getElementById(selectId);
        const option = select.querySelector(`option[value="${value}"]`);
        return option ? option.textContent : value;
    }

    // Helper function to recommend plan based on answers
    function getRecommendedPlan(budget, automation, goal) {
        let score = {
            'web-autonoma': 0,
            'automatico-pro': 0,
            'crecimiento-total': 0
        };
        
        // Budget scoring
        if (budget === 'menos-50' || budget === '50-100') {
            score['web-autonoma'] += 3;
            score['automatico-pro'] += 1;
        } else if (budget === '100-200') {
            score['web-autonoma'] += 2;
            score['automatico-pro'] += 3;
            score['crecimiento-total'] += 1;
        } else if (budget === '200-500') {
            score['automatico-pro'] += 2;
            score['crecimiento-total'] += 3;
        } else if (budget === 'mas-500') {
            score['crecimiento-total'] += 3;
        }
        
        // Automation scoring
        if (automation === 'si-completa') {
            score['automatico-pro'] += 2;
            score['crecimiento-total'] += 3;
        } else if (automation === 'si-basica' || automation === 'si-whatsapp') {
            score['web-autonoma'] += 1;
            score['automatico-pro'] += 3;
            score['crecimiento-total'] += 1;
        } else if (automation === 'no-seguro') {
            score['automatico-pro'] += 2;
        } else if (automation === 'no') {
            score['web-autonoma'] += 3;
        }
        
        // Goal scoring
        if (goal === 'vender' || goal === 'leads') {
            score['automatico-pro'] += 2;
            score['crecimiento-total'] += 2;
        } else if (goal === 'reservas') {
            score['automatico-pro'] += 3;
            score['crecimiento-total'] += 2;
        } else if (goal === 'informacion' || goal === 'branding') {
            score['web-autonoma'] += 2;
            score['automatico-pro'] += 1;
        }
        
        // Find highest score
        let recommendedPlan = 'web-autonoma';
        let maxScore = score['web-autonoma'];
        
        for (let plan in score) {
            if (score[plan] > maxScore) {
                maxScore = score[plan];
                recommendedPlan = plan;
            }
        }
        
        // Return recommendation with explanation
        const plans = {
            'web-autonoma': {
                name: '🌟 Web Autónoma ($49/mes)',
                reason: '✅ Perfecto para: Presupuesto ajustado, necesidades básicas, primera página web\n✅ Incluye: Landing page + chatbot básico + WhatsApp'
            },
            'automatico-pro': {
                name: '🚀 Automático Pro ($97/mes) - MÁS POPULAR',
                reason: '✅ Perfecto para: Automatización de ventas, captar leads, crecimiento activo\n✅ Incluye: Todo lo anterior + marketing automático + sistema de citas'
            },
            'crecimiento-total': {
                name: '👑 Crecimiento Total ($247/mes) - PREMIUM',
                reason: '✅ Perfecto para: Empresas establecidas, necesidades complejas, soporte premium\n✅ Incluye: Sitio completo + IA avanzada + entrenamiento personalizado'
            }
        };
        
        return plans[recommendedPlan];
    }

    // Scroll-based animations (optional enhancement)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    // Observe service cards for animations
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        observer.observe(card);
    });

    // Demo button functionality
    const demoButtons = document.querySelectorAll('button');
    demoButtons.forEach(button => {
        if (button.textContent.includes('Demo') || button.textContent.includes('Empezar')) {
            button.addEventListener('click', function(e) {
                if (this.textContent.includes('Demo')) {
                    alert('¡Gracias por tu interés! Pronto nos pondremos en contacto para programar tu demo personalizada.');
                } else if (this.textContent.includes('Empezar')) {
                    // Scroll to pricing section
                    const pricingSection = document.getElementById('precios');
                    if (pricingSection) {
                        const headerHeight = document.querySelector('header').offsetHeight;
                        const targetPosition = pricingSection.offsetTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    });

    // Plan selection buttons
    const planButtons = document.querySelectorAll('section#precios button');
    planButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planName = this.closest('.rounded-xl').querySelector('h3').textContent;
            
            if (this.textContent.includes('Contactar')) {
                // Scroll to contact section
                const contactSection = document.getElementById('contacto');
                if (contactSection) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = contactSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Pre-fill the message
                    setTimeout(() => {
                        const messageField = document.getElementById('message');
                        if (messageField) {
                            messageField.value = `Hola, estoy interesado en el plan ${planName}. Me gustaría obtener más información sobre precios y características personalizadas.`;
                        }
                    }, 500);
                }
            } else {
                alert(`¡Excelente elección! Has seleccionado el plan ${planName}. Te contactaremos pronto para procesar tu solicitud.`);
            }
        });
    });

    // Add some CSS classes for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .service-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .service-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
        }
        
        button {
            transition: all 0.3s ease;
        }
        
        button:hover {
            transform: translateY(-1px);
        }
        
        button:active {
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // Initialize first slide
    showSlide(0);

    // =====================================================
    // CHATBOT FUNCTIONALITY - AI ASSISTANT 24/7
    // =====================================================
    
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const quickBtns = document.querySelectorAll('.quick-btn');
    const chatIcon = document.getElementById('chat-icon');
    const closeIcon = document.getElementById('close-icon');
    const chatNotification = document.getElementById('chat-notification');

    let chatOpen = false;

    // Chatbot Knowledge Base - Intelligent Responses
    const chatbotKnowledge = {
        servicios: {
            keywords: ['servicio', 'servicios', 'que hacen', 'ofrecen', 'productos', 'soluciones'],
            responses: [
                {
                    text: "¡Ofrecemos 4 servicios principales de IA para emprendedores:",
                    options: [
                        "🌐 **Página Web Inteligente** - Sitios con chat de IA integrado",
                        "💬 **Atención Automática WhatsApp** - Chatbots que toman pedidos 24/7", 
                        "⭐ **Marketing con IA** - Posts automáticos para redes sociales",
                        "📋 **Gestión Inteligente** - Organización de clientes y seguimiento"
                    ],
                    followUp: "¿Te interesa algún servicio en particular?"
                }
            ]
        },
        precios: {
            keywords: ['precio', 'precios', 'costo', 'costos', 'cuanto cuesta', 'planes', 'tarifas'],
            responses: [
                {
                    text: "Tenemos 3 planes adaptados a cada etapa de tu negocio:",
                    options: [
                        "🚀 **Web Autónoma** - $49/mes o $499/año",
                        "🏆 **Automático Pro** - $97/mes o $997/año (MÁS POPULAR)",
                        "👑 **Crecimiento Total** - $247/mes o Plan Personalizado"
                    ],
                    followUp: "¿Quieres saber qué incluye cada plan específicamente?"
                }
            ]
        },
        contacto: {
            keywords: ['contacto', 'contactar', 'llamar', 'escribir', 'comunicar', 'hablar'],
            responses: [
                {
                    text: "¡Perfecto! Puedes contactarnos de varias formas:",
                    options: [
                        "📧 **Formulario Web** - Llena el formulario y te contactamos en 24h",
                        "📱 **Instagram** - Síguenos @iawebpro",
                        "📞 **Email Directo** - u2331310679@gmail.com"
                    ],
                    followUp: "¿Prefieres que te contactemos nosotros o quieres más información primero?"
                }
            ]
        },
        garantia: {
            keywords: ['garantia', 'garantía', 'devolucion', 'devolución', 'satisfacción', 'reembolso'],
            responses: [
                {
                    text: "¡Por supuesto! Ofrecemos:",
                    options: [
                        "✅ **Garantía de satisfacción** - 30 días para probar",
                        "🔄 **Soporte incluido** - En todos los planes",
                        "🎯 **Resultados garantizados** - O ajustamos sin costo"
                    ],
                    followUp: "¿Te gustaría empezar con nuestro plan más popular?"
                }
            ]
        }
    };

    // Advanced response matching with context awareness
    function getIntelligentResponse(message) {
        message = message.toLowerCase();
        
        // Check for greetings
        if (message.includes('hola') || message.includes('buenos') || message.includes('buenas')) {
            return {
                text: "¡Hola! 👋 Me alegra que estés aquí. Soy el asistente virtual de IAWebPro.",
                options: ["Estoy aquí para ayudarte con información sobre nuestros servicios de IA."],
                followUp: "¿En qué puedo ayudarte hoy?"
            };
        }

        // Check for specific service inquiries
        if (message.includes('web') || message.includes('página') || message.includes('sitio')) {
            return {
                text: "¡Excelente! Nuestro servicio de **Páginas Web Inteligentes** incluye:",
                options: [
                    "🌐 Diseño profesional y moderno",
                    "🤖 Chat de IA integrado que responde 24/7",
                    "📱 Totalmente responsive (móvil y desktop)",
                    "⚡ Optimización para conversiones"
                ],
                followUp: "¿Te gustaría ver nuestros planes de precios?"
            };
        }

        if (message.includes('whatsapp') || message.includes('telegram')) {
            return {
                text: "¡Perfecto! Nuestro **Chatbot para WhatsApp/Telegram** puede:",
                options: [
                    "📅 Agendar citas automáticamente",
                    "💰 Enviar precios y catálogos",
                    "🛒 Tomar pedidos las 24 horas",
                    "❓ Responder preguntas frecuentes"
                ],
                followUp: "¿Tu negocio recibe muchas consultas por WhatsApp?"
            };
        }

        if (message.includes('marketing') || message.includes('redes sociales') || message.includes('instagram')) {
            return {
                text: "¡Genial! Nuestro **Asistente de Marketing con IA** te ayuda con:",
                options: [
                    "📸 Posts automáticos para Instagram/TikTok",
                    "📧 Emails persuasivos y profesionales",
                    "📝 Descripciones de productos irresistibles",
                    "🎯 Contenido adaptado a tu audiencia"
                ],
                followUp: "¿Cuánto tiempo gastas creando contenido actualmente?"
            };
        }

        // Check knowledge base
        for (const category in chatbotKnowledge) {
            const knowledge = chatbotKnowledge[category];
            if (knowledge.keywords.some(keyword => message.includes(keyword))) {
                const response = knowledge.responses[0];
                return response;
            }
        }

        // Default intelligent response
        return {
            text: "Entiendo tu consulta. Te puedo ayudar con:",
            options: [
                "🚀 **Servicios** - Páginas web, WhatsApp, Marketing IA",
                "💰 **Precios** - Planes desde $49/mes",
                "📞 **Contacto** - Formas de comunicarnos"
            ],
            followUp: "¿Sobre cuál te gustaría saber más?"
        };
    }

    // Create message bubble
    function createMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start space-x-2 ${isUser ? 'justify-end' : ''}`;

        if (isUser) {
            messageDiv.innerHTML = `
                <div class="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg p-3 max-w-64 text-white text-sm">
                    <p>${content}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                </div>
                <div class="bg-gray-700 rounded-lg p-3 max-w-64 text-white text-sm">
                    ${content}
                </div>
            `;
        }

        return messageDiv;
    }

    // Create AI response with options
    function createAIResponse(response) {
        let content = `<p>${response.text}</p>`;
        
        if (response.options && response.options.length > 0) {
            content += '<ul class="mt-2 space-y-1">';
            response.options.forEach(option => {
                content += `<li class="text-xs">• ${option}</li>`;
            });
            content += '</ul>';
        }
        
        if (response.followUp) {
            content += `<p class="mt-2 text-cyan-300 font-medium">${response.followUp}</p>`;
        }

        return createMessage(content);
    }

    // Simulate typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex items-start space-x-2';
        typingDiv.innerHTML = `
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
            </div>
            <div class="bg-gray-700 rounded-lg p-3 text-white text-sm">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        `;
        return typingDiv;
    }

    // Send message function
    function sendMessage(message) {
        if (!message.trim()) return;

        // Add user message
        chatMessages.appendChild(createMessage(message, true));
        
        // Show typing indicator
        const typing = showTypingIndicator();
        chatMessages.appendChild(typing);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Get AI response after delay
        setTimeout(() => {
            typing.remove();
            const response = getIntelligentResponse(message);
            chatMessages.appendChild(createAIResponse(response));
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000 + Math.random() * 1000); // 1-2 second delay for realism

        // Clear input
        chatInput.value = '';
    }

    // Toggle chatbot
    chatbotToggle.addEventListener('click', () => {
        chatOpen = !chatOpen;
        
        if (chatOpen) {
            chatbotWindow.classList.remove('hidden');
            chatIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            chatNotification.style.display = 'none';
        } else {
            chatbotWindow.classList.add('hidden');
            chatIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        }
    });

    // Send message on button click
    sendBtn.addEventListener('click', () => {
        sendMessage(chatInput.value);
    });

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(chatInput.value);
        }
    });

    // Quick action buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            sendMessage(question);
        });
    });

    // Show notification after 10 seconds
    setTimeout(() => {
        if (!chatOpen) {
            chatNotification.style.display = 'flex';
        }
    }, 10000);

    // =====================================================
    // PAYMENT SYSTEM - MULTI PAYMENT METHODS
    // =====================================================
    
    const paymentModal = document.getElementById('payment-modal');
    const paymentButtons = document.querySelectorAll('.payment-btn');
    const closePaymentModal = document.getElementById('close-payment-modal');
    const cancelPayment = document.getElementById('cancel-payment');
    const monthlyBilling = document.getElementById('monthly-billing');
    const yearlyBilling = document.getElementById('yearly-billing');
    const paymentMethodBtns = document.querySelectorAll('.payment-method-btn');
    
    let selectedPlan = {};
    let selectedBilling = 'monthly';
    
    // Plan data with features
    const planData = {
        'web-autonoma': {
            name: 'Web Autónoma',
            subtitle: 'Tu Trampolín',
            features: [
                'Landing Page de 1 página moderna',
                'Chatbot IA: hasta 5 preguntas',
                'Integración básica WhatsApp',
                'Hosting incluido por 1 año',
                'Soporte por email'
            ]
        },
        'automatico-pro': {
            name: 'Automático Pro',
            subtitle: '🏆 Tu Plan Estrella - MÁS POPULAR',
            features: [
                'Todo del plan anterior +',
                'Landing con testimonios y galería',
                'Chatbot: agenda citas y toma pedidos',
                '10 posts redes sociales/mes',
                '2 Emails automáticos',
                'Base datos: hasta 50 clientes',
                '🎉 Configuración inicial GRATIS (valor $150)'
            ]
        },
        'crecimiento-total': {
            name: 'Crecimiento Total',
            subtitle: 'Tu Plan Premium',
            features: [
                'Todo del plan Pro +',
                'Sitio web hasta 5 páginas',
                'Chatbot entrenado específicamente',
                '20 posts + 5 emails mensuales',
                'Seguimiento de leads inteligente',
                'Soporte prioritario',
                '1 hora entrenamiento mensual'
            ]
        }
    };

    // Crypto addresses - REAL ADDRESSES FOR PAYMENTS
    const cryptoAddresses = {
        btc: '1LuUs7EZhrBjYy2WQ9p9SmwJCD9cbRrMyN', // Bitcoin Legacy Address
        usdc: 'BdgPQ66imJwSJohvSVVuX6ni9EKq9SeViBDEzxumN32g', // Solana USDC
        binance: 'QR_CODE' // Binance Pay QR Code
    };

    // Payment method handlers
    const paymentHandlers = {
        btc: (amount, plan) => handleCryptoPayment('Bitcoin', 'BTC', cryptoAddresses.btc, amount, plan),
        usdc: (amount, plan) => handleCryptoPayment('USD Coin (Solana)', 'USDC', cryptoAddresses.usdc, amount, plan),
        binance: (amount, plan) => handleBinancePay(amount, plan),
        card: (amount, plan) => handleCardPayment(amount, plan)
    };

    // Open payment modal
    function openPaymentModal(plan, priceMonthly, priceYearly) {
        selectedPlan = { plan, priceMonthly, priceYearly };
        
        const planInfo = planData[plan];
        
        // Update modal content
        document.getElementById('payment-plan-title').textContent = planInfo.name;
        document.getElementById('payment-plan-price').textContent = planInfo.subtitle;
        
        // Update pricing
        document.getElementById('monthly-price').textContent = `$${priceMonthly}/mes`;
        if (priceYearly === 'custom') {
            document.getElementById('yearly-price').textContent = 'Personalizado';
            yearlyBilling.style.display = 'none';
        } else {
            document.getElementById('yearly-price').textContent = `$${priceYearly}/año`;
            yearlyBilling.style.display = 'block';
        }
        
        // Update features
        const featuresContainer = document.getElementById('plan-features');
        featuresContainer.innerHTML = planInfo.features.map(feature => `• ${feature}`).join('<br>');
        
        // Show modal
        paymentModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Close payment modal
    function closePaymentModalHandler() {
        paymentModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Handle crypto payment
    function handleCryptoPayment(coinName, symbol, address, amount, plan) {
        const message = `
¡Perfecto! Has seleccionado pagar con ${coinName} (${symbol}).

💰 DETALLES DEL PAGO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Plan: ${planData[plan].name}
💵 Monto: $${amount} USD
🔗 Dirección ${symbol}: ${address}

📋 INSTRUCCIONES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Envía el equivalente a $${amount} USD en ${symbol} a la dirección de arriba
2. Guarda el hash de la transacción
3. Envíanos un email a u2331310679@gmail.com con:
   • Hash de transacción
   • Plan seleccionado
   • Tu email de contacto

⚡ Tu servicio se activará en máximo 24 horas después de confirmar el pago.

¿Quieres que abramos tu email ahora para enviarnos los detalles?`;

        if (confirm(message)) {
            // Open email with payment details
            const emailSubject = encodeURIComponent(`Pago ${symbol} - Plan ${planData[plan].name}`);
            const emailBody = encodeURIComponent(`
Hola IAWebPro,

He realizado un pago con ${coinName} (${symbol}) para el plan ${planData[plan].name}.

DETALLES DEL PAGO:
• Plan: ${planData[plan].name}
• Monto: $${amount} USD
• Criptomoneda: ${symbol}
• Dirección de pago: ${address}
• Hash de transacción: [PEGAR AQUÍ EL HASH]

Mi email de contacto: [TU EMAIL]

Por favor, confirmen la recepción del pago para activar mi servicio.

Gracias,
[TU NOMBRE]`);
            
            window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=u2331310679@gmail.com&su=${emailSubject}&body=${emailBody}`, '_blank');
        }
        
        closePaymentModalHandler();
    }

    // Handle Binance Pay with QR Code
    function handleBinancePay(amount, plan) {
        // Create custom modal for Binance Pay with QR
        const binanceModal = document.createElement('div');
        binanceModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4';
        binanceModal.innerHTML = `
            <div class="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700">
                <!-- Header -->
                <div class="bg-gradient-to-r from-yellow-500 to-yellow-400 p-6 text-black rounded-t-xl text-center">
                    <div class="text-3xl mb-2">🟡</div>
                    <h3 class="text-2xl font-bold">Binance Pay</h3>
                    <p class="text-yellow-900">Escanea el código QR</p>
                </div>
                
                <!-- QR Code -->
                <div class="p-6 text-center">
                    <div class="mb-4">
                        <p class="text-white font-semibold text-lg">💰 Monto: $${amount} USD</p>
                        <p class="text-gray-300">📦 Plan: ${planData[plan].name}</p>
                    </div>
                    
                    <div class="bg-white p-4 rounded-lg inline-block mb-4">
                        <img src="BINANCEPAY.jpg" alt="Binance Pay QR Code" class="w-48 h-48 object-contain mx-auto">
                    </div>
                    
                    <div class="text-sm text-gray-300 mb-4">
                        <p class="mb-2">📱 <strong>Instrucciones:</strong></p>
                        <div class="text-left bg-gray-700 p-3 rounded-lg">
                            <p>1. Abre tu app de Binance</p>
                            <p>2. Ve a "Pay" > "Scan"</p>
                            <p>3. Escanea este código QR</p>
                            <p>4. Confirma el pago de $${amount} USD</p>
                            <p>5. Envía captura del pago a:<br><span class="text-cyan-400">u2331310679@gmail.com</span></p>
                        </div>
                    </div>
                    
                    <div class="text-center text-green-400 text-sm font-semibold">
                        ⚡ Activación en máximo 24 horas
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="p-4 text-center border-t border-gray-700">
                    <button onclick="this.closest('.fixed').remove(); document.body.style.overflow = 'auto'" 
                            class="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-md transition-colors mr-2">
                        Cerrar
                    </button>
                    <button onclick="window.open('https://mail.google.com/mail/?view=cm&fs=1&to=u2331310679@gmail.com&su=${encodeURIComponent('Pago Binance Pay - Plan ' + planData[plan].name)}&body=${encodeURIComponent('Hola, he realizado un pago con Binance Pay por $' + amount + ' USD para el plan ' + planData[plan].name + '. Adjunto captura del pago.')}')"
                            class="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded-md transition-colors">
                        📧 Enviar Comprobante
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(binanceModal);
        document.body.style.overflow = 'hidden';
        
        closePaymentModalHandler();
    }

    // Handle Card Payment - Coming Soon
    function handleCardPayment(amount, plan) {
        alert(`
💳 PRÓXIMAMENTE DISPONIBLE

💰 Monto: $${amount} USD
📦 Plan: ${planData[plan].name}

🚧 TEMPORALMENTE NO DISPONIBLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Los pagos con tarjeta estarán disponibles pronto.

Por ahora puedes pagar con:
• Bitcoin (BTC)
• USDC (Solana)
• Binance Pay

📧 ¿Necesitas ayuda? Contacta: u2331310679@gmail.com`);
        
        closePaymentModalHandler();
    }

    // Event listeners for payment buttons
    paymentButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const plan = btn.getAttribute('data-plan');
            const priceMonthly = btn.getAttribute('data-price-monthly');
            const priceYearly = btn.getAttribute('data-price-yearly');
            
            openPaymentModal(plan, priceMonthly, priceYearly);
        });
    });

    // Event listeners for modal controls
    closePaymentModal.addEventListener('click', closePaymentModalHandler);
    cancelPayment.addEventListener('click', closePaymentModalHandler);

    // Billing cycle selection
    monthlyBilling.addEventListener('click', () => {
        selectedBilling = 'monthly';
        monthlyBilling.classList.add('active', 'border-cyan-400', 'border-2');
        monthlyBilling.classList.remove('border-gray-600', 'border');
        yearlyBilling.classList.remove('active', 'border-cyan-400', 'border-2');
        yearlyBilling.classList.add('border-gray-600', 'border');
    });

    yearlyBilling.addEventListener('click', () => {
        selectedBilling = 'yearly';
        yearlyBilling.classList.add('active', 'border-cyan-400', 'border-2');
        yearlyBilling.classList.remove('border-gray-600', 'border');
        monthlyBilling.classList.remove('active', 'border-cyan-400', 'border-2');
        monthlyBilling.classList.add('border-gray-600', 'border');
    });

    // Payment method selection
    paymentMethodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const method = btn.getAttribute('data-method');
            const amount = selectedBilling === 'monthly' ? 
                selectedPlan.priceMonthly : 
                (selectedPlan.priceYearly === 'custom' ? 'custom' : selectedPlan.priceYearly);
            
            if (amount === 'custom') {
                alert('Para el plan Premium personalizado, por favor contacta con nosotros primero.');
                return;
            }
            
            if (paymentHandlers[method]) {
                paymentHandlers[method](amount, selectedPlan.plan);
            }
        });
    });

    // Close modal when clicking outside
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            closePaymentModalHandler();
        }
    });
    
    console.log('IAWebPro website with AI Chatbot and Payment System loaded successfully!');
});
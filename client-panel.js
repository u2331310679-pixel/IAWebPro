// Client Panel JavaScript
class ClientPanel {
    constructor() {
        this.clientId = this.getClientIdFromUrl();
        this.clientData = null;
        this.useSupabase = false;
        
        if (!this.clientId) {
            this.showError('ID de cliente no válido');
            return;
        }
        
        this.init();
    }

    async init() {
        // Initialize Supabase
        const supabaseReady = await initSupabase();
        this.useSupabase = supabaseReady && SupabaseService.isConfigured();
        
        await this.loadClientData();
        this.bindEvents();
        this.startProgressSimulation();
    }

    getClientIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadClientData() {
        let clientFound = false;
        
        if (this.useSupabase) {
            const result = await SupabaseService.getClientById(this.clientId);
            if (result.success) {
                this.clientData = result.data;
                clientFound = true;
            }
        } else {
            // Get client data from localStorage
            const clients = JSON.parse(localStorage.getItem('iawebpro_clients') || '[]');
            this.clientData = clients.find(c => c.id === this.clientId);
            if (this.clientData) clientFound = true;
        }
        
        if (!clientFound) {
            // Load sample data for demo
            this.clientData = this.getSampleClientData();
        }
        
        this.renderClientInfo();
        this.renderPlanDetails();
        this.renderProjectTimeline();
        this.renderRecentActivity();
        this.updateServiceStatus();
    }

    getSampleClientData() {
        return {
            id: this.clientId,
            name: 'Cliente Demo',
            email: 'demo@example.com',
            plan: 'automatico-pro',
            status: 'active',
            paymentMethod: 'bitcoin',
            lastPayment: '2024-01-15',
            nextPayment: '2024-02-15',
            monthlyAmount: 97,
            memberSince: '2024-01-01',
            progress: 75
        };
    }

    renderClientInfo() {
        document.getElementById('client-name').textContent = this.clientData.name;
        
        // Update account info
        document.getElementById('next-payment').textContent = this.formatDate(this.clientData.nextPayment);
        document.getElementById('payment-method').textContent = this.getPaymentMethodName(this.clientData.paymentMethod);
        document.getElementById('member-since').textContent = this.formatDate(this.clientData.memberSince || this.clientData.lastPayment);
        
        // Update status
        const statusElement = document.getElementById('plan-status');
        const statusClass = this.clientData.status === 'active' ? 'bg-green-400' : 
                           this.clientData.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400';
        statusElement.className = `px-3 py-1 ${statusClass} text-gray-900 rounded-full text-sm font-semibold`;
        statusElement.textContent = this.getStatusText(this.clientData.status);
    }

    renderPlanDetails() {
        const planInfo = this.getPlanInfo(this.clientData.plan);
        
        document.getElementById('plan-name').textContent = planInfo.name;
        document.getElementById('plan-price').textContent = `$${this.clientData.monthlyAmount}/mes`;
        document.getElementById('plan-description').textContent = planInfo.description;
        
        // Render plan features
        const featuresContainer = document.getElementById('plan-features');
        featuresContainer.innerHTML = '';
        
        planInfo.features.forEach(feature => {
            const featureElement = document.createElement('div');
            featureElement.className = 'flex items-center space-x-2';
            featureElement.innerHTML = `
                <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-gray-300 text-sm">${feature}</span>
            `;
            featuresContainer.appendChild(featureElement);
        });
        
        // Update progress
        const progress = this.clientData.progress || this.calculateProgress();
        document.getElementById('progress-percentage').textContent = `${progress}%`;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-status').textContent = this.getProgressStatus(progress);
    }

    getPlanInfo(plan) {
        const plans = {
            'web-autonoma': {
                name: 'Web Autónoma',
                description: 'Tu página web profesional con chatbot IA básico',
                features: [
                    'Landing Page moderna y responsive',
                    'Chatbot IA: hasta 5 preguntas frecuentes',
                    'Integración básica con WhatsApp',
                    'Formulario de contacto inteligente',
                    'Optimización SEO básica'
                ]
            },
            'automatico-pro': {
                name: 'Automático Pro',
                description: 'Automatización completa de marketing y ventas con IA',
                features: [
                    'Todo del plan Web Autónoma',
                    'Landing page con testimonios y galería',
                    'Chatbot avanzado: agenda citas y toma pedidos',
                    '10 posts para redes sociales por mes',
                    '2 campañas de email automáticas',
                    'Base de datos hasta 50 clientes',
                    'Análisis de rendimiento mensual'
                ]
            },
            'crecimiento-total': {
                name: 'Crecimiento Total',
                description: 'Solución empresarial completa con soporte premium',
                features: [
                    'Todo del plan Automático Pro',
                    'Sitio web completo hasta 5 páginas',
                    'Chatbot entrenado específicamente para tu negocio',
                    '20 posts + 5 campañas de email mensuales',
                    'Sistema de seguimiento de leads inteligente',
                    'Soporte prioritario 24/7',
                    '1 hora de entrenamiento mensual',
                    'Reportes avanzados y analytics',
                    'Integración con CRM personalizada'
                ]
            }
        };
        
        return plans[plan] || plans['web-autonoma'];
    }

    renderProjectTimeline() {
        const timeline = this.generateTimeline();
        const container = document.getElementById('project-timeline');
        container.innerHTML = '';
        
        timeline.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'flex items-start space-x-4';
            
            const statusIcon = item.completed ? 
                '<svg class="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' :
                item.current ?
                '<svg class="w-6 h-6 text-blue-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-7a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>' :
                '<svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clip-rule="evenodd"></path></svg>';
            
            timelineItem.innerHTML = `
                <div class="flex-shrink-0 mt-1">
                    ${statusIcon}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium ${item.completed ? 'text-green-400' : item.current ? 'text-blue-400' : 'text-gray-400'}">
                        ${item.title}
                    </div>
                    <div class="text-sm text-gray-500 mt-1">
                        ${item.description}
                    </div>
                    <div class="text-xs text-gray-600 mt-1">
                        ${item.date}
                    </div>
                </div>
            `;
            
            container.appendChild(timelineItem);
        });
    }

    generateTimeline() {
        const baseTimeline = [
            {
                title: 'Pago Confirmado',
                description: 'Tu pago ha sido procesado exitosamente',
                date: this.formatDate(this.clientData.lastPayment),
                completed: true,
                current: false
            },
            {
                title: 'Análisis de Requerimientos',
                description: 'Nuestro equipo está analizando tus necesidades específicas',
                date: this.addDays(this.clientData.lastPayment, 1),
                completed: true,
                current: false
            },
            {
                title: 'Desarrollo en Progreso',
                description: 'Creación de tu sitio web y configuración de servicios',
                date: this.addDays(this.clientData.lastPayment, 3),
                completed: this.clientData.progress > 50,
                current: this.clientData.progress <= 50
            },
            {
                title: 'Configuración de IA',
                description: 'Entrenamiento y configuración de tu chatbot personalizado',
                date: this.addDays(this.clientData.lastPayment, 7),
                completed: this.clientData.progress > 75,
                current: this.clientData.progress > 50 && this.clientData.progress <= 75
            },
            {
                title: 'Pruebas y Entrega',
                description: 'Revisión final y entrega de todos los servicios',
                date: this.addDays(this.clientData.lastPayment, 10),
                completed: this.clientData.progress >= 100,
                current: this.clientData.progress > 75 && this.clientData.progress < 100
            }
        ];
        
        // Add plan-specific timeline items
        if (this.clientData.plan === 'automatico-pro' || this.clientData.plan === 'crecimiento-total') {
            baseTimeline.push({
                title: 'Configuración de Marketing',
                description: 'Preparación de contenido automático y campañas',
                date: this.addDays(this.clientData.lastPayment, 12),
                completed: this.clientData.progress >= 100,
                current: false
            });
        }
        
        if (this.clientData.plan === 'crecimiento-total') {
            baseTimeline.push({
                title: 'Sesión de Entrenamiento',
                description: 'Primera sesión de entrenamiento personalizado',
                date: this.addDays(this.clientData.lastPayment, 14),
                completed: this.clientData.progress >= 100,
                current: false
            });
        }
        
        return baseTimeline;
    }

    renderRecentActivity() {
        const activities = [
            {
                title: 'Sitio web actualizado',
                description: 'Se optimizó el rendimiento y se agregaron nuevas funcionalidades',
                time: '2 horas',
                icon: 'web'
            },
            {
                title: 'Chatbot entrenado',
                description: 'Se agregaron 15 nuevas respuestas al chatbot',
                time: '1 día',
                icon: 'chat'
            },
            {
                title: 'Posts generados',
                description: 'Se crearon 5 nuevos posts para redes sociales',
                time: '2 días',
                icon: 'social'
            },
            {
                title: 'Backup realizado',
                description: 'Copia de seguridad automática completada',
                time: '3 días',
                icon: 'backup'
            }
        ];
        
        const container = document.getElementById('recent-activity');
        container.innerHTML = '';
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'flex items-start space-x-3 py-3 border-b border-gray-700 last:border-b-0';
            
            const iconSvg = this.getActivityIcon(activity.icon);
            
            activityItem.innerHTML = `
                <div class="flex-shrink-0">
                    ${iconSvg}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-white">
                        ${activity.title}
                    </div>
                    <div class="text-sm text-gray-400 mt-1">
                        ${activity.description}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        Hace ${activity.time}
                    </div>
                </div>
            `;
            
            container.appendChild(activityItem);
        });
    }

    getActivityIcon(type) {
        const icons = {
            web: '<div class="w-8 h-8 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"></path></svg></div>',
            chat: '<div class="w-8 h-8 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></div>',
            social: '<div class="w-8 h-8 bg-pink-500 bg-opacity-20 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2z"></path></svg></div>',
            backup: '<div class="w-8 h-8 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center"><svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></div>'
        };
        return icons[type] || icons.web;
    }

    updateServiceStatus() {
        // Update service status indicators
        const progress = this.clientData.progress || 0;
        
        document.getElementById('website-status').className = `w-3 h-3 rounded-full ${progress > 25 ? 'bg-green-400' : 'bg-yellow-400'}`;
        document.getElementById('chatbot-status').className = `w-3 h-3 rounded-full ${progress > 50 ? 'bg-green-400' : 'bg-yellow-400'}`;
        document.getElementById('marketing-status').className = `w-3 h-3 rounded-full ${progress > 75 ? 'bg-green-400' : 'bg-gray-400'}`;
    }

    bindEvents() {
        // Support modal
        document.getElementById('contact-support-btn').addEventListener('click', () => this.showSupportModal());
        document.getElementById('close-support-modal').addEventListener('click', () => this.hideSupportModal());
        document.getElementById('cancel-support').addEventListener('click', () => this.hideSupportModal());
        document.getElementById('support-form').addEventListener('submit', (e) => this.handleSupportForm(e));
        
        // Service buttons
        document.getElementById('preview-website-btn').addEventListener('click', () => this.previewWebsite());
        document.getElementById('test-chatbot-btn').addEventListener('click', () => this.testChatbot());
        document.getElementById('view-posts-btn').addEventListener('click', () => this.viewPosts());
        
        // Account buttons
        document.getElementById('upgrade-plan-btn').addEventListener('click', () => this.upgradePlan());
        document.getElementById('view-invoices-btn').addEventListener('click', () => this.viewInvoices());
        
        // Request buttons
        document.getElementById('edit-website-btn').addEventListener('click', () => this.requestWebsiteEdit());
        document.getElementById('train-chatbot-btn').addEventListener('click', () => this.requestChatbotTraining());
        document.getElementById('request-content-btn').addEventListener('click', () => this.requestContent());
    }

    showSupportModal() {
        document.getElementById('support-modal').classList.remove('hidden');
    }

    hideSupportModal() {
        document.getElementById('support-modal').classList.add('hidden');
        document.getElementById('support-form').reset();
    }

    handleSupportForm(e) {
        e.preventDefault();
        
        const formData = {
            type: document.getElementById('support-type').value,
            subject: document.getElementById('support-subject').value,
            message: document.getElementById('support-message').value,
            client: this.clientData.name,
            email: this.clientData.email,
            plan: this.getPlanInfo(this.clientData.plan).name
        };
        
        const emailSubject = `Soporte IAWebPro - ${formData.subject}`;
        const emailBody = `Cliente: ${formData.client} (${formData.email})
Plan: ${formData.plan}
Tipo de Consulta: ${this.getSupportTypeText(formData.type)}

Mensaje:
${formData.message}

---
ID Cliente: ${this.clientId}
Fecha: ${new Date().toLocaleString()}`;
        
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=u2331310679@gmail.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(gmailUrl, '_blank');
        
        this.hideSupportModal();
        this.showSuccessNotification('Tu consulta ha sido enviada. Te responderemos pronto.');
    }

    getSupportTypeText(type) {
        const types = {
            technical: 'Soporte Técnico',
            billing: 'Facturación',
            feature: 'Solicitud de Función',
            feedback: 'Comentarios',
            other: 'Otro'
        };
        return types[type] || type;
    }

    previewWebsite() {
        // Open main website
        window.open('index.html', '_blank');
    }

    testChatbot() {
        // Open main website and activate chatbot
        const newWindow = window.open('index.html', '_blank');
        setTimeout(() => {
            if (newWindow) {
                newWindow.postMessage({ action: 'openChatbot' }, '*');
            }
        }, 2000);
    }

    viewPosts() {
        this.showInfoModal('Posts del Mes', 'Aquí verás todo el contenido generado automáticamente para tus redes sociales. Esta función estará disponible cuando tu proyecto esté 100% completo.');
    }

    upgradePlan() {
        window.open('index.html#precios', '_blank');
    }

    viewInvoices() {
        const invoice = `FACTURA IAWEBPRO
        
Cliente: ${this.clientData.name}
Email: ${this.clientData.email}
Plan: ${this.getPlanInfo(this.clientData.plan).name}
Monto: $${this.clientData.monthlyAmount}/mes

Último Pago: ${this.formatDate(this.clientData.lastPayment)}
Próximo Pago: ${this.formatDate(this.clientData.nextPayment)}
Método de Pago: ${this.getPaymentMethodName(this.clientData.paymentMethod)}

Estado: ${this.getStatusText(this.clientData.status)}`;

        this.showInfoModal('Detalles de Facturación', invoice);
    }

    requestWebsiteEdit() {
        const subject = `Solicitud de Cambios - Sitio Web - ${this.clientData.name}`;
        const body = `Hola equipo IAWebPro,

Me gustaría solicitar algunos cambios en mi sitio web.

Cliente: ${this.clientData.name}
Plan: ${this.getPlanInfo(this.clientData.plan).name}
ID: ${this.clientId}

Cambios solicitados:
[Describe aquí los cambios que necesitas]

Gracias,
${this.clientData.name}`;
        
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=u2331310679@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
    }

    requestChatbotTraining() {
        const subject = `Entrenamiento Chatbot - ${this.clientData.name}`;
        const body = `Hola equipo IAWebPro,

Me gustaría solicitar entrenamiento adicional para mi chatbot.

Cliente: ${this.clientData.name}
Plan: ${this.getPlanInfo(this.clientData.plan).name}
ID: ${this.clientId}

Información para entrenar al chatbot:
[Agrega aquí las preguntas frecuentes, información sobre tus productos/servicios, etc.]

Gracias,
${this.clientData.name}`;
        
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=u2331310679@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
    }

    requestContent() {
        const subject = `Solicitud Contenido Marketing - ${this.clientData.name}`;
        const body = `Hola equipo IAWebPro,

Me gustaría solicitar contenido específico para mi marketing.

Cliente: ${this.clientData.name}
Plan: ${this.getPlanInfo(this.clientData.plan).name}
ID: ${this.clientId}

Tipo de contenido necesario:
[Describe qué tipo de posts, emails, o contenido necesitas]

Información sobre mi negocio:
[Agrega información relevante sobre tu negocio, productos, servicios]

Gracias,
${this.clientData.name}`;
        
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=u2331310679@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
    }

    showInfoModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-xl max-w-2xl w-full border border-gray-700">
                <div class="p-6 border-b border-gray-700">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-bold">${title}</h3>
                        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <pre class="text-gray-300 whitespace-pre-wrap text-sm">${content}</pre>
                </div>
                <div class="p-6 border-t border-gray-700 text-center">
                    <button onclick="this.closest('.fixed').remove()" class="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-md transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    startProgressSimulation() {
        // Simulate progress for demo clients
        if (!this.clientData.progress) {
            this.clientData.progress = Math.min(Math.random() * 100, 85);
            
            // Simulate gradual progress
            setInterval(() => {
                if (this.clientData.progress < 100) {
                    this.clientData.progress = Math.min(this.clientData.progress + Math.random() * 2, 100);
                    this.renderPlanDetails();
                    this.updateServiceStatus();
                }
            }, 30000); // Update every 30 seconds
        }
    }

    calculateProgress() {
        const daysSinceStart = Math.floor((new Date() - new Date(this.clientData.lastPayment)) / (1000 * 60 * 60 * 24));
        return Math.min(daysSinceStart * 10, 85); // 10% per day, max 85%
    }

    getProgressStatus(progress) {
        if (progress < 25) return 'Iniciando análisis de requerimientos...';
        if (progress < 50) return 'Desarrollando tu sitio web...';
        if (progress < 75) return 'Configurando sistemas de IA...';
        if (progress < 95) return 'Realizando pruebas finales...';
        return '¡Proyecto completado!';
    }

    formatDate(dateString) {
        if (!dateString) return '--';
        return new Date(dateString).toLocaleDateString('es-ES');
    }

    addDays(dateString, days) {
        if (!dateString) return this.formatDate(new Date());
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return this.formatDate(date);
    }

    getPaymentMethodName(method) {
        const methods = {
            bitcoin: 'Bitcoin (BTC)',
            usdc: 'USD Coin (USDC)',
            binance: 'Binance Pay'
        };
        return methods[method] || method;
    }

    getStatusText(status) {
        const statuses = {
            active: 'Activo',
            pending: 'Pendiente',
            suspended: 'Suspendido'
        };
        return statuses[status] || status;
    }

    showError(message) {
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <div class="text-center">
                    <h1 class="text-2xl font-bold mb-4">Error</h1>
                    <p class="text-gray-400 mb-6">${message}</p>
                    <a href="index.html" class="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md transition-colors">
                        Volver al Inicio
                    </a>
                </div>
            </div>
        `;
    }

    showSuccessNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize client panel
const clientPanel = new ClientPanel();

// Listen for messages from parent window (chatbot integration)
window.addEventListener('message', (event) => {
    if (event.data.action === 'openChatbot') {
        // Simulate opening chatbot
        setTimeout(() => {
            const chatbotToggle = document.getElementById('chatbot-toggle');
            if (chatbotToggle) {
                chatbotToggle.click();
            }
        }, 1000);
    }
});
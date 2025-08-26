// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.clients = [];
        this.payments = [];
        this.tickets = [];
        this.useSupabase = false;
        
        this.init();
    }

    async init() {
        // Initialize Supabase
        const supabaseReady = await initSupabase();
        this.useSupabase = supabaseReady && SupabaseService.isConfigured();
        
        if (!this.useSupabase) {
            console.warn('⚠️ Supabase no configurado. Usando localStorage como fallback.');
            this.clients = JSON.parse(localStorage.getItem('iawebpro_clients') || '[]');
            this.payments = JSON.parse(localStorage.getItem('iawebpro_payments') || '[]');
            this.tickets = JSON.parse(localStorage.getItem('iawebpro_tickets') || '[]');
            this.loadSampleData();
        } else {
            await this.loadDataFromSupabase();
        }
        
        this.bindEvents();
        this.updateStats();
        this.renderClientsTable();
        this.startAutoRefresh();
    }

    async loadDataFromSupabase() {
        try {
            const [clientsResult, paymentsResult, ticketsResult] = await Promise.all([
                SupabaseService.getClients(),
                SupabaseService.getPaymentsByClient(),
                SupabaseService.getTickets()
            ]);
            
            if (clientsResult.success) this.clients = clientsResult.data;
            if (paymentsResult.success) this.payments = paymentsResult.data;
            if (ticketsResult.success) this.tickets = ticketsResult.data;
            
            console.log('✅ Datos cargados desde Supabase');
        } catch (error) {
            console.error('❌ Error cargando datos desde Supabase:', error);
        }
    }

    bindEvents() {
        // Modal events
        document.getElementById('add-client-btn').addEventListener('click', () => this.showAddClientModal());
        document.getElementById('close-add-client-modal').addEventListener('click', () => this.hideAddClientModal());
        document.getElementById('cancel-add-client').addEventListener('click', () => this.hideAddClientModal());
        document.getElementById('add-client-form').addEventListener('submit', (e) => this.handleAddClient(e));

        // Payment verification
        document.getElementById('verify-payment-btn').addEventListener('click', () => this.showPaymentVerificationModal());
        document.getElementById('close-payment-verification-modal').addEventListener('click', () => this.hidePaymentVerificationModal());
        document.getElementById('scan-payments-btn').addEventListener('click', () => this.scanForPayments());

        // Search and filter
        document.getElementById('search-clients').addEventListener('input', (e) => this.filterClients(e.target.value));
        document.getElementById('filter-status').addEventListener('change', (e) => this.filterClientsByStatus(e.target.value));

        // Quick actions
        document.getElementById('send-email-btn').addEventListener('click', () => this.showEmailModal());
        document.getElementById('generate-report-btn').addEventListener('click', () => this.generateReport());
    }

    loadSampleData() {
        if (this.clients.length === 0) {
            const sampleClients = [
                {
                    id: 'client_001',
                    name: 'María García',
                    email: 'maria@example.com',
                    plan: 'automatico-pro',
                    status: 'active',
                    paymentMethod: 'bitcoin',
                    lastPayment: '2024-01-15',
                    nextPayment: '2024-02-15',
                    transactionHash: 'bc1234...5678',
                    monthlyAmount: 97
                },
                {
                    id: 'client_002',
                    name: 'Carlos Rodríguez',
                    email: 'carlos@example.com',
                    plan: 'web-autonoma',
                    status: 'active',
                    paymentMethod: 'usdc',
                    lastPayment: '2024-01-20',
                    nextPayment: '2024-02-20',
                    transactionHash: 'usdc9876...4321',
                    monthlyAmount: 49
                },
                {
                    id: 'client_003',
                    name: 'Ana López',
                    email: 'ana@example.com',
                    plan: 'crecimiento-total',
                    status: 'pending',
                    paymentMethod: 'binance',
                    lastPayment: null,
                    nextPayment: '2024-01-30',
                    transactionHash: null,
                    monthlyAmount: 247
                }
            ];
            
            this.clients = sampleClients;
            this.saveClients();
        }
    }

    async updateStats() {
        let stats;
        
        if (this.useSupabase) {
            const result = await SupabaseService.getDashboardStats();
            stats = result.success ? result.data : {
                totalClients: 0,
                activeClients: 0,
                pendingClients: 0,
                leads: 0,
                monthlyRevenue: 0,
                openTickets: 0
            };
        } else {
            const activeClients = this.clients.filter(c => c.status === 'active').length;
            const pendingPayments = this.clients.filter(c => c.status === 'pending').length;
            const monthlyRevenue = this.clients
                .filter(c => c.status === 'active')
                .reduce((total, c) => total + (c.monthlyAmount || c.monthly_amount || 0), 0);
            const openTickets = this.tickets.filter(t => t.status === 'open').length;
            
            stats = {
                activeClients,
                pendingClients: pendingPayments,
                monthlyRevenue,
                openTickets
            };
        }

        document.getElementById('active-clients').textContent = stats.activeClients;
        document.getElementById('pending-payments').textContent = stats.pendingClients + (stats.leads || 0);
        document.getElementById('monthly-revenue').textContent = `$${Math.round(stats.monthlyRevenue)}`;
        document.getElementById('open-tickets').textContent = stats.openTickets;
        document.getElementById('notification-badge').textContent = stats.pendingClients + stats.openTickets + (stats.leads || 0);
    }

    renderClientsTable() {
        const tbody = document.getElementById('clients-table-body');
        tbody.innerHTML = '';

        this.clients.forEach(client => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-700 transition-colors';
            
            const statusColor = {
                active: 'bg-green-400',
                pending: 'bg-yellow-400',
                suspended: 'bg-red-400'
            }[client.status] || 'bg-gray-400';

            const planNames = {
                'web-autonoma': 'Web Autónoma',
                'automatico-pro': 'Automático Pro',
                'crecimiento-total': 'Crecimiento Total'
            };

            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                            ${client.name.charAt(0)}
                        </div>
                        <div class="ml-3">
                            <div class="text-sm font-medium text-white">${client.name}</div>
                            <div class="text-sm text-gray-400">${client.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-white font-medium">${planNames[client.plan]}</div>
                    <div class="text-sm text-gray-400">$${client.monthlyAmount}/mes</div>
                </td>
                <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${statusColor}">
                        ${client.status === 'active' ? 'Activo' : client.status === 'pending' ? 'Pendiente' : 'Suspendido'}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-300">
                    ${client.lastPayment || 'Sin pagos'}
                </td>
                <td class="px-6 py-4 text-sm text-gray-300">
                    ${client.nextPayment}
                </td>
                <td class="px-6 py-4 text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="adminDashboard.activateClient('${client.id}')" class="text-green-400 hover:text-green-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </button>
                        <button onclick="adminDashboard.editClient('${client.id}')" class="text-blue-400 hover:text-blue-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="adminDashboard.sendWelcomeEmail('${client.id}')" class="text-purple-400 hover:text-purple-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </button>
                        <button onclick="adminDashboard.suspendClient('${client.id}')" class="text-red-400 hover:text-red-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    showAddClientModal() {
        document.getElementById('add-client-modal').classList.remove('hidden');
    }

    hideAddClientModal() {
        document.getElementById('add-client-modal').classList.add('hidden');
        document.getElementById('add-client-form').reset();
    }

    async handleAddClient(e) {
        e.preventDefault();
        
        const clientData = {
            name: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            plan: document.getElementById('client-plan').value,
            payment_method: document.getElementById('client-payment-method').value,
            transaction_hash: document.getElementById('transaction-hash').value || null,
            status: 'pending',
            next_payment: this.calculateNextPayment(new Date()),
            monthly_amount: this.getPlanAmount(document.getElementById('client-plan').value)
        };

        let success = false;
        
        if (this.useSupabase) {
            const result = await SupabaseService.updateClient(null, {
                ...clientData,
                id: undefined // Let Supabase generate the ID
            });
            
            if (result.success) {
                clientData.id = result.data.id;
                this.clients.push(result.data);
                success = true;
                
                // Create automatic ticket
                await SupabaseService.createTicket({
                    client_id: result.data.id,
                    title: `Activar cliente: ${clientData.name}`,
                    description: `Cliente agregado manualmente. Plan: ${this.getPlanDisplayName(clientData.plan)}`,
                    type: 'activation',
                    priority: 'high'
                });
            }
        } else {
            clientData.id = 'client_' + Date.now();
            this.clients.push(clientData);
            this.saveClients();
            this.createActivationTicket(clientData);
            success = true;
        }
        
        if (success) {
            this.updateStats();
            this.renderClientsTable();
            this.hideAddClientModal();
            this.showSuccessNotification(`Cliente ${clientData.name} agregado exitosamente`);
        } else {
            this.showErrorNotification('Error agregando cliente');
        }
    }

    getPlanAmount(plan) {
        const amounts = {
            'web-autonoma': 49,
            'automatico-pro': 97,
            'crecimiento-total': 247
        };
        return amounts[plan] || 0;
    }

    calculateNextPayment(date) {
        const next = new Date(date);
        next.setMonth(next.getMonth() + 1);
        return next.toISOString().split('T')[0];
    }

    async activateClient(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return;
        
        const updates = {
            status: 'active',
            last_payment: new Date().toISOString().split('T')[0],
            next_payment: this.calculateNextPayment(new Date())
        };
        
        let success = false;
        
        if (this.useSupabase) {
            const result = await SupabaseService.updateClient(clientId, updates);
            if (result.success) {
                Object.assign(client, updates);
                success = true;
                
                // Create payment record
                await SupabaseService.createPayment({
                    client_id: clientId,
                    amount: client.monthly_amount || this.getPlanAmount(client.plan),
                    payment_method: client.payment_method,
                    transaction_hash: client.transaction_hash,
                    status: 'confirmed',
                    plan: client.plan,
                    billing_period: 'monthly',
                    payment_date: new Date().toISOString().split('T')[0]
                });
            }
        } else {
            Object.assign(client, {
                status: 'active',
                lastPayment: updates.last_payment,
                nextPayment: updates.next_payment
            });
            this.saveClients();
            success = true;
        }
        
        if (success) {
            this.updateStats();
            this.renderClientsTable();
            this.sendActivationEmail(client);
            this.showSuccessNotification(`Cliente ${client.name} activado exitosamente`);
        } else {
            this.showErrorNotification('Error activando cliente');
        }
    }

    suspendClient(clientId) {
        if (confirm('¿Estás seguro de que deseas suspender este cliente?')) {
            const client = this.clients.find(c => c.id === clientId);
            if (client) {
                client.status = 'suspended';
                this.saveClients();
                this.updateStats();
                this.renderClientsTable();
                
                this.showSuccessNotification(`Cliente ${client.name} suspendido`);
            }
        }
    }

    sendWelcomeEmail(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            const subject = `¡Bienvenido a IAWebPro - ${this.getPlanDisplayName(client.plan)}!`;
            const body = this.generateWelcomeEmailBody(client);
            
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${client.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(gmailUrl, '_blank');
            
            this.showSuccessNotification(`Email de bienvenida preparado para ${client.name}`);
        }
    }

    sendActivationEmail(client) {
        const subject = `¡Tu servicio IAWebPro está activo!`;
        const body = this.generateActivationEmailBody(client);
        
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${client.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
    }

    generateWelcomeEmailBody(client) {
        const planFeatures = this.getPlanFeatures(client.plan);
        const planName = this.getPlanDisplayName(client.plan);
        
        return `Hola ${client.name},

¡Bienvenido a IAWebPro! 🚀

Gracias por elegir nuestro plan ${planName}. Estamos emocionados de trabajar contigo.

📋 Tu Plan Incluye:
${planFeatures.map(feature => `✅ ${feature}`).join('\n')}

📞 Próximos Pasos:
1. Confirmaremos el pago de tu transacción
2. Te contactaremos en las próximas 24 horas para iniciar tu proyecto
3. Recibirás acceso a tu panel de cliente personalizado

💰 Detalles de Pago:
- Plan: ${planName}
- Monto: $${client.monthlyAmount}/mes
- Método: ${this.getPaymentMethodName(client.paymentMethod)}
- Próximo pago: ${client.nextPayment}

🔐 Hash de Transacción: ${client.transactionHash || 'Pendiente de confirmación'}

¿Tienes alguna pregunta? Responde a este email o contáctanos directamente.

¡Estamos aquí para hacer crecer tu negocio con IA!

Saludos,
Equipo IAWebPro
u2331310679@gmail.com`;
    }

    generateActivationEmailBody(client) {
        const planName = this.getPlanDisplayName(client.plan);
        const loginUrl = `${window.location.origin}/client-panel.html?id=${client.id}`;
        
        return `¡Hola ${client.name}!

🎉 ¡EXCELENTE NOTICIA! Tu servicio de IAWebPro ya está ACTIVO.

✅ Tu Plan ${planName} está funcionando
✅ Pago confirmado y procesado
✅ Servicios listos para usar

🔑 Accede a tu Panel de Cliente:
${loginUrl}

📱 Próximos pasos inmediatos:
1. Accede a tu panel personalizado
2. Revisa el progreso de tu proyecto
3. Programa tu llamada de onboarding

📧 Tu equipo dedicado te contactará hoy para:
- Configurar los detalles específicos de tu proyecto
- Programar tu sesión de entrenamiento
- Activar todos los servicios incluidos

¿Necesitas ayuda inmediata? ¡Estamos aquí!

¡Bienvenido oficialmente a IAWebPro!

Equipo IAWebPro
u2331310679@gmail.com`;
    }

    getPlanFeatures(plan) {
        const features = {
            'web-autonoma': [
                'Landing Page de 1 página moderna',
                'Chatbot IA: hasta 5 preguntas',
                'Integración básica WhatsApp'
            ],
            'automatico-pro': [
                'Todo del plan anterior',
                'Landing con testimonios y galería',
                'Chatbot: agenda citas y toma pedidos',
                '10 posts redes sociales/mes',
                '2 Emails automáticos',
                'Base datos: hasta 50 clientes'
            ],
            'crecimiento-total': [
                'Todo del plan Pro',
                'Sitio web hasta 5 páginas',
                'Chatbot entrenado específicamente',
                '20 posts + 5 emails mensuales',
                'Seguimiento de leads inteligente',
                'Soporte prioritario',
                '1 hora entrenamiento mensual'
            ]
        };
        return features[plan] || [];
    }

    getPlanDisplayName(plan) {
        const names = {
            'web-autonoma': 'Web Autónoma',
            'automatico-pro': 'Automático Pro',
            'crecimiento-total': 'Crecimiento Total'
        };
        return names[plan] || plan;
    }

    getPaymentMethodName(method) {
        const names = {
            'bitcoin': 'Bitcoin (BTC)',
            'usdc': 'USD Coin (USDC)',
            'binance': 'Binance Pay'
        };
        return names[method] || method;
    }

    showPaymentVerificationModal() {
        document.getElementById('payment-verification-modal').classList.remove('hidden');
    }

    hidePaymentVerificationModal() {
        document.getElementById('payment-verification-modal').classList.add('hidden');
    }

    scanForPayments() {
        const resultsDiv = document.getElementById('payment-results');
        resultsDiv.innerHTML = '<div class="text-center py-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div><p class="mt-2">Escaneando blockchain...</p></div>';
        
        // Simulate blockchain scanning
        setTimeout(() => {
            const mockResults = `
                <div class="space-y-4">
                    <div class="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4">
                        <h4 class="text-green-400 font-semibold mb-2">✅ Pago Confirmado</h4>
                        <p><strong>Cliente:</strong> María García</p>
                        <p><strong>Hash:</strong> bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</p>
                        <p><strong>Monto:</strong> $97 (Automático Pro)</p>
                        <button onclick="adminDashboard.confirmPayment('client_001')" class="mt-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-sm">
                            Activar Cliente
                        </button>
                    </div>
                    
                    <div class="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-4">
                        <h4 class="text-yellow-400 font-semibold mb-2">⏳ Pago Pendiente</h4>
                        <p><strong>Cliente:</strong> Ana López</p>
                        <p><strong>Esperando:</strong> $247 (Crecimiento Total)</p>
                        <p><strong>Método:</strong> Binance Pay</p>
                    </div>
                    
                    <div class="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
                        <h4 class="text-blue-400 font-semibold mb-2">ℹ️ Resumen</h4>
                        <p>• 1 pago confirmado listo para activar</p>
                        <p>• 1 pago pendiente de confirmación</p>
                        <p>• Último escaneo: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            `;
            resultsDiv.innerHTML = mockResults;
        }, 2000);
    }

    confirmPayment(clientId) {
        this.activateClient(clientId);
        this.hidePaymentVerificationModal();
    }

    createActivationTicket(client) {
        const ticket = {
            id: 'ticket_' + Date.now(),
            clientId: client.id,
            type: 'activation',
            priority: 'high',
            status: 'open',
            title: `Activar servicio para ${client.name}`,
            description: `Cliente nuevo con plan ${this.getPlanDisplayName(client.plan)} requiere activación de servicios.`,
            createdAt: new Date().toISOString(),
            assignedTo: 'admin'
        };
        
        this.tickets.push(ticket);
        this.saveTickets();
    }

    filterClients(searchTerm) {
        const rows = document.querySelectorAll('#clients-table-body tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const matches = text.includes(searchTerm.toLowerCase());
            row.style.display = matches ? '' : 'none';
        });
    }

    filterClientsByStatus(status) {
        const rows = document.querySelectorAll('#clients-table-body tr');
        rows.forEach(row => {
            if (!status) {
                row.style.display = '';
                return;
            }
            
            const statusElement = row.querySelector('span');
            const clientStatus = statusElement.textContent.toLowerCase();
            const matches = (status === 'pending' && clientStatus.includes('pendiente')) ||
                           (status === 'active' && clientStatus.includes('activo')) ||
                           (status === 'suspended' && clientStatus.includes('suspendido'));
            row.style.display = matches ? '' : 'none';
        });
    }

    generateReport() {
        const report = {
            date: new Date().toISOString().split('T')[0],
            totalClients: this.clients.length,
            activeClients: this.clients.filter(c => c.status === 'active').length,
            pendingClients: this.clients.filter(c => c.status === 'pending').length,
            monthlyRevenue: this.clients.filter(c => c.status === 'active').reduce((total, c) => total + c.monthlyAmount, 0),
            planDistribution: {
                'web-autonoma': this.clients.filter(c => c.plan === 'web-autonoma').length,
                'automatico-pro': this.clients.filter(c => c.plan === 'automatico-pro').length,
                'crecimiento-total': this.clients.filter(c => c.plan === 'crecimiento-total').length
            }
        };
        
        const reportText = `REPORTE IAWEBPRO - ${report.date}
        
📊 ESTADÍSTICAS GENERALES
• Total de clientes: ${report.totalClients}
• Clientes activos: ${report.activeClients}
• Clientes pendientes: ${report.pendingClients}
• Ingresos mensuales: $${report.monthlyRevenue}

📈 DISTRIBUCIÓN DE PLANES
• Web Autónoma: ${report.planDistribution['web-autonoma']} clientes
• Automático Pro: ${report.planDistribution['automatico-pro']} clientes  
• Crecimiento Total: ${report.planDistribution['crecimiento-total']} clientes

💰 ANÁLISIS DE INGRESOS
• Promedio por cliente: $${Math.round(report.monthlyRevenue / report.activeClients) || 0}
• Ingreso anual proyectado: $${report.monthlyRevenue * 12}`;

        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iawebpro-reporte-${report.date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessNotification('Reporte generado y descargado');
    }

    showEmailModal() {
        const subject = 'Actualización de IAWebPro';
        const body = `Estimado cliente,

Esperamos que estés disfrutando de nuestros servicios de IA.

¿Hay algo específico en lo que podamos ayudarte hoy?

Saludos,
Equipo IAWebPro`;
        
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');
    }

    showSuccessNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    startAutoRefresh() {
        // Auto refresh stats every 30 seconds
        setInterval(() => {
            this.updateStats();
        }, 30000);
    }

    saveClients() {
        localStorage.setItem('iawebpro_clients', JSON.stringify(this.clients));
    }

    saveTickets() {
        localStorage.setItem('iawebpro_tickets', JSON.stringify(this.tickets));
    }
}

// Initialize dashboard
const adminDashboard = new AdminDashboard();
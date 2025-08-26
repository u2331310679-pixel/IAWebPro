// Supabase Configuration
// IMPORTANTE: Reemplaza estas credenciales con las tuyas de Supabase

// 1. Ve a https://supabase.com
// 2. Crea un nuevo proyecto
// 3. Ve a Settings > API
// 4. Copia tu Project URL y anon key

const SUPABASE_URL = 'https://qlhtrekrrzfktikmyojc.supabase.co'; // Tu URL de Supabase
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaHRyZWtycnpma3Rpa215b2pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjA1NjQsImV4cCI6MjA3MTc5NjU2NH0.nIn6L6l_p5rAzLyALRtp5jLs1S3vWb89wxJkGoD0hbs'; // Tu clave API

// Inicializar Supabase
let supabase;

// Función para inicializar Supabase
async function initSupabase() {
    try {
        // Cargar Supabase desde CDN
        if (!window.supabase) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            document.head.appendChild(script);
            
            // Esperar a que se cargue
            await new Promise((resolve) => {
                script.onload = resolve;
            });
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando Supabase:', error);
        return false;
    }
}

// Database Schema SQL para ejecutar en Supabase
const DATABASE_SCHEMA = `
-- Tabla de clientes/leads
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Información personal
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    
    -- Información de calificación
    business_type VARCHAR(100),
    website_goal VARCHAR(100),
    budget VARCHAR(50),
    automation VARCHAR(50),
    additional_message TEXT,
    
    -- Plan y estado
    plan VARCHAR(50), -- 'web-autonoma', 'automatico-pro', 'crecimiento-total'
    status VARCHAR(20) DEFAULT 'lead', -- 'lead', 'pending', 'active', 'suspended'
    monthly_amount DECIMAL(10,2),
    
    -- Fechas importantes
    last_payment DATE,
    next_payment DATE,
    member_since DATE,
    
    -- Información de pago
    payment_method VARCHAR(50),
    transaction_hash VARCHAR(255),
    
    -- Progreso del proyecto
    project_progress INTEGER DEFAULT 0, -- 0-100
    
    -- Notas administrativas
    admin_notes TEXT
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50), -- 'bitcoin', 'usdc', 'binance'
    transaction_hash VARCHAR(255),
    
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    
    -- Información del plan
    plan VARCHAR(50),
    billing_period VARCHAR(20), -- 'monthly', 'yearly'
    
    -- Fechas
    payment_date DATE,
    due_date DATE,
    
    notes TEXT
);

-- Tabla de tickets de soporte
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- 'technical', 'billing', 'feature', 'activation'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    
    assigned_to VARCHAR(255),
    
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de actividad del proyecto
CREATE TABLE IF NOT EXISTS project_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- 'website', 'chatbot', 'marketing', 'general'
    
    completed BOOLEAN DEFAULT FALSE
);

-- Configurar Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- Políticas para admin (puedes ajustar esto según tus necesidades)
-- Por ahora permitimos todas las operaciones (cambiar después con autenticación)
CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON tickets FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON project_activities FOR ALL USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Funciones de utilidad para interactuar con Supabase
class SupabaseService {
    
    // Verificar si Supabase está configurado
    static isConfigured() {
        return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
    }
    
    // Clientes/Leads
    static async createLead(leadData) {
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([{
                    name: leadData.name,
                    email: leadData.email,
                    company: leadData.company,
                    business_type: leadData.businessType,
                    website_goal: leadData.websiteGoal,
                    budget: leadData.budget,
                    automation: leadData.automation,
                    additional_message: leadData.message,
                    status: 'lead'
                }])
                .select()
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating lead:', error);
            return { success: false, error };
        }
    }
    
    static async getClients() {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching clients:', error);
            return { success: false, error };
        }
    }
    
    static async updateClient(clientId, updates) {
        try {
            const { data, error } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', clientId)
                .select()
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating client:', error);
            return { success: false, error };
        }
    }
    
    static async getClientById(clientId) {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', clientId)
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching client:', error);
            return { success: false, error };
        }
    }
    
    // Pagos
    static async createPayment(paymentData) {
        try {
            const { data, error } = await supabase
                .from('payments')
                .insert([paymentData])
                .select()
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating payment:', error);
            return { success: false, error };
        }
    }
    
    static async getPaymentsByClient(clientId) {
        try {
            const { data, error } = await supabase
                .from('payments')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching payments:', error);
            return { success: false, error };
        }
    }
    
    // Tickets
    static async createTicket(ticketData) {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .insert([ticketData])
                .select()
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating ticket:', error);
            return { success: false, error };
        }
    }
    
    static async getTickets() {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select('*, clients(name, email)')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching tickets:', error);
            return { success: false, error };
        }
    }
    
    // Actividades del proyecto
    static async createActivity(activityData) {
        try {
            const { data, error } = await supabase
                .from('project_activities')
                .insert([activityData])
                .select()
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error creating activity:', error);
            return { success: false, error };
        }
    }
    
    static async getClientActivities(clientId) {
        try {
            const { data, error } = await supabase
                .from('project_activities')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error fetching activities:', error);
            return { success: false, error };
        }
    }
    
    // Estadísticas del dashboard
    static async getDashboardStats() {
        try {
            const [clientsResult, paymentsResult, ticketsResult] = await Promise.all([
                supabase.from('clients').select('status'),
                supabase.from('payments').select('amount, status').eq('status', 'confirmed'),
                supabase.from('tickets').select('status')
            ]);
            
            const clients = clientsResult.data || [];
            const payments = paymentsResult.data || [];
            const tickets = ticketsResult.data || [];
            
            const stats = {
                totalClients: clients.length,
                activeClients: clients.filter(c => c.status === 'active').length,
                pendingClients: clients.filter(c => c.status === 'pending').length,
                leads: clients.filter(c => c.status === 'lead').length,
                monthlyRevenue: payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
                openTickets: tickets.filter(t => t.status === 'open').length
            };
            
            return { success: true, data: stats };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return { success: false, error };
        }
    }
}

// Exportar para uso global
window.SupabaseService = SupabaseService;
window.initSupabase = initSupabase;
window.DATABASE_SCHEMA = DATABASE_SCHEMA;
import React, { useState, useEffect } from 'react';
import { ChevronRight, Menu, X, Brain, Code, Database, BarChart, Check } from 'lucide-react';

const IAWebPro = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Auto-rotate hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const heroSlides = [
    {
      title: "Inteligencia Artificial para Emprendedores",
      subtitle: "Soluciones avanzadas de IA para impulsar tu negocio",
      bgClass: "from-blue-600 to-cyan-400"
    },
    {
      title: "Automatización de Procesos",
      subtitle: "Optimiza tus flujos de trabajo con nuestras soluciones de IA",
      bgClass: "from-blue-500 to-cyan-500"
    },
    {
      title: "Análisis Predictivo",
      subtitle: "Anticipa tendencias y comportamientos con IA avanzada",
      bgClass: "from-cyan-500 to-blue-600"
    }
  ];

  const services = [
    {
      title: "Asistentes Virtuales",
      description: "Automatiza tareas repetitivas y mejora la experiencia de tus clientes con asistentes virtuales personalizados.",
      icon: <Brain className="w-12 h-12 text-cyan-400" />
    },
    {
      title: "Desarrollo Web con IA",
      description: "Creamos sitios web inteligentes que aprenden del comportamiento de tus usuarios para mejorar conversiones.",
      icon: <Code className="w-12 h-12 text-blue-500" />
    },
    {
      title: "Análisis de Datos",
      description: "Extrae insights valiosos de tus datos con nuestras herramientas de análisis impulsadas por IA.",
      icon: <Database className="w-12 h-12 text-cyan-500" />
    },
    {
      title: "Marketing Predictivo",
      description: "Anticipa las necesidades de tus clientes y optimiza tus campañas con IA predictiva.",
      icon: <BarChart className="w-12 h-12 text-blue-400" />
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "99€",
      features: [
        "1 Asistente Virtual",
        "Análisis básico de datos",
        "Soporte por email",
        "Actualizaciones mensuales"
      ],
      highlight: false,
      cta: "Comenzar Ahora"
    },
    {
      name: "Business",
      price: "299€",
      features: [
        "3 Asistentes Virtuales",
        "Análisis avanzado de datos",
        "Soporte prioritario",
        "Actualizaciones semanales",
        "Integración con CRM"
      ],
      highlight: true,
      cta: "Potencia Tu Negocio"
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      features: [
        "Asistentes Virtuales ilimitados",
        "Análisis predictivo completo",
        "Soporte 24/7",
        "Actualizaciones en tiempo real",
        "Integración con sistemas existentes",
        "Soluciones a medida"
      ],
      highlight: false,
      cta: "Contactar"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
                style={{
                  backgroundImage: "url('https://i.ibb.co/6BfKPFQ/IAWeb-Pro-logo.png')"
                }}
              ></div>
            </div>
            <span className="ml-2 text-xl font-bold">
              <span className="text-white">IAWeb</span>
              <span className="text-cyan-400">Pro</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#servicios" className="text-gray-300 hover:text-white transition-colors">Servicios</a>
            <a href="#tecnologia" className="text-gray-300 hover:text-white transition-colors">Tecnología</a>
            <a href="#precios" className="text-gray-300 hover:text-white transition-colors">Precios</a>
            <a href="#contacto" className="text-gray-300 hover:text-white transition-colors">Contacto</a>
            <button className="bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity">
              Demo Gratuita
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95 flex flex-col">
          <div className="flex justify-end p-4">
            <button onClick={() => setMenuOpen(false)}>
              <X className="h-6 w-6 text-gray-300" />
            </button>
          </div>
          <nav className="flex flex-col items-center justify-center space-y-8 flex-grow">
            <a href="#servicios" className="text-xl text-gray-300 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>Servicios</a>
            <a href="#tecnologia" className="text-xl text-gray-300 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>Tecnología</a>
            <a href="#precios" className="text-xl text-gray-300 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>Precios</a>
            <a href="#contacto" className="text-xl text-gray-300 hover:text-white transition-colors" onClick={() => setMenuOpen(false)}>Contacto</a>
            <button className="bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity">
              Demo Gratuita
            </button>
          </nav>
        </div>
      )}

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-contain bg-no-repeat bg-center" 
                style={{
                  backgroundImage: "url('https://i.ibb.co/6BfKPFQ/IAWeb-Pro-logo.png')",
                  transform: "scale(2.5)"
                }}
              ></div>
            </div>
          </div>

          {/* Slides */}
          <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
            {heroSlides.map((slide, index) => (
              <div 
                key={index} 
                className={`transition-opacity duration-1000 absolute inset-0 flex flex-col justify-center items-center text-center p-4 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${slide.bgClass} opacity-10 rounded-3xl blur-3xl -z-10`}></div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity">
                    Empezar Ahora
                  </button>
                  <button className="bg-gray-800 bg-opacity-50 border border-gray-700 px-8 py-3 rounded-md font-medium hover:bg-gray-700 transition-colors">
                    Ver Demo
                  </button>
                </div>
              </div>
            ))}
            
            {/* Slide indicators */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
              {heroSlides.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-cyan-400 w-8' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Hero main content height spacer */}
            <div className="h-80 md:h-96"></div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicios" className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 -z-10"></div>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Servicios de IA</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Impulsamos el crecimiento de tu negocio con soluciones de inteligencia artificial de vanguardia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 transition-transform hover:-translate-y-2"
                >
                  <div className="mb-4">{service.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-400">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section id="tecnologia" className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Tecnología de Vanguardia</h2>
                <p className="text-gray-300 mb-8">
                  Nuestra plataforma de IA descentralizada está diseñada para ofrecer soluciones escalables y seguras para empresas de todos los tamaños.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-500 bg-opacity-20 p-1 rounded-full">
                      <Check className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Procesamiento Distribuido</h3>
                      <p className="text-gray-400">Potencia computacional escalable para modelos de IA de alto rendimiento.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-cyan-500 bg-opacity-20 p-1 rounded-full">
                      <Check className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Análisis en Tiempo Real</h3>
                      <p className="text-gray-400">Procesa grandes volúmenes de datos para obtener insights instantáneos.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-400 bg-opacity-20 p-1 rounded-full">
                      <Check className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Aprendizaje Continuo</h3>
                      <p className="text-gray-400">Nuestros modelos mejoran constantemente con cada interacción.</p>
                    </div>
                  </div>
                </div>
                
                <button className="mt-8 bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity inline-flex items-center">
                  Explorar Tecnología
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
              
              <div className="lg:w-1/2 relative">
                <div className="relative aspect-square max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full opacity-10 animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 relative">
                      <div className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage: "url('https://i.ibb.co/6BfKPFQ/IAWeb-Pro-logo.png')"
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precios" className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes y Precios</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Soluciones flexibles adaptadas a las necesidades de tu negocio.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`relative rounded-xl overflow-hidden ${
                    plan.highlight 
                      ? 'border-2 border-cyan-400 transform md:-translate-y-4' 
                      : 'border border-gray-700'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-cyan-400 text-center py-1 text-sm font-medium">
                      Más Popular
                    </div>
                  )}
                  
                  <div className={`p-8 ${plan.highlight ? 'pt-8' : 'pt-6'} bg-gray-800 bg-opacity-50 h-full flex flex-col`}>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.name !== "Enterprise" && <span className="text-gray-400">/mes</span>}
                    </div>
                    
                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      className={`w-full py-3 rounded-md font-medium transition-colors ${
                        plan.highlight
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contacto" className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 -z-10"></div>
          
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 md:p-12">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">¿Listo para Potenciar tu Negocio?</h2>
                <p className="text-gray-300">
                  Contáctanos hoy y descubre cómo la IA puede transformar tu empresa.
                </p>
              </div>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="Tu email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Empresa</label>
                  <input 
                    type="text" 
                    id="company" 
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Mensaje</label>
                  <textarea 
                    id="message" 
                    rows="4"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="¿Cómo podemos ayudarte?"
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <div className="h-12 w-12 relative overflow-hidden">
              <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat" 
                style={{
                  backgroundImage: "url('https://i.ibb.co/6BfKPFQ/IAWeb-Pro-logo.png')"
                }}
              ></div>
            </div>
            <span className="ml-3 text-2xl font-bold">
              <span className="text-white">IAWeb</span>
              <span className="text-cyan-400">Pro</span>
            </span>
          </div>
          
          <div className="text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} IAWebPro. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IAWebPro;
"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Zap, Loader2 } from "lucide-react"

// 🚨 RECUERDA: Verifica que esta URL sea la de tu Apps Script actual
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOuGzQMKPVgnQKqX64KyAEdmBEsJwBPZ4dAybSeGiOiK5QXym9j_CGdpW98YYV2MKI/exec'

// Tus slides antiguos se mantienen como respaldo/secundarios
const slidesEstaticos = [
  {
    id: 4,
    title: "Premios en Efectivo",
    subtitle: "Hoy es la oportunidad de ganar",
    highlight: "premios desde S/.100.00 soles por ¡EVENTO!",
    image: "/efectivo.png",
  },
  {
    id: 3,
    title: "Honda Navi",
    subtitle: "Siguiente Sorteo",
    highlight: "Moto deportiva de alto rendimiento",
    image: "/navi.png",
  },
  {
    id: 2,
    title: "Kia Soluto",
    subtitle: "PROXIMOS SORTEOS",
    highlight: "Vehículo de alto rendimiento",
    image: "/soluto.png",
  },
  {
    id: 1,
    title: "iPhone 17 Pro Max",
    subtitle: "EL FUTURO EN TUS MANOS",
    highlight: "Gana el último modelo de Apple",
    image: "/iphone-17-pro-max-luxury-phone.jpg",
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<any[]>(slidesEstaticos);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // 🧠 CONEXIÓN AL CMS (GESTOR DE EVENTOS)
  // ==========================================
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${APPS_SCRIPT_URL}?accion=getConfig`);
        const json = await res.json();

        if (json.success && json.data) {
          if (json.data.flayerUrl) {

            // 🚨 EL TRUCO DEFINITIVO: Servidor de contenido estático de Google (Seguro HTTPS y sin bloqueos)
            let imageUrl = json.data.flayerUrl;
            if (imageUrl.includes('drive.google.com/file/d/')) {
              const fileId = imageUrl.split('/d/')[1].split('/')[0];
              // Usamos el servidor lh3.googleusercontent que es la forma oficial y rápida para imágenes públicas
              imageUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
            }

            const cmsSlide = {
              id: 999,
              title: json.data.eventoActivo || "GRAN SORTEO OFICIAL",
              subtitle: json.data.estadoEvento === "ACTIVO" ? "🔴 EVENTO EN VIVO" : "⏸️ EVENTO PAUSADO",
              highlight: json.data.promoActiva || `¡Ticket a solo S/ ${json.data.precioTicket}!`,
              image: imageUrl,
            };

            setSlides([cmsSlide, ...slidesEstaticos]);
          }
        }
      } catch (error) {
        console.error("Error conectando al CMS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);
  // Lógica del Slider Automático
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => setCurrent((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  const next = () => setCurrent((curr) => (curr + 1) % slides.length);

  if (loading) {
    return (
      <div className="h-[85vh] w-full bg-slate-950 flex flex-col items-center justify-center text-orange-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black tracking-widest animate-pulse">CARGANDO EVENTO...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-slate-950">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === current ? "opacity-100 scale-100 z-20" : "opacity-0 scale-105 z-10 pointer-events-none"
            }`}
        >
          <div className="absolute inset-0 bg-black/50 z-10"></div>

          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          <div className="relative z-20 h-full flex items-center justify-center text-center px-4 max-w-7xl mx-auto">
            <div className={`space-y-6 transition-all duration-1000 delay-300 ${index === current ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
              }`}
            >
              <div className="inline-block bg-orange-600/20 backdrop-blur-md border border-orange-500/50 text-orange-400 font-black px-6 py-2 rounded-full tracking-widest text-sm uppercase shadow-[0_0_30px_rgba(234,88,12,0.3)]">
                {slide.subtitle}
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">
                {slide.title}
              </h1>
              <p className="text-xl md:text-3xl font-bold text-slate-200 max-w-3xl mx-auto tracking-tight bg-black/40 py-2 px-4 rounded-xl backdrop-blur-sm">
                {slide.highlight}
              </p>

              <div className="pt-8">
                <Link href="/registro">
                  <button className="bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-300 text-white font-black px-12 py-5 rounded-full text-lg flex items-center gap-3 mx-auto shadow-[0_0_20px_rgba(234,88,12,0.4)] active:scale-95 transition-all">
                    <Zap size={20} fill="currentColor" />
                    PARTICIPAR AHORA
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/5 hover:bg-orange-600 border border-white/10 text-white p-4 rounded-2xl transition-all backdrop-blur-md hidden md:block">
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/5 hover:bg-orange-600 border border-white/10 text-white p-4 rounded-2xl transition-all backdrop-blur-md hidden md:block">
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3 bg-black/30 p-3 rounded-full backdrop-blur-sm border border-white/10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-500 ${index === current ? "w-10 bg-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.8)]" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
          />
        ))}
      </div>
    </div>
  )
}
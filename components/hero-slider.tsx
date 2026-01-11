"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Zap } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "iPhone 17 Pro Max",
    subtitle: "EL FUTURO EN TUS MANOS",
    highlight: "Gana el último modelo de Apple",
    image: "/iphone-17-pro-max-luxury-phone.jpg",
  },
  {
    id: 2,
    title: "Kia Soluto",
    subtitle: "PROXIMOS SORTEOS",
    highlight: "Vehículo de alto rendimiento",
    image: "/soluto.png",
  },
  {
    id: 3,
    title: "Honda Navi",
    subtitle: "ADRENALINA PURA",
    highlight: "Moto deportiva de alto rendimiento",
    image: "/navi.png",
  },
  {
    id: 4,
    title: "Premios en Efectivo",
    subtitle: "Es la oportunidad de ganar",
    highlight: "premios desde 100 soles",
    image: "/efectivo.png",
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % slides.length)
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-slate-950 flex items-center justify-center"
      style={{ height: "calc(100vh - 80px)" }}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${index === current ? "opacity-100 scale-100" : "opacity-0 scale-110"
            }`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/40 z-[5]" />

          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="text-center px-4 max-w-4xl">
              <span className="inline-block text-orange-500 font-black tracking-[0.3em] text-xs md:text-sm mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                {slide.subtitle}
              </span>
              <h2 className="text-5xl md:text-8xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {slide.title}
              </h2>
              <p className="text-lg md:text-2xl text-slate-300 mb-8 font-light tracking-wide animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {slide.highlight}
              </p>

              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Link href="/registro">
                  <button className="group relative px-10 py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-500 transition-all text-lg flex items-center gap-3 mx-auto shadow-[0_0_20px_rgba(234,88,12,0.4)] active:scale-95">
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
      <button
        onClick={prev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/5 hover:bg-orange-600 border border-white/10 text-white p-4 rounded-2xl transition-all backdrop-blur-md hidden md:block"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/5 hover:bg-orange-600 border border-white/10 text-white p-4 rounded-2xl transition-all backdrop-blur-md hidden md:block"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      {/* Busca la sección de los Indicators y reemplázala por esta */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${index === current ? "bg-orange-500 w-12" : "bg-white/20 w-6"
              }`}
          />
        ))}
      </div>
    </section>
  )
}
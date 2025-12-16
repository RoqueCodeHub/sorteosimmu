"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "iPhone 17 Pro Max",
    subtitle: "Gana el último modelo de Apple",
    image: "/iphone-17-pro-max-luxury-phone.jpg",
    color: "from-blue-600 to-blue-400",
  },
  {
    id: 2,
    title: "Toyota Land Cruiser",
    subtitle: "Vehículo de lujo garantizado",
    image: "/luxury-car-toyota-land-cruiser.jpg",
    color: "from-red-600 to-red-400",
  },
  {
    id: 3,
    title: "Yamaha MT-09",
    subtitle: "Moto deportiva de alto rendimiento",
    image: "/yamaha-mt-09-sports-motorcycle.jpg",
    color: "from-yellow-600 to-yellow-400",
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % slides.length)
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-black m-0 p-0 flex items-center justify-center"
style={{ height: "calc(100vh - 80px)" }}

    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h2>
              <p className="text-xl md:text-2xl mb-8">{slide.subtitle}</p>
              <button className="px-8 py-3 bg-orange-600 text-white font-bold rounded-full hover:bg-orange-700 transition text-lg">
                PARTICIPAR AHORA
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full transition"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full transition"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === current ? "bg-orange-600 w-8" : "bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  )
}

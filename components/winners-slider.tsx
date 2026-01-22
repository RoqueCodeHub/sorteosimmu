"use client"

import { useState, useEffect } from "react"
import { Trophy, Calendar, Award } from "lucide-react"

const winners = [
  {
    id: 1,
    name: "Juan Carlos Pérez",
    prize: "iPhone 17 Pro Max",
    date: "15 Oct 2025",
    image: "/happy-winner-man.jpg",
  },
  {
    id: 2,
    name: "María González López",
    prize: "Toyota Land Cruiser",
    date: "10 Oct 2025",
    image: "/happy-winner-woman.jpg",
  },
  {
    id: 3,
    name: "Ernesto Pinto Villalta",
    prize: "Yamaha MT-09",
    date: "05 Oct 2025",
    image: "/happy-winner-man-motorcycle.jpg",
  },
  {
    id: 4,
    name: "Ana Rodríguez",
    prize: "iPhone 17 Pro Max",
    date: "01 Oct 2025",
    image: "/happy-winner-woman-phone.jpg",
  },
  {
    id: 5,
    name: "Carlos Sánchez",
    prize: "Toyota Land Cruiser",
    date: "28 Sep 2025",
    image: "/happy-winner-man-car.jpg",
  },
]

export default function WinnersSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % winners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const getVisibleWinners = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      visible.push(winners[(current + i) % winners.length])
    }
    return visible
  }

  return (
    <section id="winners" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Luz de fondo sutil */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-orange-950/20 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Award size={14} /> Testimonios Reales
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
            NUESTROS <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">GANADORES</span>
          </h2>
          <div className="w-24 h-1 bg-orange-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {getVisibleWinners().map((winner) => (
            <div
              key={winner.id}
              className="group relative bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-orange-500/50 hover:shadow-[0_0_50px_rgba(234,88,12,0.1)]"
            >
              {/* Foto del Ganador */}
              <div className="h-64 relative overflow-hidden">
                <img
                  src={winner.image || "/placeholder.svg"}
                  alt={winner.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                {/* Badge de Premio */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-orange-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg w-fit shadow-lg tracking-widest flex items-center gap-2">
                    <Trophy size={12} /> {winner.prize}
                  </div>
                </div>
              </div>

              {/* Info del Ganador */}
              <div className="p-8">
                <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">
                  {winner.name}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <Calendar size={14} className="text-orange-500" />
                  {winner.date}
                </div>
              </div>

              {/* Overlay de brillo */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-gradient-to-tr from-white via-transparent to-transparent transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Indicadores de Barras */}
        <div className="flex justify-center gap-3 mt-12">
          {winners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${index === current ? "bg-orange-500 w-12" : "bg-slate-800 w-6 hover:bg-slate-700"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
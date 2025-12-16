"use client"

import { useState, useEffect } from "react"

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
    name: "Roberto Martínez",
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
    }, 4000)
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
    <section id="winners" className="py-16 md:py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">GANADORES RECIENTES</h2>
        <p className="text-center text-gray-300 mb-12 text-lg">Conoce a nuestros afortunados ganadores</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {getVisibleWinners().map((winner) => (
            <div
              key={winner.id}
              className="bg-gray-900 rounded-lg overflow-hidden border-2 border-orange-600 hover:border-orange-400 transition"
            >
              <div className="h-48 bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center overflow-hidden">
                <img
                  src={winner.image || "/placeholder.svg"}
                  alt={winner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{winner.name}</h3>
                <p className="text-orange-400 font-semibold mb-2">{winner.prize}</p>
                <p className="text-gray-400 text-sm">{winner.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {winners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === current ? "bg-orange-600 w-8" : "bg-gray-600 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

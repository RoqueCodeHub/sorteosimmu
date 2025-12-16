"use client"

import { useState, useEffect } from "react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date("2025-12-31").getTime()
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    {/* Aumentamos la altura de la caja */}
    <div className="bg-orange-600 text-white rounded-lg p-10 md:p-5 min-w-32 md:min-w-1 h-32 md:h-40 flex items-center justify-center">
      {/* Aumentamos el tamaño de la fuente del valor */}
      <span className="text-5xl md:text-6xl font-bold">{String(value).padStart(2, "0")}</span>
    </div>
    {/* Aumentamos el tamaño del texto del label */}
    <p className="text-black font-semibold mt-2 text-xl md:text-2xl">{label}</p>
  </div>
)

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h2 className="text-4xl md:text-5xl font-bold text-center text-black mb-4"> ¡GRAN OPORTUNIDAD! ( SORTEO 31 DICIEMBRE 9pm - FACEBOOK) </h2>
        <p className="text-center text-gray-600 mb-12 text-lg">EL SORTEO EMPIEZA EN:</p>

        <div className="flex justify-center gap-6 md:gap-12 flex-wrap">
          {/* Pasamos el valor y el label a los TimeBox */}
          <TimeBox value={timeLeft.days} label="Días" />
          <TimeBox value={timeLeft.hours} label="Horas" />
          <TimeBox value={timeLeft.minutes} label="Minutos" />
          <TimeBox value={timeLeft.seconds} label="Segundos" />
        </div>
       { /*-----otra vista----*/}
       <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center">
          <p className="text-lg text-gray-700">Tickets disponibles</p>
          <div className="relative w-full max-w-xs h-4 bg-gray-300 rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-green-600 rounded-full"
              style={{
                width: `${(10000 - 3000) / 10000 * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-lg font-semibold text-gray-800 mt-2">
            Sólo <span className="text-orange-600">{10000 - 3000}</span> tickets disponibles
          </p>
          <p className="text-sm text-gray-500">¡Apúrate antes de que se agoten!</p><br></br>
          <div>
          <a className="btn btn-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg py-3 px-6 animate-fade delay-2"
           href="/registro">Adquiere tu Ticket desde aquí</a>
       </div>
        </div>
      </div>
    </div>
    </section>
   
    
  )
}
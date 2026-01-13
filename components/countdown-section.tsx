"use client"

import { useState, useEffect } from "react"
import { Zap, Flame } from "lucide-react"
import Link from "next/link"

/* =========================
   CONFIGURACIÓN DEL EVENTO
   ========================= */
// Fecha fija en CDMX (UTC-6)
const EVENT_DATE_ISO = "2026-01-25T17:00:00-06:00"

/* =========================
   TIPOS
   ========================= */
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

  /* =========================
     CONTADOR
     ========================= */
  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(EVENT_DATE_ISO).getTime()
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  /* =========================
     FECHA FORMATEADA (CDMX)
     ========================= */
  const formattedDate = new Date(EVENT_DATE_ISO)
    .toLocaleString("es-MX", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Mexico_City",
    })
    .toUpperCase()

  /* =========================
     COMPONENTE TIMEBOX
     ========================= */
  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-t from-orange-600 to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
        <div className="relative bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center shadow-2xl">
          <span className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
            {String(value).padStart(2, "0")}
          </span>
        </div>
      </div>
      <p className="text-slate-500 font-bold mt-3 text-xs md:text-sm uppercase tracking-[0.2em]">
        {label}
      </p>
    </div>
  )

  /* =========================
     RENDER
     ========================= */
  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-600/5 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            <Flame size={14} className="animate-pulse" />
            Sorteo en Vivo por Facebook
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase">
            ¡GRAN OPORTUNIDAD! <span className="text-orange-500 font-bold">Participa y gana dinero en efectivo ESTE </span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">
              {formattedDate}
            </span>
          </h2>
        </div>

        {/* Contador */}
        <div className="flex justify-center gap-3 sm:gap-4 md:gap-8 mb-16">
          <TimeBox value={timeLeft.days} label="Días" />
          <TimeBox value={timeLeft.hours} label="Horas" />
          <TimeBox value={timeLeft.minutes} label="Min" />
          <TimeBox value={timeLeft.seconds} label="Seg" />
        </div>

        {/* Barra de progreso */}
        <div className="max-w-md mx-auto bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-sm">
          <div className="space-y-6 text-center">
            <div className="flex justify-between items-end">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Tickets Vendidos
              </span>
              <span className="text-orange-500 font-black text-xl">70%</span>
            </div>

            <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000"
                style={{ width: "70%" }}
              />
            </div>

            <p className="text-slate-300 font-medium">
              Sólo quedan{" "}
              <span className="text-white font-black text-lg">893</span>{" "}
              tickets disponibles de 2200
            </p>

            <Link href="/registro"
              className="group relative inline-flex items-center justify-center w-full"
            >
              <div className="absolute -inset-1 bg-orange-600 rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition"></div>
              <button className="relative w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95">
                <Zap size={18} fill="currentColor" />
                ADQUIERE TU TICKET AQUÍ
              </button>
            </Link>

            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              ¡No te quedes fuera del sorteo del año!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

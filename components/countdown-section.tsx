"use client"

import { useState, useEffect } from "react"
import { Zap, Flame, Target } from "lucide-react"
import Link from "next/link"

const EVENT_DATE_ISO = "2026-03-08T17:00:00-06:00"
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwXFAccoOYfIDu4GBVyVcXpHfnkBxAhnX-05u9Xqx4MU9zD1i3qPjUlpqNALmHCwNUI/exec'

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

export default function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Estados para el CMS
  const [metaTickets, setMetaTickets] = useState(5000); // Default
  const [ticketsVendidos, setTicketsVendidos] = useState(1240); // 💡 Aquí luego podemos inyectar las ventas reales, por ahora es ilustrativo
  const [eventoActivo, setEventoActivo] = useState("Sorteo Principal");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${APPS_SCRIPT_URL}?accion=getConfig`);
        const json = await res.json();
        if (json.success && json.data) {
          setMetaTickets(parseInt(json.data.metaTickets) || 5000);
          setEventoActivo(json.data.eventoActivo);
        }
      } catch (error) {
        console.error("Error cargando CMS:", error);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(EVENT_DATE_ISO).getTime() - new Date().getTime()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }
    const timer = setInterval(calculateTimeLeft, 1000)
    calculateTimeLeft()
    return () => clearInterval(timer)
  }, [])

  // Cálculo de la barra de progreso
  const porcentaje = Math.min(Math.round((ticketsVendidos / metaTickets) * 100), 100);

  return (
    <section className="relative py-20 bg-slate-950 border-t border-slate-900 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-orange-600 to-transparent opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* IZQUIERDA: Contador */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-600/10 text-orange-500 font-black px-4 py-2 rounded-full tracking-widest text-sm uppercase border border-orange-500/20">
              <Flame size={16} /> CIERRE DE VENTAS
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-tight">
              EL TIEMPO SE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">AGOTA</span>
            </h2>

            <div className="flex gap-4 justify-center lg:justify-start">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-orange-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="text-3xl md:text-4xl font-black text-white z-10 font-mono">
                      {value.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-3">
                    {unit === 'days' ? 'Días' : unit === 'hours' ? 'Horas' : unit === 'minutes' ? 'Min.' : 'Seg.'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DERECHA: Barra de Meta (CONECTADA AL CMS) */}
          <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Target className="text-orange-500" />
                META: {eventoActivo}
              </h3>
              <span className="text-orange-500 font-black text-xl">{porcentaje}%</span>
            </div>

            <div className="relative w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-4 shadow-inner">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 transition-all duration-1000 relative"
                style={{ width: `${porcentaje}%` }}
              >
                {/* Brillo en la barra */}
                <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-sm"></div>
              </div>
            </div>

            <p className="text-slate-400 font-medium mb-8 text-sm">
              Faltan <span className="text-white font-black text-lg">{metaTickets - ticketsVendidos}</span> tickets para llegar a la meta de <span className="text-orange-400 font-bold">{metaTickets}</span>.
            </p>

            <Link href="/registro" className="group relative inline-flex items-center justify-center w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-300"></div>
              <button className="relative w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 text-lg uppercase tracking-wider">
                <Zap size={20} className="text-orange-500" />
                COMPRAR TICKETS AHORA
              </button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
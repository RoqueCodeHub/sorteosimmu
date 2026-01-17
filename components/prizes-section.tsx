"use client"

import Link from "next/link"
import { Trophy, Ticket } from "lucide-react"

export default function EventosRecientesSection() {
  const eventos = [
    {
      id: 1,
      titulo: "CHAPA TU EFECTIVO ESTE 25 DE ENERO",
      imagen: "/sorteoantiguo1.png?v=1",
      edicion: "Billetazo, 25 de Enero",
      precio: "TICKET = 5 SOLES",
      slug: "chapa-tu-efectivo",
      color: "from-orange-600 to-orange-400"
    },
    {
      id: 2,
      titulo: "CHAPA TU MOTO",
      imagen: "/sorteo2.png?v=1",
      edicion: "pronto, Motos y Billetazo",
      precio: "TICKET = 10 SOLES",
      slug: "chapa-tu-moto",
      color: "from-orange-700 to-orange-500"
    },
  ]

  return (
    <section id="eventos" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Decoración de fondo sutil */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Trophy size={14} /> Grandes Premios
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-center tracking-tighter uppercase italic">
            Eventos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">Recientes</span>
          </h2>
          <div className="w-24 h-1 bg-orange-600 mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {eventos.map((evento) => (
            <Link key={evento.id} href="/registro" className="group">
              <div className="relative flex flex-col bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-orange-500/50 hover:shadow-[0_0_40px_rgba(234,88,12,0.15)] group-hover:-translate-y-2">

                {/* Contenedor de Imagen con Overlay al hacer Hover */}
                <div className="relative w-full overflow-hidden">
                  <img
                    src={evento.imagen}
                    alt={evento.titulo}
                    className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>

                  {/* Etiqueta flotante superior */}
                  <div className="absolute top-6 left-6">
                    <span className="bg-orange-600 text-white font-black text-[10px] uppercase px-4 py-1.5 rounded-full shadow-lg tracking-widest">
                      {evento.edicion}
                    </span>
                  </div>
                </div>

                {/* Info inferior */}
                <div className="p-8 flex items-center justify-between bg-slate-900">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                      {evento.titulo}
                    </h3>
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                      <Ticket size={16} />
                      {evento.precio}
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12">
                    <Trophy size={24} />
                  </div>
                </div>

                {/* Efecto de brillo al pasar el mouse */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-gradient-to-tr from-white via-transparent to-transparent transition-opacity duration-500"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
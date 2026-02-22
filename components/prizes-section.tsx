"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Trophy, Ticket, Lock, Tag, Sparkles } from "lucide-react"

// TU ENLACE DEL SCRIPT
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOuGzQMKPVgnQKqX64KyAEdmBEsJwBPZ4dAybSeGiOiK5QXym9j_CGdpW98YYV2MKI/exec";

interface EventConfig {
  eventoActivo: string;
  precioTicket: string;
  metaTickets: string;
  promoActiva: string;
  flayerUrl: string;
  estadoEvento: string;
}

// Tus eventos anteriores para usar como adorno
const eventosAdorno = [
  {
    id: 1,
    titulo: "CHAPA TU BILLETE + 1 MOTO",
    imagen: "/sorteoantiguo1.png?v=1",
  },
  {
    id: 2,
    titulo: "CHAPA TU MOTO",
    imagen: "/sorteo2.png?v=1",
  },
];

export default function EventosRecientesSection() {
  const [evento, setEvento] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para renderizar el Flyer de Google Drive
  const obtenerUrlDirecta = (url: string | undefined) => {
    if (!url) return "";
    const match = url.match(/\/d\/(.+?)\//);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
    return url;
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${APPS_SCRIPT_URL}?accion=getConfig`);
        const json = await res.json();
        if (json.success && json.data) {
          setEvento(json.data);
        }
      } catch (error) {
        console.error("Error al cargar el evento activo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  return (
    <section id="eventos" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-orange-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Encabezado */}
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Trophy size={14} /> Vitrina de Sorteos
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-center tracking-tighter uppercase italic">
            Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">Eventos</span>
          </h2>
          <div className="w-24 h-1 bg-orange-600 mt-4 rounded-full"></div>
        </div>

        {loading ? (
          // Estado de carga
          <div className="flex flex-col items-center justify-center py-20 text-orange-500">
            <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="font-bold tracking-widest uppercase text-sm mt-4 text-slate-400">Cargando Vitrina...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* 1. TARJETA DEL EVENTO ACTIVO (Desde el CMS) */}
            {evento && evento.estadoEvento === "ACTIVO" ? (
              <Link href="/registro" className="group relative block w-full transform transition-all duration-500 hover:-translate-y-2 z-20">

                {/* Etiqueta superior */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase shadow-[0_0_20px_rgba(234,88,12,0.5)] z-30 flex items-center gap-2 border border-orange-400/50">
                  <Sparkles size={14} /> Sorteo Activo
                </div>

                <div className="relative flex flex-col h-full bg-slate-900 border-2 border-orange-500/50 rounded-[2.5rem] overflow-hidden shadow-[0_0_30px_rgba(234,88,12,0.15)] group-hover:shadow-[0_0_50px_rgba(234,88,12,0.3)]">

                  {/* Imagen del evento activo */}
                  <div className="relative w-full aspect-[4/5] bg-slate-950 flex items-center justify-center overflow-hidden">
                    {evento.flayerUrl ? (
                      <img
                        src={obtenerUrlDirecta(evento.flayerUrl)}
                        alt={evento.eventoActivo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <Trophy size={48} className="opacity-30 text-slate-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90"></div>
                  </div>

                  {/* Detalles del evento (Nombre, Promo, Precio) */}
                  <div className="absolute bottom-0 w-full p-6 flex flex-col gap-3 bg-slate-900/80 backdrop-blur-md border-t border-orange-500/30">
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter leading-tight" title={evento.eventoActivo}>
                      {evento.eventoActivo}
                    </h3>

                    {/* Texto de Promoción */}
                    {evento.promoActiva && (
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
                        <Tag size={14} className="fill-emerald-500/20" />
                        <span className="text-xs font-bold uppercase tracking-wider">{evento.promoActiva}</span>
                      </div>
                    )}

                    {/* Precio Formateado */}
                    <div className="mt-2 flex items-center gap-2 text-orange-400 font-black text-lg bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
                      <Ticket size={20} />
                      PRECIO: S/. {evento.precioTicket} SOLES
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              // Si no hay activo, dejamos un espacio vacío o un mensaje genérico
              <div className="flex flex-col items-center justify-center bg-slate-900/30 border border-slate-800 border-dashed rounded-[2.5rem] p-8 text-center min-h-[400px]">
                <Trophy size={40} className="text-slate-600 mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Nuevo Sorteo en preparación</p>
              </div>
            )}

            {/* 2 Y 3. TARJETAS DE ADORNO (Próximamente / Anteriores) */}
            {eventosAdorno.map((item) => (
              <div key={item.id} className="relative block w-full opacity-60 grayscale-[50%] transition-all duration-500 hover:grayscale-0 hover:opacity-80">
                <div className="relative flex flex-col h-full bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden">

                  {/* OVERLAY DE PRÓXIMAMENTE (Candado) */}
                  <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center transition-all">
                    <div className="bg-slate-900 border border-slate-700 p-4 rounded-full mb-4 shadow-xl">
                      <Lock size={32} className="text-slate-400" />
                    </div>
                    <span className="text-white font-black tracking-[0.3em] uppercase text-xl md:text-2xl drop-shadow-lg">
                      Próximamente
                    </span>
                  </div>

                  {/* Imagen de fondo */}
                  <div className="relative w-full aspect-[4/5] bg-slate-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.imagen}
                      alt={item.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Título opaco abajo */}
                  <div className="absolute bottom-0 w-full p-6 bg-slate-900/90 border-t border-slate-800">
                    <h3 className="text-lg font-black text-slate-500 uppercase italic tracking-tighter truncate">
                      {item.titulo}
                    </h3>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </section>
  )
}
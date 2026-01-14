"use client"
import React, { forwardRef } from "react"
import { Trophy, Ticket, User, Star, Sparkles } from "lucide-react"

interface TicketProps {
    nombres?: string
    apellidos?: string
    codigos: string[]
    evento: string
    fechaSorteo: string
}

const TicketCard = forwardRef<HTMLDivElement, TicketProps>((props, ref) => {
    // Detectamos si hay muchos códigos para ajustar el tamaño de fuente
    const esMuchosCodigos = props.codigos.length > 20;

    return (
        /* 1. Quitamos overflow-hidden y usamos h-auto para que el ticket crezca 
           si hay muchos códigos, permitiendo que la captura capture todo el largo. */
        <div ref={ref} className="relative w-[320px] rounded-[1.5rem] border-2 border-orange-500 bg-slate-950 p-4 shadow-2xl h-auto">

            {/* Icono de fondo */}
            <div className="absolute -right-2 -top-2 opacity-10 text-orange-500">
                <Trophy size={80} />
            </div>

            <div className="relative z-10 text-center mb-3 border-b border-slate-800 pb-3">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-500 text-[8px] font-black uppercase tracking-widest mb-1">
                    <Ticket size={10} /> Comprobante Oficial
                </div>
                <h2 className="text-lg font-black text-white italic uppercase leading-none">
                    TICKET DE <span className="text-orange-500">SUERTE</span>
                </h2>
                <p className="text-[9px] text-orange-400 font-bold mt-1 flex items-center justify-center gap-1">
                    <Sparkles size={10} /> ¡Felicidades por tu registro!
                </p>
            </div>

            <div className="relative z-10 space-y-2 mb-3">
                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                    <User className="text-orange-500" size={14} />
                    <div className="text-left overflow-hidden">
                        <p className="text-[7px] text-slate-500 font-black uppercase leading-none mb-1">Participante</p>
                        <p className="text-white font-bold text-[10px] sm:text-[11px] uppercase leading-tight truncate w-[210px] tracking-tight">
                            {props.nombres && props.apellidos
                                ? `${props.nombres} ${props.apellidos}`
                                : "CARGANDO..."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                    <Star className="text-orange-500" size={14} />
                    <div className="text-left">
                        <p className="text-[7px] text-slate-500 font-black uppercase leading-none mb-1">Sorteo Destinado</p>
                        <p className="text-white font-bold text-[11px] uppercase leading-none tracking-tight">
                            {props.evento || "SORTEO GENERAL"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 bg-orange-600 p-3 rounded-xl text-center">
                <h3 className="text-[8px] text-orange-200 font-black uppercase mb-1 italic">Tus Números de la Suerte</h3>

                {/* AJUSTE PARA LA DESCARGA:
                    - Cambiamos 'tracking-widest' por 'tracking-normal' o 'tight' si hay muchos códigos.
                    - El tamaño de fuente baja a 'text-xs' solo si sobrepasa los 20 números.
                    - Usamos gap-1 para que respiren sin amontonarse.
                */}
                <div className={`bg-white text-slate-950 py-2 px-2 rounded-lg font-black uppercase mb-1 flex flex-wrap justify-center gap-x-2 gap-y-1 
                    ${esMuchosCodigos ? 'text-[11px] tracking-tight leading-tight' : 'text-lg tracking-normal'}
                `}>
                    {props.codigos && props.codigos.length > 0
                        ? props.codigos.map((cod, i) => (
                            <span key={i} className="whitespace-nowrap">
                                {cod}{i !== props.codigos.length - 1 ? " -" : ""}
                            </span>
                        ))
                        : "PROCESANDO..."}
                </div>

                <p className="text-[7px] text-orange-100 font-black leading-tight px-1 uppercase italic mt-1">
                    {props.codigos.length > 0
                        ? `¡TIENES ${props.codigos.length} OPORTUNIDADES PARA GANAR!`
                        : "Revisa tu bandeja de entrada o SPAM."}
                </p>
            </div>

            <div className="relative z-10 flex justify-between w-full text-[7px] font-black uppercase text-slate-500 mt-3 pt-2 border-t border-slate-800 italic">
                <span>GanaConmigoYa!</span>
                <span className="text-white">{props.fechaSorteo}</span>
            </div>
        </div>
    )
})

TicketCard.displayName = "TicketCard"
export default TicketCard
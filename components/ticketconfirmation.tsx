//ticket confirmation

"use client"
import React, { forwardRef } from "react"
import { Trophy, Ticket, Star, Sparkles } from "lucide-react"

interface TicketProps {
    codigos: string[]
    evento: string
    fechaSorteo: string
}

const TicketCard = forwardRef<HTMLDivElement, TicketProps>((props, ref) => {
    return (
        <div ref={ref} className="relative w-[320px] overflow-hidden rounded-[1.5rem] border-2 border-orange-500 bg-slate-950 p-4 shadow-2xl">
            {/* Icono de fondo más pequeño */}
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

            {/* Solo mostramos el Sorteo Destinado */}

            <div className="relative z-10 bg-orange-600 p-3 rounded-xl text-center">
                <h3 className="text-[8px] text-orange-200 font-black uppercase mb-1 italic">Estado de Números</h3>
                <div className="bg-white text-slate-950 py-1.5 rounded-lg font-black text-lg tracking-widest uppercase mb-1">
                    {props.codigos[0]}
                </div>
                <p className="text-[7px] text-orange-100 font-medium leading-tight px-1 uppercase italic">
                    Verifica tu bandeja de entrada o <span className="font-black underline">SPAM</span>.
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
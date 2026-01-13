"use client"
import { CheckCircle2, X, Sparkles } from "lucide-react"
import TicketCard from "./ticketconfirmation"

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    data: {
        codigos: string[]
        evento: string
        fechaSorteo: string
    }
}

export default function ConfirmationModal({ isOpen, onClose, data }: ConfirmationModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm">
            {/* max-w-sm para que sea más estrecho y alto controlado */}
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95">

                {/* Botón X Superior (Única forma de cerrar ahora) */}
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-500 hover:text-white z-[110] p-1">
                    <X size={20} />
                </button>

                <div className="p-5 flex flex-col items-center">
                    <div className="text-center mb-3">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 text-green-500 mb-2">
                            <CheckCircle2 size={24} />
                        </div>
                        <h2 className="text-lg font-black text-white uppercase italic leading-none">¡SOLICITUD ENVIADA!</h2>
                    </div>

                    {/* Caja de ID más compacta */}
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 mb-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-orange-400 mb-0.5">
                            <Sparkles size={12} />
                            <span className="text-[8px] font-bold uppercase tracking-widest italic">¡Mucha suerte!</span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono flex flex-col">
                            <span>ID DE COMPRA:</span>
                            <span className="text-orange-500 font-bold break-all leading-tight">{data.codigos[0]}</span>
                        </p>
                    </div>

                    {/* Ticket Card */}
                    <TicketCard
                        codigos={["VALIDANDO..."]}
                        evento={data.evento}
                        fechaSorteo={data.fechaSorteo}
                    />

                    <p className="text-slate-500 text-[8px] uppercase font-bold mt-4 italic text-center">
                        Captura esta pantalla para tu control.
                    </p>
                </div>
                {/* Barra decorativa más delgada */}
                <div className="h-1 bg-orange-500"></div>
            </div>
        </div>
    )
}
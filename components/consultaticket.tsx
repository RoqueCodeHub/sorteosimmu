'use client'

import { useState, useRef } from 'react'
import * as htmlToImage from 'html-to-image'
import jsPDF from 'jspdf'
import TicketCard from '@/components/ticketconfirmation'
import { Search, Download, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'

interface Resultado {
  nombres: string
  apellidos: string
  codigos: string[]
  evento?: string
  fechaSorteo?: string
}

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzFfXsK3350S5C9jCeVVqHXZiphA9YFeFbwPDKY5BjmwmyQ-yrfcWqBBSXdNgTbYoJaEA/exec'

export default function ConsultarCodigo() {
  const [documento, setDocumento] = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  const ticketRef = useRef<HTMLDivElement>(null)

  const buscarCodigo = async () => {
    if (!documento.trim()) {
      setError('Por favor, ingrese su DNI o CE')
      return
    }
    setLoading(true)
    setError('')
    setResultado(null)

    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?accion=buscar&documento=${encodeURIComponent(documento.trim())}`)
      const data = await response.json()
      if (!data.success) {
        setError(data.message || 'No se encontraron códigos registrados.')
      } else {
        setResultado(data.data)
      }
    } catch {
      setError('Error de conexión con el servidor oficial.')
    } finally {
      setLoading(false)
    }
  }

  const descargarPDF = async () => {
    if (!ticketRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await htmlToImage.toPng(ticketRef.current, { quality: 1, pixelRatio: 3 })
      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.addImage(dataUrl, 'PNG', 40, 20, 130, 140)
      pdf.save(`Ticket-${documento}.pdf`)
    } catch (err) {
      alert('Error al generar el archivo digital.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section className="min-h-screen bg-[#020617] text-white flex flex-col items-center py-16 px-4">
      {/* Header Estilo Captura */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
          <ShieldCheck size={14} className="text-orange-500" /> Verificación Oficial
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8] mb-2">
          CONSULTA TU <br />
          <span className="text-orange-500 italic">TICKET</span>
        </h1>
      </div>

      {/* Buscador Estilo Captura */}
      <div className="w-full max-w-2xl bg-[#0f172a]/40 backdrop-blur-md border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <form onSubmit={(e) => { e.preventDefault(); buscarCodigo(); }} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
            <input
              type="text"
              placeholder="Ingrese DNI o CE registrado"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className="relative w-full pl-16 pr-6 py-6 bg-black border-2 border-slate-800 rounded-[2rem] text-xl font-bold outline-none focus:border-orange-500 transition-all placeholder:text-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !documento.trim()}
            className="w-full bg-[#1e293b] hover:bg-orange-600 text-slate-400 hover:text-white font-black py-6 rounded-[2rem] text-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] border border-slate-700 hover:border-orange-400 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'VERIFICAR MIS CÓDIGOS'}
          </button>
        </form>

        {error && (
          <div className="mt-8 flex items-center gap-4 p-5 bg-red-500/10 border border-red-500/30 rounded-[1.5rem] text-red-400 font-bold animate-pulse">
            <AlertCircle size={24} /> {error}
          </div>
        )}

        {/* Visualización del Ticket - Aquí recuperamos la estética de la imagen */}
        {resultado && (
          <div className="mt-12 space-y-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="w-full pt-8 border-t border-slate-800 text-center">
              <p className="text-orange-500 font-black tracking-widest uppercase text-xs mb-2 italic">¡Tickets Encontrados!</p>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8">
                {resultado.nombres} {resultado.apellidos}
              </h3>
            </div>

            {/* Este contenedor escala el ticket para que se vea grande pero quepa en móviles */}
            {/* Este contenedor escala el ticket para que se vea grande pero quepa en móviles */}
            <div className="scale-90 md:scale-110 lg:scale-125 origin-center py-10">
              <div ref={ticketRef} className="shadow-[0_20px_80px_rgba(0,0,0,0.8)] rounded-[2.5rem] overflow-hidden">
                <TicketCard
                  nombres={resultado.nombres}
                  apellidos={resultado.apellidos}
                  codigos={resultado.codigos}
                  evento={resultado.evento || 'SORTEO MOTO'}
                  fechaSorteo={resultado.fechaSorteo || 'PRÓXIMO DOMINGO'}
                />
              </div>
            </div>
            <button
              onClick={descargarPDF}
              disabled={downloading}
              className="w-full mt-10 bg-white text-black font-black py-6 rounded-[2rem] text-xl flex items-center justify-center gap-3 hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95"
            >
              {downloading ? <Loader2 className="animate-spin" size={24} /> : <><Download size={24} /> DESCARGAR TICKET DIGITAL</>}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
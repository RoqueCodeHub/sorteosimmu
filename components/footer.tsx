"use client"

import { Facebook, Instagram, Music2, MessageCircle, ShieldCheck } from "lucide-react"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 items-center text-center md:text-left">

          {/* LOGO / LEGAL */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white tracking-tighter">
              SORTEOS <span className="text-orange-500">PREMIUM</span>
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              IMPORT&apos;s & Multiservices MC E.I.R.L. <br />
              RUC: 20612345678 (Ejemplo) <br />
              Comprometidos con la transparencia y la emoción en cada sorteo oficial.
            </p>
          </div>

          {/* REDES SOCIALES */}
          <div className="flex flex-col items-center space-y-4">
            <p className="text-white font-bold uppercase tracking-widest text-xs">Siguenos en vivo</p>
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/immuganaya" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/immuganaya?igsh=MTJlN3V0emE3bDNo&utm_source=ig_contact_invite" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://www.tiktok.com/@corporaciontigosac?_r=1&_t=ZS-92wgAwXbKEu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all" aria-label="TikTok">
                <Music2 size={20} />
              </a>
              <a href="https://wa.me/51983379056" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-all" aria-label="WhatsApp">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* SEGURIDAD */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-xl text-green-500 text-xs font-bold uppercase">
              <ShieldCheck size={16} /> Transacción Protegida
            </div>
            <div className="flex gap-3 grayscale opacity-50 group hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {/* Iconos de tarjetas o logos de Yape/Plin pequeños */}
              <span className="text-[10px] text-slate-600 font-bold uppercase">Yape / Plin / Transferencias</span>
            </div>
          </div>

        </div>

        {/* PIE DE PÁGINA FINAL */}
        <div className="border-t border-slate-900 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-[11px] font-medium text-center md:text-left uppercase tracking-widest">
              © {year} Sorteos Premium IMPORT&apos;s & Multiservices MC E.I.R.L. Todos los derechos reservados.
            </p>

            <nav className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Soporte</a>
            </nav>
          </div>
        </div>

      </div>
    </footer>
  )
}
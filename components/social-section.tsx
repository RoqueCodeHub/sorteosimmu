"use client"

import { Facebook, Instagram, MessageCircle, Music2, Mail, Phone } from "lucide-react"

export default function SocialSection() {
  const socials = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://www.facebook.com/immuganaya",
      color: "hover:bg-blue-600",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/immuganaya?igsh=MTJlN3V0emE3bDNo&utm_source=ig_contact_invite",
      color: "hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-600",
    },
    {
      name: "TikTok",
      icon: Music2,
      url: "https://vm.tiktok.com/ZMDBdPg4y/",
      color: "hover:bg-slate-800",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: "https://wa.me/51983379056",
      color: "hover:bg-green-600",
    },
  ]

  return (
    <section id="contact" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Glow decorativo de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
            ÚNETE A NUESTRA <span className="text-orange-500">COMUNIDAD</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            No te pierdas los sorteos en vivo, resultados y fotos de nuestros ganadores.
          </p>
        </div>

        {/* Iconos de Redes Sociales */}
        <div className="flex justify-center gap-6 md:gap-10 flex-wrap mb-20">
          {socials.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative p-6 bg-slate-900 border border-slate-800 rounded-3xl transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${social.color}`}
                aria-label={social.name}
              >
                <Icon size={40} className="text-white transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  {social.name}
                </span>
              </a>
            )
          })}
        </div>

        {/* Bloque de Contacto Directo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex items-center gap-6 group hover:border-orange-500/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Escríbenos</p>
              <p className="text-xl font-bold text-white">immuganaya@gmail</p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex items-center gap-6 group hover:border-orange-500/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <Phone size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Llámanos</p>
              <p className="text-xl font-bold text-white">+51 983 379 056</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
"use client"

import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react"

export default function SocialSection() {
  const socials = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "#",
      color: "hover:text-blue-600",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "#",
      color: "hover:text-pink-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: "#",
      color: "hover:text-blue-400",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "#",
      color: "hover:text-blue-700",
    },
  ]

  return (
    <section id="contact" className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-black mb-4">SÍGUENOS EN REDES SOCIALES</h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Mantente actualizado con nuestras últimas noticias y ganadores
        </p>

        <div className="flex justify-center gap-8 flex-wrap">
          {socials.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.name}
                href={social.url}
                className={`p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-110 text-black ${social.color}`}
                aria-label={social.name}
              >
                <Icon size={32} />
              </a>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">¿Preguntas? Contáctanos:</p>
          <p className="text-2xl font-bold text-orange-600">info@sorteos.com</p>
          <p className="text-lg text-black mt-2">+51 999 888 777</p>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // ** Lógica para ocultar el botón flotante en rutas específicas **

  // Función para hacer scroll solo si estamos en la página principal
  const scrollToSection = (sectionId: string) => {
    // Si ya estamos en la página principal
    if (pathname === "/") {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
      setIsOpen(false)
    } else {
      // Si NO estamos en la principal, redirigimos con query
      router.push(`/?scroll=${sectionId}`)
      setIsOpen(false)
    }
  }

  return (
    // Contenedor principal del Header
    <header className="sticky top-0 z-50 bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          
          <div className="flex-shrink-0">
            <h1
              className="text-3xl font-bold text-orange-600 text-center cursor-pointer hover:text-orange-600 transition-colors duration-300"
              onClick={() => scrollToSection("hero")}
            >
              IMMU
            </h1>
            <h3>Ganaconmigo<strong>YA</strong></h3>

          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {/* 🔸 Botones que hacen scroll */}
            <button
              onClick={() => scrollToSection("hero")}
              className="text-black font-semibold hover:text-orange-600 transition"
            >
              Inicio
            </button>

            {/* 🔸 Botones que cambian de página */}
            <Link
              href="/sorteos"
              className="text-black font-semibold hover:text-orange-600 transition"
            >
              Sorteos
            </Link>

            <Link
              href="/registro"
              className="text-black font-semibold hover:text-orange-600 transition"
            >
              Registro
            </Link>

            <button
              onClick={() => scrollToSection("winners")}
              className="text-black font-semibold hover:text-orange-600 transition"
            >
              Ganadores
            </button>

            <button
              onClick={() => scrollToSection("contact")}
              className="text-black font-semibold hover:text-orange-600 transition"
            >
              Contacto
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/registro"
              className="px-6 py-2 bg-orange-600 text-white font-bold rounded-full hover:bg-orange-700 transition"
            >
              PARTICIPA YA
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-black hover:bg-gray-100 rounded-lg transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <button
              onClick={() => scrollToSection("hero")}
              className="block w-full text-left px-4 py-2 text-black font-semibold hover:bg-gray-100 rounded"
            >
              Inicio
            </button>

            <Link
              href="/sorteos"
              onClick={() => setIsOpen(false)}
              className="block w-full text-left px-4 py-2 text-black font-semibold hover:bg-gray-100 rounded"
            >
              Sorteos
            </Link>

            <button
              onClick={() => scrollToSection("prizes")}
              className="block w-full text-left px-4 py-2 text-black font-semibold hover:bg-gray-100 rounded"
            >
              Premios
            </button>

            <Link
              href="/registro"
              onClick={() => setIsOpen(false)}
              className="block w-full text-left px-4 py-2 text-black font-semibold hover:bg-gray-100 rounded"
            >
              Registro
            </Link>

            <Link
              href="/participa"
              onClick={() => setIsOpen(false)}
              className="w-full block text-center mt-4 px-6 py-2 bg-orange-600 text-white font-bold rounded-full hover:bg-orange-700 transition"
            >
              PARTICIPA YA
            </Link>
          </nav>
        )}
      </div>

      
    </header>
  )
}
"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, User, Trophy, Calendar, Home, LogIn } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Efecto para cambiar el estilo al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    if (pathname === "/") {
      const element = document.getElementById(sectionId)
      if (element) {
        const offset = 80 // Altura del header
        const bodyRect = document.body.getBoundingClientRect().top
        const elementRect = element.getBoundingClientRect().top
        const elementPosition = elementRect - bodyRect
        const offsetPosition = elementPosition - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        })
      }
      setIsOpen(false)
    } else {
      router.push(`/?scroll=${sectionId}`)
      setIsOpen(false)
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-2"
          : "bg-slate-950 border-b border-transparent py-4"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo Estilizado */}
          <div
            className="flex flex-col cursor-pointer group"
            onClick={() => scrollToSection("hero")}
          >
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white leading-none">
              IMMU<span className="text-orange-500 group-hover:text-orange-400 transition-colors">.</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-orange-500 transition-colors">
              Ganaconmigo<strong className="text-slate-300">YA</strong>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center bg-slate-900/50 border border-slate-800 px-6 py-2 rounded-full gap-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-sm font-bold text-slate-300 hover:text-orange-500 transition flex items-center gap-2"
            >
              Inicio
            </button>

            <Link
              href="/sorteos"
              className="text-sm font-bold text-slate-300 hover:text-orange-500 transition"
            >
              Sorteos
            </Link>

            <Link
              href="/registro"
              className="text-sm font-bold text-slate-300 hover:text-orange-500 transition"
            >
              Registro
            </Link>

            <button
              onClick={() => scrollToSection("winners")}
              className="text-sm font-bold text-slate-300 hover:text-orange-500 transition"
            >
              Ganadores
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-black rounded-full transition-all shadow-lg shadow-orange-600/20 active:scale-95 uppercase tracking-widest"
            >
              <LogIn size={14} />
              Acceso Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation (Menu Desplegable) */}
        {isOpen && (
          <nav className="md:hidden mt-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <button
              onClick={() => scrollToSection("hero")}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 rounded-2xl transition"
            >
              <Home size={18} className="text-orange-500" /> Inicio
            </button>

            <Link
              href="/sorteos"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 rounded-2xl transition"
            >
              <Calendar size={18} className="text-orange-500" /> Sorteos
            </Link>

            <Link
              href="/registro"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 rounded-2xl transition"
            >
              <User size={18} className="text-orange-500" /> Registro
            </Link>

            <button
              onClick={() => scrollToSection("winners")}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 font-bold hover:bg-slate-800 rounded-2xl transition"
            >
              <Trophy size={18} className="text-orange-500" /> Ganadores
            </button>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-500 transition shadow-lg shadow-orange-600/20"
              >
                <LogIn size={18} /> LOGIN ADMIN
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
// /components/HomeClient.tsx
"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

import HeroSlider from "@/components/hero-slider"
import CountdownSection from "@/components/countdown-section"
import PrizesSection from "@/components/prizes-section"
import WinnersSlider from "@/components/winners-slider"
import ConsultarCodigo from "@/components/consultaticket"

// Componente envoltorio para manejar useSearchParams de forma segura en Next.js
function HomeContent() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const scrollTarget = searchParams.get("scroll")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && scrollTarget) {
      const element = document.getElementById(scrollTarget)
      if (element) {
        setTimeout(() => {
          const headerHeight = 80
          const elementPosition = element.getBoundingClientRect().top + window.scrollY
          window.scrollTo({
            top: elementPosition - headerHeight,
            behavior: "smooth",
          })
        }, 300)
      }
    }
  }, [mounted, scrollTarget])

  if (!mounted) return null

  return (
    // CAMBIO CLAVE: bg-slate-950 para eliminar el fondo blanco entre secciones
    <main className="min-h-screen bg-slate-950">
      <HeroSlider />

      {/* Sección del Contador */}
      <div id="sorteo">
        <CountdownSection />
      </div>

      {/* Sección de Premios */}
      <div id="premios">
        <PrizesSection />
      </div>

      {/* Sección de Consulta de Tickets */}
      <div id="consulta">
        <ConsultarCodigo />
      </div>

      {/* Sección de Ganadores */}
      <div id="ganadores">
        <WinnersSlider />
      </div>
    </main>
  )
}

// Exportación principal con Suspense (Requerido por Next.js al usar useSearchParams)
export default function HomeClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <HomeContent />
    </Suspense>
  )
}
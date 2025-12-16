// /components/HomeClient.tsx
// ESTE ARCHIVO CONTIENE EL CÓDIGO QUE ME ENVIASTE

"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

import HeroSlider from "@/components/hero-slider"
import CountdownSection from "@/components/countdown-section"
import PrizesSection from "@/components/prizes-section"
import WinnersSlider from "@/components/winners-slider"
import ConsultarCodigo from "@/components/consultaticket"

export default function HomeClient() { // ¡Cambiamos el nombre de la función!
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const scrollTarget = searchParams.get("scroll")

  // Control de montaje para evitar parpadeos en SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll automático al cargar la página si viene con ?scroll=...
  useEffect(() => {
    if (mounted && scrollTarget) {
      const element = document.getElementById(scrollTarget)
      if (element) {
        // Delay para asegurar que todo el contenido ya esté renderizado
        setTimeout(() => {
          const headerHeight = 80 // altura aproximada del header sticky
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
    <main className="min-h-screen bg-white">
      <HeroSlider />
      <CountdownSection />
      <PrizesSection />
      <ConsultarCodigo />
    { /* <PaymentSection /> {/* Agregado si estaba faltando */}
      <WinnersSlider />
    </main>
  )
}
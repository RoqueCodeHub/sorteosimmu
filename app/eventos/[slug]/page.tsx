// app/eventos/[slug]/page.tsx

import Image from "next/image";
import CountdownSection from "@/components/countdown-section";
import RegistroSection from "@/components/payment-section";

// =========================================================================
// 1. DEFINICIÓN DE INTERFACES (Corrige el error 'Cannot find name EventoPageProps')
// =========================================================================

interface EventoPageProps {
  params: {
    slug: string;
  };
}

// -----------------------------------------------------------------------
// 2. generateStaticParams (EJECUTADO EN EL SERVIDOR DURANTE EL BUILD)
// -----------------------------------------------------------------------

export async function generateStaticParams() {
  const staticSlugs = [
    { slug: 'chapa-tu-fono' },
    { slug: 'chapa-tu-moto' },
  ];

  return staticSlugs;
}

// Mapeamos los slugs a las rutas de imagen (constante definida)
const imagenes: Record<string, string> = {
  "chapa-tu-fono": "/phone17.png",
  "chapa-tu-moto": "/yamaha-mt-09-motorcycle.jpg",
};

// -----------------------------------------------------------------------
// 3. Componente de Página (Sin "use client" para usar generateStaticParams)
// -----------------------------------------------------------------------

export default function EventoPage({ params }: EventoPageProps) {
  // Acceso directo a slug.
  const { slug } = params;

  // 1. Añadimos una VERIFICACIÓN DE SEGURIDAD.
  if (!slug) {
    // Esto debería ser inalcanzable, pero evita crashes de 'undefined'
    return <div className="text-red-500 text-center py-20">Error: Evento no encontrado.</div>;
  }

  // 2. Lógica de mapeo de imágenes
  const imagenEvento = imagenes[slug] || "/phone17.png";

  // 3. Renderizado
  return (
    <main className="min-h-screen bg-white">
      <section className="relative w-full h-[60vh] flex items-center justify-center bg-black">
        {/* 💡 Corregimos el uso de fill, object-cover y priority */}
        <Image
          src={imagenEvento}
          alt={`Imagen del evento ${slug}`}
          fill={true} // fill ahora necesita ser boolean explícito
          className="object-cover opacity-60"
          priority={true} // priority necesita ser boolean explícito
        />
        <h1 className="text-white text-5xl font-bold z-10 capitalize drop-shadow-lg">
          {/* 💡 Reintentamos el replace. La verificación de 'if (!slug)' ya lo protege. */}
          {slug.replace(/-/g, " ")}
        </h1>
      </section>

      {/* 💡 Componentes Cliente (asumiendo que tienen "use client" en su propio archivo) */}
      <CountdownSection />
      <RegistroSection />
    </main>
  );
}
"use client"

import Link from "next/link"

export default function EventosRecientesSection() {
  const eventos = [
    {
      id: 1,
      titulo: "CHAPA TU FONO",
      imagen: "/sorteo1.png",
      edicion: "Primera Edición",
      precio: "TICKET = 10 SOLES",
      slug: "chapa-tu-fono",
    },
    {
      id: 2,
      titulo: "CHAPA TU MOTO",
      imagen: "/sorteo2.png",
      edicion: "Edición Especial",
      precio: "TICKET = 20 SOLES",
      slug: "chapa-tu-moto",
    },
  ]

  return (
    <section id="eventos" className="py-20 bg-orange-100 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-orange-600 drop-shadow-lg">
          Eventos Recientes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {eventos.map((evento) => (
            <Link href={`/eventos/${evento.slug}`} key={evento.id} className="group">
              <div className="relative flex flex-col bg-black rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]">

                {/* Contenedor de Imagen: Mantiene la proporción completa */}
                <div className="relative w-full">
                  <img
                    src={evento.imagen}
                    alt={evento.titulo}
                    className="w-full h-auto block object-contain"
                  />

                  {/* Etiqueta flotante superior */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-400 text-black font-black text-xs uppercase px-3 py-1 rounded-full shadow-md">
                      {evento.edicion}
                    </span>
                  </div>
                </div>

                {/* Barra de precio inferior */}


              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
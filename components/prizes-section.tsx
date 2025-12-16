"use client"

import Link from "next/link"

export default function EventosRecientesSection() {
  const eventos = [
    {
      id: 1,
      titulo: "CHAPA TU FONO",
      subtitulo: "¡No te quedes sin tu Ticket!",
      imagen: "/iphone17.png",
      colorFondo: "from-orange-600 to-orange-500",
      edicion: "Primera Edición",
      precio: "TICKET = 10 SOLES",
      descripcion: "Participa y gana el nuevo iPhone 17 Pro Max",
      slug: "chapa-tu-fono",
    },
    {
      id: 2,
      titulo: "CHAPA TU MOTO",
      subtitulo: "El sorteo se realizará una vez vendido la totalidad de los tickets",
      imagen: "/yamaha-mt-09-sports-motorcycle.jpg",
      colorFondo: "from-orange-600 to-orange-500",
      edicion: "Edición Especial",
      precio: "TICKET = 20 SOLES",
      descripcion: "Gana una moto de alta cilindrada o premios en efectivo",
      slug: "chapa-tu-moto",
    },
  ]

  return (
    <section id="eventos" className="py-20 bg-orange-600 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-300 drop-shadow-lg">
          Eventos Recientes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {eventos.map((evento) => (
            <Link href={`/eventos/${evento.slug}`} key={evento.id}>
              <div
                className={`relative rounded-2xl overflow-hidden shadow-2xl group hover:scale-[1.02] transition-transform cursor-pointer`}
              >
                <div
                  className="h-[350px] bg-cover bg-center flex flex-col justify-between relative"
                  style={{
                    backgroundImage: `url(${evento.imagen})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="relative z-10 flex justify-between items-start p-6">
                    <div className="bg-yellow-400 text-black font-bold text-sm px-3 py-1 rounded-lg shadow-lg">
                      {evento.edicion}
                    </div>
                  </div>

                  

                  <div className="relative z-10 bg-black text-white font-bold text-center py-3 text-xl hover:bg-gray-800 transition-colors">
                    {evento.precio}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

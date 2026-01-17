"use client"

import React from 'react'
import { FileText, ShieldCheck, Scale, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function TerminosYCondiciones() {
  return (
    <section className="py-20 bg-[#020617] relative overflow-hidden min-h-screen">

      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none opacity-50"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">

        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
            <ShieldCheck size={14} /> Documento Legal Oficial
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
            TÉRMINOS Y <br />
            <span className="text-orange-500">CONDICIONES</span>
          </h1>
          <div className="flex items-center justify-center gap-4 mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1"><Calendar size={14} /> 10 ENE 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
            <span className="flex items-center gap-1"><Scale size={14} /> RUC: 20611213175</span>
          </div>
        </div>

        {/* Contenedor del Documento */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-orange-500/20 to-transparent rounded-[2.5rem] blur opacity-25"></div>

          <div className="relative bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-white/10">

            {/* Barra superior */}
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FileText size={12} /> IMMUGANACOMIGOYA_TYC_2026.PDF
              </span>
            </div>

            {/* Contenido del Documento */}
            <div className="p-8 md:p-12 max-h-[70vh] overflow-y-auto text-slate-700 space-y-8 text-sm md:text-base leading-relaxed scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-slate-100 text-justify">

              <div className="text-center border-b border-slate-100 pb-8">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  TÉRMINOS Y CONDICIONES DE USO Y PARTICIPACIÓN
                </h2>
                <p className="text-orange-600 font-bold text-sm tracking-widest mt-1">IMMUGANACOMIGOYA</p>
              </div>

              {/* Sección 1 */}
              <section>
                <h3 className="font-black text-slate-900 uppercase text-sm mb-4 flex items-center gap-2">
                  <span className="text-orange-500">1.</span> Identificación de la Empresa Organizadora
                </h3>
                <p>
                  La presente promoción es organizada por <strong>IMMUGANACOMIGOYA</strong>,
                  marca comercial de <strong>IMPORT'S & Multiservices MC e.i r.l.</strong>,
                  identificada con <strong>RUC 20611213175</strong>, en adelante “el Organizador”.
                </p>
                <p className="mt-2 text-slate-500">
                  La finalidad de la promoción es la difusión, posicionamiento y promoción de
                  los sorteos, productos y servicios importados ofrecidos por el Organizador
                  a través de redes sociales y medios digitales.
                </p>
                <p className="mt-2 text-slate-500 italic">
                  El acceso, registro y participación en cualquier dinámica, sorteo o evento
                  implica la aceptación expresa de los presentes Términos y Condiciones.
                </p>
              </section>


              {/* Sección 2 */}
              <section>
                <h3 className="font-black text-slate-900 uppercase text-sm mb-4 flex items-center gap-2">
                  <span className="text-orange-500">2.</span> Ámbito de Aplicación
                </h3>
                <p>Los presentes Términos y Condiciones regulan todas las relaciones contractuales y promocionales entre el Organizador y los usuarios participantes de la plataforma <strong>www.immuganacomigoya.com</strong>, así como de sus canales oficiales en redes sociales.</p>
              </section>

              {/* Sección 3 */}
              <section>
                <h3 className="font-black text-slate-900 uppercase text-sm mb-4 flex items-center gap-2">
                  <span className="text-orange-500">3.</span> Requisitos de Participación
                </h3>
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="flex items-center gap-2"> <CheckCircle2 size={16} className="text-emerald-500" /> Ser mayor de 18 años al momento de la participación.</p>
                  <p className="flex items-center gap-2"> <CheckCircle2 size={16} className="text-emerald-500" /> Residir en el territorio peruano o en el extranjero.</p>
                  <p className="flex items-center gap-2"> <CheckCircle2 size={16} className="text-emerald-500" /> Proporcionar datos personales veraces, completos y actualizados.</p>
                  <p className="flex items-center gap-2"> <CheckCircle2 size={16} className="text-emerald-500" /> Aceptar íntegramente los presentes Términos y Condiciones.</p>
                </div>
              </section>

              {/* Sección 4 */}
              <section>
                <h3 className="font-black text-slate-900 uppercase text-sm mb-4 flex items-center gap-2">
                  <span className="text-orange-500">4.</span> Mecánica de Participación
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                  <li>La participación se realizará mediante la adquisición de tickets a través de la plataforma web oficial o vía WhatsApp autorizado.</li>
                  <li>Los pagos deberán efectuarse únicamente por los medios habilitados: <strong>Yape, Plin o transferencias bancarias autorizadas.</strong></li>
                  <li>El costo de participación podrá variar según la dinámica, iniciando desde <strong>S/ 5.00 (Cinco y 00/100 soles).</strong></li>
                  <li>Cada participante podrá participar un número ilimitado de veces.</li>
                </ul>
              </section>

              {/* Sección 5 */}
              <section>
                <h3 className="font-black text-slate-900 uppercase text-sm mb-4 flex items-center gap-2">
                  <span className="text-orange-500">5.</span> Transparencia del Sorteo
                </h3>
                <p>En eventos cuyo valor de participación sea superior a S/ 10.00, el sorteo contará con la presencia de un representante público (Abogado o Notario).</p>
                <p className="mt-2">En dinámicas de menor monto, el Organizador podrá realizar el sorteo sin notario, lo cual será informado previamente.</p>
              </section>

              {/* Sección 6 */}
              <section>
                <h3 className="font-black text-slate-900 uppercase text-sm mb-4 flex items-center gap-2">
                  <span className="text-orange-500">6.</span> Plataformas Oficiales
                </h3>
                <div className="flex flex-wrap gap-4 font-bold text-slate-900">
                  <span className="bg-slate-100 px-3 py-1 rounded-md italic">#Facebook</span>
                  <span className="bg-slate-100 px-3 py-1 rounded-md italic">#Instagram</span>
                  <span className="bg-slate-100 px-3 py-1 rounded-md italic">#TikTok</span>
                  <span className="bg-slate-100 px-3 py-1 rounded-md italic">#Whatsapp</span>
                  <span className="bg-slate-100 px-3 py-1 rounded-md italic">#Correo</span>
                </div>
                <p className="mt-3 text-xs text-red-500 font-bold uppercase">Cualquier comunicación fuera de estos canales no será considerada válida.</p>
              </section>

              {/* Sección 7 */}
              <section className="bg-slate-900 text-white p-6 rounded-2xl">
                <h3 className="font-black uppercase text-sm mb-2 text-orange-500">07. Vigencia de la Promoción</h3>
                <p className="text-sm">El registro está habilitado en la plataforma.</p>
                <p className="mt-3 font-black text-lg italic uppercase tracking-tighter">
                  Primer evento: Domingo 25 de Enero de 2026
                </p>
              </section>

              {/* Sección 8 */}
              <section>
                <h3 className="font-black text-slate-900 uppercase text-sm mb-4 flex items-center gap-2">
                  <span className="text-orange-500">8.</span> Premios y Condiciones de Entrega
                </h3>
                <p>• El ganador deberá responder en un plazo máximo de <strong>5 días calendario (240 horas).</strong></p>
                <p>• Los premios son personales e intransferibles.</p>

                <div className="mt-6 space-y-4">
                  <p className="font-bold underline uppercase text-xs">Entrega de premios mayores:</p>
                  <p className="text-sm">En caso de motos, vehículos o inmuebles, la entrega se formalizará mediante escritura pública ante notario. Los gastos notariales en sorteos de inmuebles serán asumidos por el Organizador.</p>

                  <p className="font-bold underline uppercase text-xs">Plazos de entrega:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                      <p className="font-black text-orange-600 uppercase text-[10px]">Puerto Maldonado</p>
                      <p className="text-sm">3 a 10 días hábiles.</p>
                    </div>
                    <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                      <p className="font-black text-orange-600 uppercase text-[10px]">Provincias</p>
                      <p className="text-sm">7 a 15 días hábiles.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sección 9 */}
              <section className="bg-red-50 p-6 rounded-2xl border border-red-100">
                <h3 className="font-black text-red-900 uppercase text-sm mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} /> 09. Descalificaciones
                </h3>
                <p className="text-red-950 font-medium">Queda prohibida la participación de trabajadores o familiares directos del Organizador.</p>
                <p className="mt-2 text-red-800 text-xs italic">Fraude, suplantación o comprobantes duplicados darán lugar a descalificación inmediata sin derecho a reclamo.</p>
              </section>
              {/* Sección 10 */}
<section>
  <h3 className="font-black text-slate-900 uppercase text-sm mb-4 flex items-center gap-2">
    <span className="text-orange-500">10.</span> Modalidad del Sorteo y Validez de Resultados
  </h3>

  <p>
    El sorteo se realizará de manera <strong>presencial y virtual</strong>, pudiendo ser
    transmitido en vivo a través de las plataformas oficiales del Organizador.
  </p>

  <p className="mt-2">
    Los resultados del sorteo serán <strong>válidos, definitivos e inapelables</strong>,
    independientemente de que el participante o ganador se encuentre presente o no
    al momento de su realización.
  </p>

  <p className="mt-2">
    La <strong>ausencia física o virtual, desconexión o inasistencia</strong> del participante
    no invalida ni afecta el derecho a recibir el premio, siempre que cumpla con los
    requisitos establecidos en los presentes Términos y Condiciones.
  </p>

  <p className="mt-2 text-slate-500 italic">
    El Organizador garantiza el respeto y reconocimiento de los ganadores conforme
    a los resultados obtenidos durante el sorteo.
  </p>
</section>


              <p className="text-center font-bold text-xs pt-10 text-slate-400 uppercase tracking-widest">
                Última actualización: 10 de enero de 2026.
              </p>

            </div>
          </div>
        </div>

        {/* Botón de Volver */}
        <div className="mt-12 text-center">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 mx-auto text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.4em] transition-all"
          >
            <span className="text-orange-500 group-hover:-translate-x-2 transition-transform">←</span> Volver al inicio
          </button>
        </div>
      </div>
    </section>
  )
}
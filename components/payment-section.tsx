"use client";

import React, { useState, useEffect, useRef } from "react";
import { QrCode, CreditCard, User, Mail, Phone, MapPin, Ticket, Upload, Trophy } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import { UBIGEO_PERU } from './peru-data';

// 🚨 URL de tu Apps Script actual
const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwXFAccoOYfIDu4GBVyVcXpHfnkBxAhnX-05u9Xqx4MU9zD1i3qPjUlpqNALmHCwNUI/exec";

interface FormData {
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    email: string;
    phone: string;
    evento: string;
    cantidadTickets: number;
    department: string;
    province: string;
    district: string;
    paymentProof: File | null;
}

export default function PaymentSection() {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [registroId, setRegistroId] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ==========================================
    // 🧠 ESTADOS DEL CMS (GESTOR DE EVENTOS)
    // ==========================================

    // 👇 ESTA FUE LA LÍNEA QUE SE BORRÓ Y CAUSABA EL ERROR 👇
    const [precioTicket, setPrecioTicket] = useState(5.00);
    const [nombreEvento, setNombreEvento] = useState("Cargando Evento...");
    const [promoActiva, setPromoActiva] = useState("");

    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        documentType: "DNI",
        documentNumber: "",
        email: "",
        phone: "",
        evento: "",
        cantidadTickets: 1, // Por defecto elige el pack de 1
        department: "",
        province: "",
        district: "",
        paymentProof: null,
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${APPS_SCRIPT_URL}?accion=getConfig`);
                const json = await res.json();
                if (json.success && json.data) {
                    setPrecioTicket(parseFloat(json.data.precioTicket) || 5.00);
                    const eventoActivoCMS = json.data.eventoActivo || "GRAN SORTEO";
                    setNombreEvento(eventoActivoCMS);
                    setPromoActiva(json.data.promoActiva || "");
                    setFormData(prev => ({ ...prev, evento: eventoActivoCMS }));
                }
            } catch (error) {
                console.error("Error cargando CMS en pagos:", error);
            }
        };
        fetchConfig();
    }, []);

    // --- NUEVA LÓGICA DE PRECIOS PROMOCIONALES ---
    const PRECIOS_PACKS: Record<number, number> = {
        1: 5.00,
        3: 10.00,
        7: 21.00,
        11: 30.00,
        20: 50.00
    };
    const cantidadSeleccionada = Number(formData.cantidadTickets) || 1;
    const montoTotal = (PRECIOS_PACKS[cantidadSeleccionada] || (cantidadSeleccionada * precioTicket)).toFixed(2);
    // ----------------------------------------------

    const departamentos = Object.keys(UBIGEO_PERU);
    const provincias = formData.department
        ? Object.keys(UBIGEO_PERU[formData.department as keyof typeof UBIGEO_PERU] || {})
        : [];
    const distritos = (formData.department && formData.province)
        ? UBIGEO_PERU[formData.department as keyof typeof UBIGEO_PERU][formData.province] || []
        : [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "file") {
            const file = (e.target as HTMLInputElement).files?.[0] ?? null;
            setFormData((prev) => ({ ...prev, paymentProof: file }));
        } else {
            if (name === "department") {
                setFormData((prev) => ({ ...prev, department: value, province: "", district: "" }));
            } else if (name === "province") {
                setFormData((prev) => ({ ...prev, province: value, district: "" }));
            } else if (name === "cantidadTickets") {
                setFormData((prev) => ({ ...prev, cantidadTickets: parseInt(value) || 1 }));
            } else {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
        }
    };

    // ==========================================
    // 📤 ENVÍO DEL FORMULARIO Y VALIDACIÓN
    // ==========================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.paymentProof) {
            alert("⚠️ Por favor, sube la captura de tu pago para continuar.");
            return;
        }

        setLoading(true);

        try {
            let base64String = "";
            if (formData.paymentProof) {
                base64String = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(formData.paymentProof as File);
                });
            }

            const payload = {
                evento: formData.evento,
                nombres: formData.firstName,
                apellidos: formData.lastName,
                tipoDocumento: formData.documentType,
                numeroDocumento: formData.documentNumber,
                email: formData.email,
                celular: formData.phone,
                cantidadTickets: formData.cantidadTickets,
                montoTotal: montoTotal,
                departamento: formData.department,
                provincia: formData.province,
                distrito: formData.district,
                comprobanteFileName: formData.paymentProof.name,
                comprobanteBase64: base64String
            };

            const response = await fetch(APPS_SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            // 🚨 SOLUCIÓN APLICADA: Detectar la palabra "exitoso" en el mensaje
            const isSuccess =
                result.success === true ||
                result.success === "true" ||
                (result.message && result.message.toLowerCase().includes("exitoso"));

            if (isSuccess) {
                setRegistroId(result.id || "REGISTRO-EN-PROCESO");
                setShowModal(true); // <--- Abre el modal de éxito correctamente

                // Limpia el formulario parcialmente para evitar doble envío
                setFormData({
                    firstName: "",
                    lastName: "",
                    documentType: "DNI",
                    documentNumber: "",
                    email: "",
                    phone: "",
                    evento: nombreEvento, // Mantenemos el evento cargado de tu panel
                    cantidadTickets: 1,   // Regresa al paquete de 1 ticket por defecto
                    department: "",
                    province: "",
                    district: "",
                    paymentProof: null,
                });
            } else {
                alert("❌ Error al registrar: " + (result.message || "Revisa tus datos e intenta nuevamente."));
            }
        } catch (error) {
            console.error(error);
            alert("🔌 Error de conexión. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="registro" className="py-24 bg-slate-950 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">

                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">
                        Asegura tu <span className="text-orange-500">Participación</span>
                    </h2>
                    <p className="text-slate-400 font-medium">Completa tus datos reales para poder contactarte cuando ganes.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* ==================================================== */}
                    {/* COLUMNA IZQUIERDA: Métodos de Pago (5/12 de ancho)   */}
                    {/* ==================================================== */}
                    <div className="lg:col-span-5 space-y-6">

                        <div className="lg:col-span-5 w-full space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <CreditCard className="text-orange-500" />
                                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Métodos de Pago</h2>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 md:p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                                        <QrCode className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Yape / Plin</h3>
                                        <p className="text-slate-400 text-sm">Escanea el QR para pagar</p>
                                    </div>
                                </div>


                                <div className="bg-white p-4 rounded-3xl max-w-[280px] mx-auto mb-8 shadow-2xl overflow-hidden">
                                    <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 relative">
                                        <img
                                            src="/yape.jpeg?v=1" // Ajusta la ruta a tu imagen real
                                            alt="QR de pago"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-3xl max-w-[280px] mx-auto mb-8 shadow-2xl overflow-hidden">
                                    <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 relative">
                                        <img
                                            src="/plin.jpeg?v=1" // Ajusta la ruta a tu imagen real
                                            alt="QR de pago"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>

                                <div className="text-center space-y-2 py-6 border-t border-slate-800">
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Número de contacto</p>
                                    <p className="text-3xl font-black text-orange-500 tracking-tight">+51 983 379 056</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ==================================================== */}
                    {/* COLUMNA DERECHA: Formulario (7/12 de ancho)          */}
                    {/* ==================================================== */}
                    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* --- SECCIÓN 1: EL SORTEO --- */}
                            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                <h3 className="text-lg font-black text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Trophy size={20} /> 1. Selección de Evento
                                </h3>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
                                    {/* CONTENEDOR DE EVENTO */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            Evento Activo
                                        </label>
                                        <select
                                            name="evento"
                                            required
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-bold outline-none focus:border-orange-500 transition-all cursor-pointer appearance-none"
                                            value={formData.evento || ""}
                                            onChange={handleChange}
                                        >
                                            {/* Opción por defecto mientras carga */}
                                            <option value="" disabled>
                                                ⏳ Cargando evento...
                                            </option>

                                            {/* Opción real que llega desde tu CMS */}
                                            {nombreEvento !== "Cargando Evento..." && (
                                                <option value={nombreEvento}>
                                                    🔥 {nombreEvento}
                                                </option>
                                            )}
                                        </select>
                                    </div>

                                    {/* CONTENEDOR DE PROMOCIONES Y PRECIO */}
                                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="w-full md:w-2/3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                <Ticket size={14} className="text-orange-500" /> Promociones
                                            </label>
                                            <select
                                                name="cantidadTickets"
                                                required
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold outline-none focus:border-orange-500 transition-all cursor-pointer appearance-none"
                                                value={formData.cantidadTickets}
                                                onChange={handleChange}
                                            >
                                                <option value={1}>🎟 01 TICKET ➜ S/ 5.00</option>
                                                <option value={3}>🎟 03 TICKETS ➜ S/ 10.00</option>
                                                <option value={7}>🎟 07 TICKETS ➜ S/ 21.00</option>
                                                <option value={11}>🎟 11 TICKETS ➜ S/ 30.00</option>
                                                <option value={20}>🎟 20 TICKETS ➜ S/ 50.00</option>
                                            </select>
                                        </div>
                                        <div className="w-full md:w-1/3 text-left md:text-right border-t border-slate-800 md:border-none pt-3 md:pt-0">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">
                                                Total a Pagar
                                            </p>
                                            <p className="text-3xl font-black text-emerald-500">
                                                S/ {montoTotal}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {promoActiva && (
                                    <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-center animate-pulse">
                                        <p className="text-xs text-emerald-400 font-black uppercase tracking-widest">
                                            🎁 {promoActiva}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* --- SECCIÓN 2: DATOS PERSONALES --- */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-orange-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                                    <User size={20} /> 2. Datos del Participante
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Nombres</label>
                                        <input type="text" name="firstName" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white" value={formData.firstName} onChange={handleChange} placeholder="Tus nombres" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Apellidos</label>
                                        <input type="text" name="lastName" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white" value={formData.lastName} onChange={handleChange} placeholder="Tus apellidos" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Tipo Documento</label>
                                        <select name="documentType" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white cursor-pointer" value={formData.documentType} onChange={handleChange}>
                                            <option value="DNI">DNI</option>
                                            <option value="Pasaporte">Pasaporte</option>
                                            <option value="Carnet Extranjería">Carnet de Extranjería</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">N° de Documento</label>
                                        <input type="text" name="documentNumber" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white" value={formData.documentNumber} onChange={handleChange} placeholder="Número" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Mail size={14} /> Correo</label>
                                        <input type="email" name="email" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Phone size={14} /> WhatsApp</label>
                                        <input type="tel" name="phone" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white" value={formData.phone} onChange={handleChange} placeholder="999 999 999" />
                                    </div>
                                </div>
                            </div>

                            {/* --- SECCIÓN 3: UBICACIÓN --- */}
                            {/*  <div className="space-y-6">
                                <h3 className="text-lg font-black text-orange-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                                    <MapPin size={20} /> 3. Ubicación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Departamento</label>
                                        <select name="department" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white cursor-pointer" value={formData.department} onChange={handleChange}>
                                            <option value="" disabled>Elegir...</option>
                                            {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Provincia</label>
                                        <select name="province" required disabled={!formData.department} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white cursor-pointer disabled:opacity-50" value={formData.province} onChange={handleChange}>
                                            <option value="" disabled>Elegir...</option>
                                            {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Distrito</label>
                                        <select name="district" required disabled={!formData.province} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white cursor-pointer disabled:opacity-50" value={formData.district} onChange={handleChange}>
                                            <option value="" disabled>Elegir...</option>
                                            {distritos.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>*/}

                            {/* --- SECCIÓN 4: COMPROBANTE --- */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-orange-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2">
                                    <Upload size={20} /> 4. Subir Comprobante
                                </h3>
                                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center bg-slate-950 hover:border-orange-500 transition-colors relative group">
                                    <input type="file" name="paymentProof" accept="image/*" onChange={handleChange} ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                            <QrCode size={28} />
                                        </div>
                                        <div>
                                            {formData.paymentProof ? (
                                                <p className="text-emerald-400 font-bold">✅ Listo: {formData.paymentProof.name}</p>
                                            ) : (
                                                <>
                                                    <p className="font-bold text-white mb-1">Toca aquí para subir tu captura</p>
                                                    <p className="text-xs text-slate-500 uppercase tracking-widest">JPG, PNG</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOTÓN DE ENVÍO */}
                            <button type="submit" disabled={loading} className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-wider shadow-2xl transition-all transform active:scale-95 ${loading ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white"}`}>
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        PROCESANDO REGISTRO...
                                    </span>
                                ) : "REGISTRAR MI PARTICIPACIÓN"}
                            </button>

                        </form>
                    </div>
                </div>
            </div>

            {showModal && (
                <ConfirmationModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    data={{
                        codigos: [registroId || "EN-PROCESO"],
                        evento: nombreEvento,
                        fechaSorteo: "Próximo Sorteo"
                    }}
                />
            )}
        </section>
    );
}
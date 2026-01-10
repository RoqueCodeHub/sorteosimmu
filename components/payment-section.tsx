"use client";

import React, { useState, useRef } from "react";
import { QrCode, CreditCard, User, Mail, Phone, MapPin, Ticket, Upload } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import { UBIGEO_PERU } from './peru-data';

const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwz0JHpYgWmvRaZdCtDfR5DsCVn5WZWpSzZX-VbhMMs35JSUS4FosdOMc4_9HkOXDMbfA/exec";

interface FormData {
    firstName: string;
    lastName: string;
    documentType: "DNI" | "Pasaporte" | "Carnet Extranjería";
    documentNumber: string;
    email: string;
    phone: string;
    evento: "" | "billetazo" | "moto-billetazo";
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

    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        documentType: "DNI",
        documentNumber: "",
        email: "",
        phone: "",
        evento: "",
        cantidadTickets: 1,
        department: "",
        province: "",
        district: "",
        paymentProof: null,
    });

    const departamentos = Object.keys(UBIGEO_PERU);
    const provincias = formData.department
        ? Object.keys(UBIGEO_PERU[formData.department as keyof typeof UBIGEO_PERU] || {})
        : [];
    const distritos = (formData.department && formData.province)
        ? UBIGEO_PERU[formData.department as keyof typeof UBIGEO_PERU][formData.province] || []
        : [];

    const getPrecioUnitario = () => {
        if (formData.evento === "billetazo") return 5;
        if (formData.evento === "moto-billetazo") return 10;
        return 0;
    };

    const precioUnitario = getPrecioUnitario();
    const montoTotal = precioUnitario * formData.cantidadTickets;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "file") {
            const file = (e.target as HTMLInputElement).files?.[0] ?? null;
            setFormData((prev) => ({ ...prev, paymentProof: file }));
        } else {
            if (name === "department") {
                setFormData(prev => ({ ...prev, department: value, province: "", district: "" }));
            } else if (name === "province") {
                setFormData(prev => ({ ...prev, province: value, district: "" }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    [name]: name === "cantidadTickets" ? Number(value) : value,
                }));
            }
        }
    };

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.evento || !formData.paymentProof || !formData.department) {
                return alert("Por favor, completa todos los campos requeridos.");
            }
            const comprobanteBase64 = await fileToBase64(formData.paymentProof);
            const payload = {
                nombres: formData.firstName.trim(),
                apellidos: formData.lastName.trim(),
                tipoDocumento: formData.documentType,
                numeroDocumento: formData.documentNumber.trim(),
                email: formData.email.trim(),
                celular: formData.phone.trim(),
                evento: formData.evento,
                cantidadTickets: formData.cantidadTickets,
                precioUnitario,
                montoTotal,
                departamento: formData.department,
                provincia: formData.province,
                distrito: formData.district,
                comprobanteFileName: formData.paymentProof.name,
                comprobanteBase64,
            };

            const response = await fetch(APPS_SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.status === true || result.success === true) {
                setRegistroId(result.id || "OK");
                setShowModal(true);
                setFormData({
                    firstName: "", lastName: "", documentType: "DNI", documentNumber: "",
                    email: "", phone: "", evento: "", cantidadTickets: 1,
                    department: "", province: "", district: "", paymentProof: null,
                });
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                throw new Error(result.message || "Error al registrar");
            }
        } catch (error: any) {
            alert(error.message || "Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="payment" className="py-16 md:py-24 bg-slate-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase">
                        Participa <span className="text-orange-500">Ahora</span> 🎟️
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Sigue los pasos: realiza tu pago, sube el comprobante y asegura tu lugar en el próximo sorteo.
                    </p>
                </div>

                {/* Contenedor Principal con Grid Corregido */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* COLUMNA IZQUIERDA: Métodos de Pago */}
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
                                        src="/qr-code.png" // Ajusta la ruta a tu imagen real
                                        alt="QR de pago"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>

                            <div className="text-center space-y-2 py-6 border-t border-slate-800">
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Número de contacto</p>
                                <p className="text-3xl font-black text-orange-500 tracking-tight">+51 999 888 777</p>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Formulario */}
                    <div className="lg:col-span-7 w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-3xl overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
                            <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold uppercase text-sm tracking-widest">
                                <User size={18} /> Datos del Participante
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nombres *" required
                                    className="w-full bg-slate-950 px-5 py-4 border border-slate-800 rounded-2xl focus:border-orange-500 outline-none transition-all placeholder:text-slate-600" />
                                <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Apellidos *" required
                                    className="w-full bg-slate-950 px-5 py-4 border border-slate-800 rounded-2xl focus:border-orange-500 outline-none transition-all placeholder:text-slate-600" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <select name="documentType" value={formData.documentType} onChange={handleChange}
                                    className="w-full bg-slate-950 px-5 py-4 border border-slate-800 rounded-2xl focus:border-orange-500 outline-none appearance-none cursor-pointer text-slate-300">
                                    <option value="DNI">DNI</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                    <option value="Carnet Extranjería">C.E.</option>
                                </select>
                                <input name="documentNumber" value={formData.documentNumber} onChange={handleChange} placeholder="N° Documento *" required
                                    className="w-full bg-slate-950 px-5 py-4 border border-slate-800 rounded-2xl focus:border-orange-500 outline-none transition-all placeholder:text-slate-600" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Correo *" required
                                        className="w-full bg-slate-950 pl-12 pr-5 py-4 border border-slate-800 rounded-2xl focus:border-orange-500 outline-none transition-all placeholder:text-slate-600" />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Celular *" required
                                        className="w-full bg-slate-950 pl-12 pr-5 py-4 border border-slate-800 rounded-2xl focus:border-orange-500 outline-none transition-all placeholder:text-slate-600" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                    <MapPin size={16} /> Ubicación de residencia
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <select name="department" value={formData.department} onChange={handleChange} required
                                        className="bg-slate-950 px-3 py-3 border border-slate-800 rounded-xl text-sm outline-none focus:border-orange-500">
                                        <option value="">Dpto.</option>
                                        {departamentos.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                                    </select>
                                    <select name="province" value={formData.province} onChange={handleChange} disabled={!formData.department} required
                                        className="bg-slate-950 px-3 py-3 border border-slate-800 rounded-xl text-sm outline-none focus:border-orange-500 disabled:opacity-30">
                                        <option value="">Prov.</option>
                                        {provincias.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                                    </select>
                                    <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.province} required
                                        className="bg-slate-950 px-3 py-3 border border-slate-800 rounded-xl text-sm outline-none focus:border-orange-500 disabled:opacity-30">
                                        <option value="">Dist.</option>
                                        {distritos.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-8 text-orange-500 font-bold uppercase text-sm tracking-widest">
                                <Ticket size={18} /> Detalles del Sorteo
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <select name="evento" value={formData.evento} onChange={handleChange} required
                                    className="w-full bg-slate-950 px-5 py-4 border border-slate-800 rounded-2xl focus:border-orange-500 outline-none text-orange-500 font-bold">
                                    <option value="">Selecciona Sorteo</option>
                                    <option value="billetazo">💸 Billetazo (S/ 5)</option>
                                    <option value="moto-billetazo">🏍️ Moto (S/ 10)</option>
                                </select>
                                <select name="cantidadTickets" value={formData.cantidadTickets} onChange={handleChange}
                                    className="w-full bg-slate-950 px-5 py-4 border border-slate-800 rounded-2xl focus:border-orange-500 outline-none">
                                    {[1, 2, 3, 4, 5, 10, 20].map(n => <option key={n} value={n}>{n} Ticket{n > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>

                            <div className="relative group">
                                <label className="flex items-center justify-center gap-3 w-full bg-slate-950 border-2 border-dashed border-slate-800 hover:border-orange-500/50 p-6 rounded-2xl cursor-pointer transition-all">
                                    <Upload className="text-slate-500 group-hover:text-orange-500" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-300">
                                            {formData.paymentProof ? formData.paymentProof.name : "Subir Comprobante de Pago"}
                                        </p>
                                        <p className="text-xs text-slate-500">Imagen JPG, PNG (Max. 5MB)</p>
                                    </div>
                                    <input type="file" name="paymentProof" accept="image/*" onChange={handleChange} ref={fileInputRef} required className="hidden" />
                                </label>
                            </div>

                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 text-center shadow-inner">
                                <p className="text-slate-400 text-sm uppercase font-bold mb-1">Total a pagar</p>
                                <p className="text-4xl font-black text-orange-500">S/ {montoTotal.toFixed(2)}</p>
                            </div>

                            <button type="submit" disabled={loading}
                                className={`w-full py-5 rounded-2xl font-black text-lg shadow-2xl transition-all transform active:scale-95 ${loading
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                    : "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/20 hover:shadow-orange-500/40"
                                    }`}>
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        PROCESANDO...
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
                        codigos: [registroId || "PENDIENTE"],
                        evento: formData.evento === "billetazo" ? "GRAN BILLETAZO" : "SORTEO MOTO",
                        fechaSorteo: "Próximo Domingo"
                    }}
                />
            )}
        </section>
    );
}
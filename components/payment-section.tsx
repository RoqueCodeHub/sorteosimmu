"use client";

import React, { useState, useRef } from "react";
import { QrCode, CreditCard } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";
import { UBIGEO_PERU } from './peru-data';

const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxEnQkvBYUqXlkUKcTSclH2O-0L0Odz7i5sF9F5CueaAzQUhPy4NPkYD4LbWm4cjyf6QA/exec";

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
    province: string; // Nuevo
    district: string;  // Nuevo
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

    // ── Lógica de Cascada (Ubigeo) ──
    const departamentos = Object.keys(UBIGEO_PERU);
    const provincias = formData.department
        ? Object.keys(UBIGEO_PERU[formData.department as keyof typeof UBIGEO_PERU] || {})
        : [];
    const distritos = (formData.department && formData.province)
        ? UBIGEO_PERU[formData.department as keyof typeof UBIGEO_PERU][formData.province] || []
        : [];

    // ── Lógica de precios ──
    const getPrecioUnitario = () => {
        if (formData.evento === "billetazo") return 5;
        if (formData.evento === "moto-billetazo") return 10;
        return 0;
    };

    const precioUnitario = getPrecioUnitario();
    const montoTotal = precioUnitario * formData.cantidadTickets;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === "file") {
            const file = (e.target as HTMLInputElement).files?.[0] ?? null;
            setFormData((prev) => ({ ...prev, paymentProof: file }));
        } else {
            // Lógica especial para limpiar cascada al cambiar niveles superiores
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

    const closeModal = () => setShowModal(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.evento) return alert("Selecciona el tipo de sorteo");
            if (!formData.paymentProof) return alert("Sube el comprobante de pago");
            if (!formData.department || !formData.province || !formData.district) {
                return alert("Completa la ubicación (Dpto, Prov, Dist)");
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
            if (result.status === true || result.status === "success" || result.success === true) {
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
        <section id="payment" className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl md:text-5xl font-bold text-center text-black mb-12 uppercase">
                    Participa Ahora 🎟️
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Columna Izquierda: Métodos de pago (Se mantiene igual) */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-black mb-6">Métodos de Pago</h3>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-600 text-white p-3 rounded-lg"><QrCode size={24} /></div>
                                <div>
                                    <h4 className="text-xl font-bold">Pago con Yape / Plin</h4>
                                    <p className="text-gray-600">Escanea y envía el monto exacto</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-6 mb-6 flex items-center justify-center min-h-[180px] border border-gray-200 italic text-gray-400">
                                [Imagen Código QR]
                            </div>
                            <div className="text-center">
                                <p className="font-bold">Número:</p>
                                <p className="text-2xl font-bold text-blue-700">+51 999 888 777</p>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Formulario con Cascada */}
                    <div>
                        <h3 className="text-2xl font-bold text-black mb-8">Completa tus datos</h3>
                        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-2xl shadow-xl">
                            <label className="block font-semibold mb-2">Ingrese su nombre completo *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nombres *" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none" />
                                <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Apellidos *" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none" />
                            </div>

                            <label className="block font-semibold mb-2">Ingrese su documento *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <select name="documentType" value={formData.documentType} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none">
                                    <option value="DNI">DNI</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                    <option value="Carnet Extranjería">Carnet Extranjería</option>
                                </select>
                                <input name="documentNumber" value={formData.documentNumber} onChange={handleChange} placeholder="N° Documento *" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none" />
                            </div>

                            <label className="block font-semibold mb-2">Ingrese su correo y número de teléfono *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Correo *" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none" />
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Celular *" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none" />
                            </div>

                            {/* SELECTS DE UBICACIÓN (CASCADA) */}
                            <label className="block font-semibold mb-2">Dirección *</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-1">DEPARTAMENTO</label>
                                    <select name="department" value={formData.department} onChange={handleChange} required className="w-full px-2 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none">
                                        <option value="">Seleccione...</option>
                                        {departamentos.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-1">PROVINCIA</label>
                                    <select name="province" value={formData.province} onChange={handleChange} disabled={!formData.department} required className="w-full px-2 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none disabled:bg-gray-200">
                                        <option value="">{formData.department ? "Seleccione..." : "---"}</option>
                                        {provincias.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-1">DISTRITO</label>
                                    <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.province} required className="w-full px-2 py-3 border-2 border-gray-300 rounded-lg text-sm outline-none disabled:bg-gray-200">
                                        <option value="">{formData.province ? "Seleccione..." : "---"}</option>
                                        {distritos.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                    </select>
                                </div>
                            </div>

                            <label className="block font-semibold mb-2">Seleccione con cuidado su participacion*</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <select name="evento" value={formData.evento} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none">
                                    <option value="">-- Sorteo --</option>
                                    <option value="billetazo">💸 Billetazo (S/ 5)</option>
                                    <option value="moto-billetazo">🏍️ Moto (S/ 10)</option>
                                </select>
                                <select name="cantidadTickets" value={formData.cantidadTickets} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none">
                                    {[1, 2, 3, 4, 5, 10].map(n => <option key={n} value={n}>{n} Ticket{n > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold mb-2">Comprobante de Pago *</label>
                                <input type="file" name="paymentProof" accept="image/*" onChange={handleChange} ref={fileInputRef} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer" />
                            </div>

                            <div className="border-2 border-orange-400 bg-orange-50 rounded-xl p-4 text-center">
                                <p className="text-3xl font-bold text-orange-700">S/ {montoTotal.toFixed(2)}</p>
                            </div>

                            <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"}`}>
                                {loading ? "PROCESANDO..." : "REGISTRARSE Y PARTICIPAR"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {showModal && <ConfirmationModal id={registroId} onClose={closeModal} />}
        </section>
    );
}
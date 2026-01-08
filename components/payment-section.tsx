"use client";

import React, { useState, useRef } from "react";
import { QrCode, CreditCard } from "lucide-react";
import { ConfirmationModal } from "./ConfirmationModal";

// URL de tu Google Apps Script (¡verifica que esté activa!)
const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxml3D2guUoqnGLsFLcT51h4VdDESjCIfLoGNRw9VVMA9se1vUGCgW772M6rzVf472J/exec";

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
        paymentProof: null,
    });

    // ── Lógica de precios ───────────────────────────────────────
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
            setFormData((prev) => ({
                ...prev,
                [name]: name === "cantidadTickets" ? Number(value) : value,
            }));
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
            // Validaciones básicas
            if (!formData.evento) {
                alert("Por favor selecciona el tipo de sorteo");
                return;
            }
            if (!formData.paymentProof) {
                alert("Sube el comprobante de pago");
                return;
            }
            if (
                !formData.firstName ||
                !formData.lastName ||
                !formData.documentNumber ||
                !formData.email ||
                !formData.phone ||
                !formData.department
            ) {
                alert("Completa todos los campos obligatorios (*)");
                return;
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
                comprobanteFileName: formData.paymentProof.name,
                comprobanteBase64,
            };

            const response = await fetch(APPS_SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(payload),
                // Importante: NO ponemos Content-Type para evitar preflight en Apps Script
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status} del servidor`);
            }

            const result = await response.json();

            const isSuccess =
                result.status === "success" ||
                result.success === true ||
                String(result.message || "").toLowerCase().includes("exitoso");

            if (isSuccess) {
                setRegistroId(result.id || result.registroId || "OK");
                setShowModal(true);

                // Reset form
                setFormData({
                    firstName: "",
                    lastName: "",
                    documentType: "DNI",
                    documentNumber: "",
                    email: "",
                    phone: "",
                    evento: "",
                    cantidadTickets: 1,
                    department: "",
                    paymentProof: null,
                });

                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                throw new Error(result.message || "Error al registrar el pago");
            }
        } catch (error: any) {
            console.error("Error en el envío:", error);
            alert(error.message || "Ocurrió un error inesperado. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="payment" className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl md:text-5xl font-bold text-center text-black mb-12">
                    PARTICIPA AHORA 🎟️
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* ── Columna Izquierda: Métodos de pago ── */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-black mb-6">Métodos de Pago</h3>

                        {/* Yape */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-600 text-white p-3 rounded-lg">
                                    <QrCode size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">Pago con Yape / Plin</h4>
                                    <p className="text-gray-600">Escanea y envía el monto exacto</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 mb-6 flex items-center justify-center min-h-[180px] border border-gray-200">
                                {/* Aquí va tu imagen real del QR */}
                                <p className="text-gray-400 italic">Espacio para código QR de Yape/Plin</p>
                            </div>

                            <div className="text-center">
                                <p className="font-bold mb-1">Número:</p>
                                <p className="text-2xl font-bold text-blue-700">+51 999 888 777</p>
                                <p className="text-sm text-gray-600 mt-1">Sorteos Premium SAC</p>
                            </div>
                        </div>

                        {/* Transferencia */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-purple-600 text-white p-3 rounded-lg">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">Transferencia Bancaria</h4>
                                    <p className="text-gray-600">Cuentas disponibles</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600">BCP</p>
                                    <p className="font-bold">1234 5678 9012 3456</p>
                                    <p className="text-sm text-gray-500">CCI: 002 123 456789012 34</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600">Interbank</p>
                                    <p className="font-bold">9876 5432 1098 7654</p>
                                    <p className="text-sm text-gray-500">CCI: 003 987 654321098 76</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Columna Derecha: Formulario ── */}
                    <div>
                        <h3 className="text-2xl font-bold text-black mb-8">
                            Completa tus datos
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-2xl shadow-xl">
                            {/* Nombres y Apellidos */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-2">Nombres *</label>
                                    <input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Juan Carlos"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">Apellidos *</label>
                                    <input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Pérez García"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Documento */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-2">Tipo de Documento *</label>
                                    <select
                                        name="documentType"
                                        value={formData.documentType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                                        required
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                        <option value="Carnet Extranjería">Carnet Extranjería</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">N° Documento *</label>
                                    <input
                                        name="documentNumber"
                                        value={formData.documentNumber}
                                        onChange={handleChange}
                                        placeholder="12345678"
                                        maxLength={formData.documentType === "DNI" ? 8 : 12}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contacto */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-2">Correo Electrónico *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="ejemplo@correo.com"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">Celular *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="999888777"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={12}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Evento + Cantidad Tickets */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-2">Tipo de Sorteo *</label>
                                    <select
                                        name="evento"
                                        value={formData.evento}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                                        required
                                    >
                                        <option value="">-- Selecciona --</option>
                                        <option value="billetazo">💸 Billetazo Ganador (S/ 5)</option>
                                        <option value="moto-billetazo">🏍️ MotoBilletazo (S/ 10)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2">Cantidad de Tickets *</label>
                                    <select
                                        name="cantidadTickets"
                                        value={formData.cantidadTickets}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                                        required
                                    >
                                        {[...Array(10)].map((_, i) => {
                                            const num = i + 1;
                                            return (
                                                <option key={num} value={num}>
                                                    {num} ticket{num > 1 ? "s" : ""}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>

                            {/* Total a pagar + Departamento + Comprobante */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-2">Departamento *</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none"
                                        required
                                    >
                                        <option value="">Selecciona tu departamento</option>
                                        {/* Lista completa de departamentos de Perú */}
                                        <option value="AMAZONAS">Amazonas</option>
                                        <option value="ANCASH">Áncash</option>
                                        <option value="APURIMAC">Apurímac</option>
                                        <option value="AREQUIPA">Arequipa</option>
                                        {/* ... puedes completar la lista completa ... */}
                                        <option value="LIMA">Lima</option>
                                        <option value="OTROS">Otros</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2">Comprobante de Pago *</label>
                                    <input
                                        type="file"
                                        name="paymentProof"
                                        accept="image/*,application/pdf"
                                        onChange={handleChange}
                                        ref={fileInputRef}
                                        required
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    {formData.paymentProof && (
                                        <p className="text-xs text-green-600 mt-1 truncate">
                                            {formData.paymentProof.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Muestra del monto total */}
                            <div className="border-2 border-orange-400 bg-orange-50 rounded-xl p-5 text-center">
                                <p className="text-lg font-medium text-gray-700">Total a pagar</p>
                                <p className="text-3xl font-bold text-orange-700 mt-1">
                                    S/ {montoTotal.toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {formData.cantidadTickets} × S/ {precioUnitario} c/u
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-md
                  ${loading
                                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                        : "bg-orange-600 hover:bg-orange-700 text-white"
                                    }`}
                            >
                                {loading ? "Enviando..." : "REGISTRARSE Y PARTICIPAR"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {showModal && (
                <ConfirmationModal id={registroId} onClose={closeModal} />
            )}
        </section>
    );
}
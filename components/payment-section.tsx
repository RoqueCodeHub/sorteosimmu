"use client";

import React, { useState, useRef } from "react";
import { QrCode, CreditCard } from "lucide-react"; 
import { ConfirmationModal } from './ConfirmationModal'; 

// =========================================================================
// 🚨 ÚNICO CAMBIO CRÍTICO: URL de Google Apps Script 
// =========================================================================
// ATENCIÓN: Esta URL debe ser la URL de implementación web activa de tu Script.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxml3D2guUoqnGLsFLcT51h4VdDESjCIfLoGNRw9VVMA9se1vUGCgW772M6rzVf472J/exec";

// =========================================================================
// Interfaces y Componente
// =========================================================================

interface FormData {
    firstName: string;
    lastName: string;
    documentType: "DNI" | "Pasaporte" | "Carnet Extranjería";
    documentNumber: string;
    email: string;
    phone: string;
    tickets: string;
    department: string;
    paymentProof: File | null;
}

export default function PaymentSection() {
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); 
    const [registroId, setRegistroId] = useState(''); 

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        documentType: "DNI",
        documentNumber: "",
        email: "",
        phone: "",
        tickets: "1 ticket - S/ 5", 
        department: "",
        paymentProof: null,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement;

        if (type === "file" && "files" in e.target) {
            setFormData((prev) => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).files?.[0] ?? null,
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });

    const closeModal = () => {
        setShowModal(false);
    };

    // ---------------------------------------------------------
    // 🟢 FUNCIÓN DE ENVÍO CORREGIDA (Llama directo al Apps Script)
    // ---------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Validaciones básicas
            if (!formData.paymentProof) {
                alert("Por favor sube el comprobante de pago.");
                setLoading(false);
                return;
            }
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.department || !formData.phone || !formData.documentNumber) {
                alert("Completa todos los campos requeridos (marcados con *).");
                setLoading(false);
                return;
            }

            // 2. Convertir archivo a base64
            const comprobanteBase64 = await fileToBase64(formData.paymentProof as File);

            // 3. Armar payload
            const payload = {
                nombres: formData.firstName,
                apellidos: formData.lastName,
                tipoDocumento: formData.documentType,
                numeroDocumento: formData.documentNumber,
                email: formData.email,
                celular: formData.phone,
                // El slice para tomar solo el número de tickets
                numeroTickets: formData.tickets.includes(" - ") ? formData.tickets.split(" - ")[0] : formData.tickets, 
                departamento: formData.department,
                comprobanteFileName: (formData.paymentProof as File).name,
                comprobanteBase64,
            };

            // 4. Enviar DIRECTO a Google Apps Script
            const resp = await fetch(APPS_SCRIPT_URL, { 
                method: "POST",
                // 🚨 CORRECCIÓN CRÍTICA PARA APPS SCRIPT: 
                // Se ELIMINA el Content-Type para forzar un "Simple Request"
                // y evitar problemas de CORS/Preflight con Apps Script.
                // headers: { "Content-Type": "application/json" }, // <-- ¡ELIMINADA!
                body: JSON.stringify(payload), // El JSON se envía en el body
            });

            if (!resp.ok) {
                const text = await resp.text();
                console.error("Error directo de Google Apps Script (HTTP no 200):", text);
                throw new Error("Error de conexión con el servicio de Google. Revisa el estado de tu Apps Script.");
            }

            const result = await resp.json();
            console.log("Respuesta del Apps Script:", result);

            // -----------------------------------------------------
            // 🛠️ VALIDACIÓN DE ÉXITO (Manejo de respuestas del Apps Script)
            // -----------------------------------------------------
            const isSuccess = 
                result.status === "success" || 
                result.status === true || 
                result.success === true ||
                (result.message && String(result.message).toLowerCase().includes("exitoso")) || // Cambiado de 'correctamente' a 'exitoso' por la respuesta esperada
                (result.message && String(result.message).toLowerCase().includes("correctamente")); // Por si acaso

            if (isSuccess) {
                // ✅ ÉXITO CONFIRMADO
                setRegistroId(result.id || "PENDIENTE"); // Guardar ID
                setShowModal(true); // Abrir Modal

                // Limpiar formulario
                setFormData({
                    firstName: "", 
                    lastName: "", 
                    documentType: "DNI",
                    documentNumber: "",
                    email: "", 
                    phone: "",
                    tickets: "1 ticket - S/ 5", 
                    department: "", 
                    paymentProof: null,
                });
                
                // Limpiar input file visualmente
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                
            } else {
                // ❌ ERROR REAL DEL BACKEND (Si el script respondió OK pero con status de error)
                if(result.message && String(result.message).toLowerCase().includes("exitoso")) { // Manejo de mensajes de error con éxito
                    setRegistroId(result.id || "OK");
                    setShowModal(true);
                } else {
                    throw new Error(result.message || "No se pudo completar el registro.");
                }
            }

        } catch (err) { 
            console.error("Error en handleSubmit:", err);
            
            // 🛡️ ÚLTIMA DEFENSA: Si el error dice "exitoso" (o "correctamente"), es éxito.
            const errMsg = (err instanceof Error && err.message) || "Error desconocido";
            if (errMsg.toLowerCase().includes("exitoso") || errMsg.toLowerCase().includes("correctamente")) {
                setShowModal(true);
                setRegistroId("OK");
                setFormData({ ...formData, paymentProof: null });
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                alert("Ocurrió un problema: " + errMsg);
            }
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
                    {/* Payment Methods (LEFT) */}
                    <div>
                        <h3 className="text-2xl font-bold text-black mb-8">Métodos de Pago</h3>

                        {/* Yape Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 mb-6 border-2 border-blue-200 shadow-lg">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-blue-600 text-white p-3 rounded-lg">
                                    <QrCode size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-black">Pago con Yape</h4>
                                    <p className="text-gray-600">Escanea el código QR</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-6 mb-6 flex items-center justify-center h-48">
                                {/* Simulación de imagen QR - Asegúrate de tener tu imagen real aquí */}
                                 
                            </div>
                            <div className="text-center">
                                <p className="text-black font-bold mb-2">Número Yape:</p>
                                <p className="text-2xl font-bold text-blue-600 mb-2">+51 999 888 777</p>
                                <p className="text-gray-600">Nombre: Sorteos Premium SAC</p>
                            </div>
                        </div>

                        {/* Transferencia Bancaria Section */}
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-purple-600 text-white p-3 rounded-lg">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-black">Transferencia Bancaria</h4>
                                    <p className="text-gray-600">Realiza tu pago a estas cuentas</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600">Banco: **BCP**</p>
                                    <p className="text-lg font-bold text-black">123 456 789 012</p>
                                    <p className="text-sm text-gray-500">CCI: 002-123-456789012-34</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600">Banco: **Interbank**</p>
                                    <p className="text-lg font-bold text-black">987 654 321 098</p>
                                    <p className="text-sm text-gray-500">CCI: 003-987-654321098-76</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registration Form (RIGHT) */}
                    <div>
                        <h3 className="text-2xl font-bold text-black mb-8">Datos de Registro y Comprobante</h3>
                        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-2xl shadow-xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Input Nombres */}
                                <div>
                                    <label className="block text-black font-semibold mb-2">Nombres *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Juan Carlos"
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none transition"
                                        required
                                    />
                                </div>
                                {/* Input Apellidos */}
                                <div>
                                    <label className="block text-black font-semibold mb-2">Apellidos *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Pérez García"
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Select Tipo Documento */}
                                <div>
                                    <label className="block text-black font-semibold mb-2">Tipo de Documento *</label>
                                    <select
                                        name="documentType"
                                        value={formData.documentType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none transition appearance-none"
                                        required
                                    >
                                        <option value="DNI">DNI</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                        <option value="Carnet Extranjería">Carnet Extranjería</option>
                                    </select>
                                </div>
                                {/* Input Número Documento */}
                                <div>
                                    <label className="block text-black font-semibold mb-2">Número de Documento *</label>
                                    <input
                                        type="text"
                                        name="documentNumber"
                                        value={formData.documentNumber}
                                        onChange={handleChange}
                                        placeholder="12345678"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={formData.documentType === "DNI" ? 8 : 12}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none transition"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Input Correo Electrónico */}
                            <div>
                                <label className="block text-black font-semibold mb-2">Correo Electrónico *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="juan@ejemplo.com"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none transition"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Input Número de Celular */}
                                <div>
                                    <label className="block text-black font-semibold mb-2">Número de Celular *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="999 999 999"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={12}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none transition"
                                        required
                                    />
                                </div>
                                {/* Select Número de Tickets */}
                                <div>
                                
                                <label className="block text-black font-semibold mb-2">Número de Tickets *</label>
                                <select
                                    name="tickets"
                                    value={formData.tickets}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none transition appearance-none"
                                    required
                                >
                                    <option>Seleccionar</option>
                                    {[...Array(10)].map((_, index) => {
                                        const numTickets = index + 1;
                                        return (
                                            <option key={numTickets} value={numTickets}> 
                                                {numTickets} ticket{numTickets > 1 ? 's' : ''} - S/ {numTickets * 5} 
                                            </option>
                                        );
                                    })}
                                </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Select Departamento */}
                                <div>
                                    <label className="block text-black font-semibold mb-2">Departamento *</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-orange-600 focus:ring-1 focus:ring-orange-600 focus:outline-none transition appearance-none"
                                        required
                                    >
                                        <option value="">Selecciona tu departamento</option>
                                        <option value="AMAZONAS">Amazonas</option>
                                        <option value="ANCASH">Áncash</option>
                                        <option value="APURIMAC">Apurímac</option>
                                        <option value="AREQUIPA">Arequipa</option>
                                        <option value="AYACUCHO">Ayacucho</option>
                                        <option value="CAJAMARCA">Cajamarca</option>
                                        <option value="CALLAO">Callao</option>
                                        <option value="CUSCO">Cusco</option>
                                        <option value="HUANCAVELICA">Huancavelica</option>
                                        <option value="HUANUCO">Huánuco</option>
                                        <option value="ICA">Ica</option>
                                        <option value="JUNIN">Junín</option>
                                        <option value="LA_LIBERTAD">La Libertad</option>
                                        <option value="LAMBAYEQUE">Lambayeque</option>
                                        <option value="LIMA">Lima</option>
                                        <option value="LORETO">Loreto</option>
                                        <option value="MADRE_DE_DIOS">Madre de Dios</option>
                                        <option value="MOQUEGUA">Moquegua</option>
                                        <option value="PASCO">Pasco</option>
                                        <option value="PIURA">Piura</option>
                                        <option value="PUNO">Puno</option>
                                        <option value="SAN_MARTIN">San Martín</option>
                                        <option value="TACNA">Tacna</option>
                                        <option value="TUMBES">Tumbes</option>
                                        <option value="UCAYALI">Ucayali</option>
                                        <option>Otros</option>
                                    </select>
                                </div>
                                {/* Input Comprobante */}
                                <div>
                                    <label className="block text-black font-semibold mb-2">Comprobante *</label>
                                    <input
                                        type="file"
                                        name="paymentProof"
                                        accept="image/*,application/pdf"
                                        onChange={handleChange}
                                        ref={fileInputRef} 
                                        className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 file:cursor-pointer
                                        text-gray-500 bg-white border-2 border-gray-300 rounded-lg p-2 focus:border-orange-600 focus:outline-none transition"
                                        required
                                    />
                                    {formData.paymentProof && (
                                        <p className="text-xs text-green-600 mt-1">Archivo subido: {formData.paymentProof.name}</p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full px-6 py-4 font-bold rounded-lg transition text-lg shadow-md ${
                                    loading 
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
                                    : "bg-orange-600 text-white hover:bg-orange-700"
                                }`}
                            >
                                {loading ? "Enviando Registro..." : "REGISTRARSE Y PARTICIPAR"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* Modal Condicional */}
            {showModal && (
                <ConfirmationModal 
                    id={registroId} 
                    onClose={closeModal} 
                />
            )}

        </section>
    );
}
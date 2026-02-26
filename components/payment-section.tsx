"use client";

import React, { useState, useEffect, useRef } from "react";
import { QrCode, CreditCard, User, Mail, Phone, MapPin, Ticket, Upload, Trophy, Copy } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";
import { UBIGEO_PERU } from './peru-data';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwOuGzQMKPVgnQKqX64KyAEdmBEsJwBPZ4dAybSeGiOiK5QXym9j_CGdpW98YYV2MKI/exec";

// Estructura que usaremos para los paquetes de tickets
interface PaqueteTicket {
    cantidad: number;
    precio: number;
    etiqueta: string;
}

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
    const [nombreEvento, setNombreEvento] = useState("Cargando Evento...");
    const [promoActiva, setPromoActiva] = useState("");

    // Aquí almacenaremos los paquetes leídos de la Base de Datos
    const [paquetes, setPaquetes] = useState<PaqueteTicket[]>([{ cantidad: 1, precio: 5, etiqueta: '' }]);
    const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<PaqueteTicket | null>(null);

    // ESTADOS PARA PAGOS (Yape/Plin)
    const [yapeTitular, setYapeTitular] = useState("");
    const [yapeNumero, setYapeNumero] = useState("");
    const [yapeQrUrl, setYapeQrUrl] = useState("");

    const [plinTitular, setPlinTitular] = useState("");
    const [plinNumero, setPlinNumero] = useState("");
    const [plinQrUrl, setPlinQrUrl] = useState("");

    const [formData, setFormData] = useState<FormData>({
        firstName: "", lastName: "", documentType: "DNI", documentNumber: "", email: "", phone: "",
        evento: "", cantidadTickets: 1, department: "", province: "", district: "", paymentProof: null,
    });

    // Función para obtener la imagen directa desde Google Drive
    const obtenerUrlDirecta = (url: string | undefined) => {
        if (!url) return "";
        const match = url.match(/\/d\/(.+?)\//);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
        return url;
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${APPS_SCRIPT_URL}?accion=getConfig`);
                const json = await res.json();
                if (json.success && json.data) {
                    const eventoActivoCMS = json.data.eventoActivo || "GRAN SORTEO";
                    setNombreEvento(eventoActivoCMS);
                    setPromoActiva(json.data.promoActiva || "");
                    setFormData(prev => ({ ...prev, evento: eventoActivoCMS }));

                    // LECTURA DINÁMICA DE PAQUETES
                    if (json.data.precioTicket) {
                        try {
                            const p = JSON.parse(json.data.precioTicket);
                            if (Array.isArray(p) && p.length > 0) {
                                setPaquetes(p);
                                setPaqueteSeleccionado(p[0]); // Seleccionamos el primer paquete por defecto
                            }
                        } catch (e) {
                            // Si falla, es que tiene el formato viejo de texto. Se le pone uno genérico.
                            const defaultPaquete = { cantidad: 1, precio: parseFloat(json.data.precioTicket) || 5, etiqueta: '' };
                            setPaquetes([defaultPaquete]);
                            setPaqueteSeleccionado(defaultPaquete);
                        }
                    }

                    // Cargar datos de pago desde el CMS
                    if (json.data.yapeTitular) setYapeTitular(json.data.yapeTitular);
                    if (json.data.yapeNumero) setYapeNumero(json.data.yapeNumero);
                    if (json.data.yapeQrUrl) setYapeQrUrl(json.data.yapeQrUrl);

                    if (json.data.plinTitular) setPlinTitular(json.data.plinTitular);
                    if (json.data.plinNumero) setPlinNumero(json.data.plinNumero);
                    if (json.data.plinQrUrl) setPlinQrUrl(json.data.plinQrUrl);
                }
            } catch (error) {
                console.error("Error cargando CMS en pagos:", error);
            }
        };
        fetchConfig();
    }, []);

    const departamentos = Object.keys(UBIGEO_PERU);
    const provincias = formData.department ? Object.keys(UBIGEO_PERU[formData.department as keyof typeof UBIGEO_PERU] || {}) : [];
    const distritos = (formData.department && formData.province) ? UBIGEO_PERU[formData.department as keyof typeof UBIGEO_PERU][formData.province] || [] : [];

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
            } else {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.paymentProof) { alert("⚠️ Por favor, sube la captura de tu pago para continuar."); return; }
        if (!paqueteSeleccionado) { alert("⚠️ Debes seleccionar un paquete de tickets."); return; }

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

            // Usamos las cantidades y precios del paquete dinámico que seleccionó el usuario
            const payload = {
                evento: formData.evento, nombres: formData.firstName, apellidos: formData.lastName,
                tipoDocumento: formData.documentType, numeroDocumento: formData.documentNumber, email: formData.email,
                celular: formData.phone, cantidadTickets: paqueteSeleccionado.cantidad, montoTotal: paqueteSeleccionado.precio,
                departamento: formData.department, provincia: formData.province, distrito: formData.district,
                comprobanteFileName: formData.paymentProof.name, comprobanteBase64: base64String
            };

            const response = await fetch(APPS_SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
            const result = await response.json();

            const isSuccess = result.success === true || result.success === "true" || (result.message && result.message.toLowerCase().includes("exitoso"));

            if (isSuccess) {
                setRegistroId(result.id || "REGISTRO-EN-PROCESO");
                setShowModal(true);
                setFormData({
                    firstName: "", lastName: "", documentType: "DNI", documentNumber: "", email: "", phone: "",
                    evento: nombreEvento, cantidadTickets: 1, department: "", province: "", district: "", paymentProof: null,
                });
            } else {
                alert("❌ Error al registrar: " + (result.message || "Revisa tus datos e intenta nuevamente."));
            }
        } catch (error) {
            alert("🔌 Error de conexión. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => alert(`¡Número ${text} copiado al portapapeles!`));
    };

    return (
        <section id="registro" className="py-24 bg-slate-950 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4">Registro y <span className="text-orange-500">Pago</span></h1>
                    <p className="text-slate-400">Completa tus datos y sube tu voucher para obtener tus tickets.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* COLUMNA IZQUIERDA: MÉTODOS DE PAGO CON CMS */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CreditCard className="text-orange-500" />
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Métodos de Pago</h2>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 md:p-8">

                            {/* BLOQUE YAPE */}
                            <div className="bg-[#7408B5]/10 p-6 rounded-3xl w-full mx-auto mb-6 shadow-2xl overflow-hidden border border-[#7408B5]/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-black text-white text-xl tracking-widest">YAPE</h3>
                                    <div className="bg-[#7408B5] px-3 py-1 rounded-full text-xs font-bold text-white">QR Oficial</div>
                                </div>
                                <div className="aspect-square bg-white rounded-2xl flex items-center justify-center border-4 border-[#7408B5] relative mb-4 p-2 overflow-hidden max-w-[200px] mx-auto">
                                    {yapeQrUrl ? (
                                        <img src={obtenerUrlDirecta(yapeQrUrl)} alt="QR Yape" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-slate-400 text-sm font-bold text-center"> CARGANDO QR PLIN<br />(Espere)</span>
                                    )}
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Titular</p>
                                    <p className="text-white font-black text-sm uppercase">{yapeTitular || "---"}</p>
                                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest pt-2">Número</p>
                                    <p className="text-white font-black text-2xl tracking-widest">{yapeNumero || "---"}</p>
                                    {yapeNumero && (
                                        <button type="button" onClick={() => copyToClipboard(yapeNumero)} className="mt-2 w-full flex justify-center items-center gap-2 bg-[#7408B5] hover:bg-[#5b068f] text-white py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors shadow-lg">
                                            <Copy size={16} /> Copiar Número
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* BLOQUE PLIN */}
                            <div className="bg-[#00D7D7]/10 p-6 rounded-3xl w-full mx-auto shadow-2xl overflow-hidden border border-[#00D7D7]/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-black text-white text-xl tracking-widest">PLIN</h3>
                                    <div className="bg-[#00D7D7] px-3 py-1 rounded-full text-xs font-bold text-slate-900">QR Oficial</div>
                                </div>
                                <div className="aspect-square bg-white rounded-2xl flex items-center justify-center border-4 border-[#00D7D7] relative mb-4 p-2 overflow-hidden max-w-[200px] mx-auto">
                                    {plinQrUrl ? (
                                        <img src={obtenerUrlDirecta(plinQrUrl)} alt="QR Plin" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-slate-400 text-sm font-bold text-center">CARGANDO QR YAPE...<br />(Espere)</span>
                                    )}
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">Titular</p>
                                    <p className="text-white font-black text-sm uppercase">{plinTitular || "---"}</p>
                                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest pt-2">Número</p>
                                    <p className="text-white font-black text-2xl tracking-widest">{plinNumero || "---"}</p>
                                    {plinNumero && (
                                        <button type="button" onClick={() => copyToClipboard(plinNumero)} className="mt-2 w-full flex justify-center items-center gap-2 bg-[#00D7D7] hover:bg-[#00baba] text-slate-900 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors shadow-lg">
                                            <Copy size={16} /> Copiar Número
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* COLUMNA DERECHA: FORMULARIO */}
                    <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-10">

                            {/* EVENTO Y TICKETS (NUEVO DISEÑO DE PAQUETES) */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-orange-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2"><Trophy size={20} /> 1. Sorteo y Tickets</h3>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Evento Activo:</p>
                                    <p className="text-white font-black text-xl italic">{nombreEvento}</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {paquetes.map((pack, idx) => {
                                        const isSelected = paqueteSeleccionado?.cantidad === pack.cantidad;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setPaqueteSeleccionado(pack)}
                                                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 text-center relative flex flex-col justify-center items-center ${isSelected
                                                    ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(234,88,12,0.2)] transform scale-105 z-10'
                                                    : 'border-slate-800 bg-slate-900 hover:border-orange-500/50 hover:bg-slate-800'
                                                    }`}
                                            >
                                                {pack.etiqueta && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-pink-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                                                        {pack.etiqueta}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-center gap-1 mb-1 mt-2">
                                                    <Ticket size={18} className={isSelected ? 'text-orange-500' : 'text-slate-500'} />
                                                    <span className={`text-3xl font-black ${isSelected ? 'text-white' : 'text-slate-300'}`}>{pack.cantidad}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">TICKETS</p>

                                                <div className={`w-full pt-3 border-t ${isSelected ? 'border-orange-500/30' : 'border-slate-800'}`}>
                                                    <p className={`text-xl font-black tracking-tight ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                        S/ {pack.precio.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="mt-6 flex justify-between items-center bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl">
                                    <span className="text-emerald-500 font-bold uppercase text-sm tracking-widest">Total a pagar:</span>
                                    <span className="text-3xl font-black text-emerald-400">S/ {paqueteSeleccionado?.precio.toFixed(2) || "0.00"}</span>
                                </div>

                                {promoActiva && (
                                    <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-center animate-pulse">
                                        <p className="text-emerald-400 font-bold text-sm tracking-wide">🔥 {promoActiva}</p>
                                    </div>
                                )}
                            </div>

                            {/* DATOS PERSONALES */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-orange-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2"><User size={20} /> 2. Datos Personales</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Nombres</label>
                                        <input type="text" name="firstName" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white" value={formData.firstName} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Apellidos</label>
                                        <input type="text" name="lastName" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white" value={formData.lastName} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Documento</label>
                                        <div className="flex gap-2">
                                            <select name="documentType" className="bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 text-white w-24" value={formData.documentType} onChange={handleChange}>
                                                <option>DNI</option>
                                                <option>CE</option>
                                                <option>Pasaporte</option>
                                            </select>
                                            <input type="text" name="documentNumber" required className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white" value={formData.documentNumber} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"> <Phone size={14} /> Celular (WhatsApp) </label>
                                        <input type="tel" name="phone" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white" value={formData.phone} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"> <Mail size={14} /> Correo Electrónico </label>
                                        <input type="email" name="email" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 transition-all text-white" value={formData.email} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            {/* UBICACIÓN */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-orange-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2"><MapPin size={20} /> 3. Ubicación</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Departamento</label>
                                        <select name="department" required className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 text-white" value={formData.department} onChange={handleChange}>
                                            <option value="" disabled>Elegir...</option>
                                            {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    {/*
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Provincia</label>
                                        <select name="province" required disabled={!formData.department} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 text-white disabled:opacity-50" value={formData.province} onChange={handleChange}>
                                            <option value="" disabled>Elegir...</option>
                                            {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Distrito</label>
                                        <select name="district" required disabled={!formData.province} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-orange-500 text-white disabled:opacity-50" value={formData.district} onChange={handleChange}>
                                            <option value="" disabled>Elegir...</option>
                                            {distritos.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    */}
                                </div>
                            </div>

                            {/* COMPROBANTE DE PAGO */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-orange-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2"><Upload size={20} /> 4. Comprobante de Pago</h3>
                                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 bg-slate-950 rounded-2xl p-8 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 transition-all group">
                                    <input type="file" ref={fileInputRef} onChange={handleChange} className="hidden" accept="image/*" />
                                    {formData.paymentProof ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">✅</div>
                                            <p className="text-emerald-400 font-bold">{formData.paymentProof.name}</p>
                                            <p className="text-slate-500 text-xs">Clic para cambiar comprobante</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-800 group-hover:bg-orange-500 text-slate-400 group-hover:text-white rounded-full flex items-center justify-center transition-colors">
                                                <Upload size={24} />
                                            </div>
                                            <p className="text-slate-300 font-bold">Haz clic aquí para subir tu voucher</p>
                                            <p className="text-slate-500 text-xs">Solo imágenes (JPG, PNG)</p>
                                        </div>
                                    )}
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
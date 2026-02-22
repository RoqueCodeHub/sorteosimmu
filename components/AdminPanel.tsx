'use client'

// ==========================================
// 1. IMPORTS Y CONFIGURACIÓN
// ==========================================
import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

// URL del Google Apps Script
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOuGzQMKPVgnQKqX64KyAEdmBEsJwBPZ4dAybSeGiOiK5QXym9j_CGdpW98YYV2MKI/exec'

// Definición de tipos de datos
interface Participante {
    evento: string
    fecha: string
    idRegistro: string
    nombres: string
    apellidos: string
    participante: string
    tipoDoc: string
    documento: string
    email: string
    celular: string
    ubicacion: string
    cantidad: string
    monto: string
    linkComprobante: string
    estado: string
    codigos: string
}

export default function AdminPanel() {

    // ==========================================
    // 2. ESTADOS DE LA APLICACIÓN
    // ==========================================

    // --- Autenticación ---
    const [authorized, setAuthorized] = useState(false)
    const [password, setPassword] = useState('')
    const ADMIN_PASSWORD = 'arce'
    const [authError, setAuthError] = useState(false)

    // --- Navegación Principal ---
    const [activeTab, setActiveTab] = useState<'dashboard' | 'registros'>('dashboard')

    // --- Datos Principales ---
    const [data, setData] = useState<Participante[]>([])
    const [loading, setLoading] = useState(false)
    const [ultimoModificadoId, setUltimoModificadoId] = useState<string | null>(null)

    // --- Filtros Pestaña Registros ---
    const [searchTerm, setSearchTerm] = useState('')
    const [filterEvento, setFilterEvento] = useState('TODOS')
    const [filterEstado, setFilterEstado] = useState('TODOS')
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    // --- Lupa / Detalles ---
    const [showModal, setShowModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<Participante | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState(false)

    // --- Sorteador ---
    const [showSorteo, setShowSorteo] = useState(false)
    const [sorteando, setSorteando] = useState(false)
    const [ganadorActual, setGanadorActual] = useState<Participante | null>(null)
    const [ticketSorteado, setTicketSorteado] = useState<string | null>(null)
    const [numeroAnimado, setNumeroAnimado] = useState<string>('00000')

    // ==========================================
    // 🧠 ESTADOS DEL CMS (GESTOR DE EVENTOS V3.0)
    // ==========================================
    const [showCMS, setShowCMS] = useState(false)
    const [loadingCMS, setLoadingCMS] = useState(false)
    const [cmsTab, setCmsTab] = useState<'evento' | 'pagos' | 'legales'>('evento')

    const [eventoActivo, setEventoActivo] = useState('')
    const [precioTicket, setPrecioTicket] = useState('')
    const [metaTickets, setMetaTickets] = useState('5000')
    const [promoActiva, setPromoActiva] = useState('')
    const [estadoEvento, setEstadoEvento] = useState('ACTIVO')
    const [flayerUrl, setFlayerUrl] = useState('')
    const [flayerFile, setFlayerFile] = useState<File | null>(null)

    const [yapeTitular, setYapeTitular] = useState('')
    const [yapeNumero, setYapeNumero] = useState('')
    const [yapeQrUrl, setYapeQrUrl] = useState('')
    const [yapeQrFile, setYapeQrFile] = useState<File | null>(null)

    const [plinTitular, setPlinTitular] = useState('')
    const [plinNumero, setPlinNumero] = useState('')
    const [plinQrUrl, setPlinQrUrl] = useState('')
    const [plinQrFile, setPlinQrFile] = useState<File | null>(null)

    const [tycFecha, setTycFecha] = useState('')
    const [tycPremio, setTycPremio] = useState('')
    const [tycRegion, setTycRegion] = useState('')
    const [tycPdf, setTycPdf] = useState('')

    // ==========================================
    // 3. EFECTOS Y CARGA INICIAL
    // ==========================================
    useEffect(() => {
        const isAuth = localStorage.getItem('adminAuth')
        if (isAuth === 'true') {
            setAuthorized(true)
            fetchData()
            cargarConfiguracion()
        }
    }, [])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            localStorage.setItem('adminAuth', 'true')
            setAuthorized(true)
            setAuthError(false)
            fetchData()
            cargarConfiguracion()
        } else {
            setAuthError(true)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('adminAuth')
        setAuthorized(false)
        setData([])
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?accion=listarTodo`)
            const result = await response.json()
            if (result.success) {
                setData(result.data.reverse())
            }
        } catch (error) {
            console.error('Error al cargar datos:', error)
            alert('Error al conectar con la base de datos.')
        } finally {
            setLoading(false)
        }
    }

    // ==========================================
    // 🛠️ FUNCIONES AUXILIARES Y CMS
    // ==========================================

    const formatSafeDate = (fechaRaw: string | undefined) => {
        if (!fechaRaw) return "Sin fecha";
        const fecha = new Date(fechaRaw);
        if (isNaN(fecha.getTime())) return fechaRaw;
        return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    const obtenerLinkWhatsapp = (p: Participante) => {
        const telefono = p.celular?.replace(/\D/g, '') || '';
        return `https://wa.me/51${telefono}`;
    }

    // Función para obtener la imagen directa desde Google Drive
    const obtenerUrlDirecta = (url: string | undefined) => {
        if (!url) return "";
        const match = url.match(/\/d\/(.+?)\//);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }
        return url;
    };

    const cargarConfiguracion = async () => {
        try {
            const res = await fetch(`${APPS_SCRIPT_URL}?accion=getConfig`)
            const json = await res.json()
            if (json.success && json.data) {
                const conf = json.data
                if (conf.eventoActivo) setEventoActivo(conf.eventoActivo)
                if (conf.precioTicket) setPrecioTicket(conf.precioTicket)
                if (conf.metaTickets) setMetaTickets(conf.metaTickets)
                if (conf.promoActiva) setPromoActiva(conf.promoActiva)
                if (conf.estadoEvento) setEstadoEvento(conf.estadoEvento)
                if (conf.flayerUrl) setFlayerUrl(conf.flayerUrl)
                if (conf.yapeTitular) setYapeTitular(conf.yapeTitular)
                if (conf.yapeNumero) setYapeNumero(conf.yapeNumero)
                if (conf.yapeQrUrl) setYapeQrUrl(conf.yapeQrUrl)
                if (conf.plinTitular) setPlinTitular(conf.plinTitular)
                if (conf.plinNumero) setPlinNumero(conf.plinNumero)
                if (conf.plinQrUrl) setPlinQrUrl(conf.plinQrUrl)
                if (conf.tycFecha) setTycFecha(conf.tycFecha)
                if (conf.tycPremio) setTycPremio(conf.tycPremio)
                if (conf.tycRegion) setTycRegion(conf.tycRegion)
                if (conf.tycPdf) setTycPdf(conf.tycPdf)
            }
        } catch (error) {
            console.error("Error cargando configuración:", error)
        }
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
        })
    }

    const guardarConfiguracion = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoadingCMS(true)
        try {
            let base64Flayer = "", flayerName = ""
            if (flayerFile) { base64Flayer = await fileToBase64(flayerFile); flayerName = flayerFile.name }
            let base64Yape = "", yapeName = ""
            if (yapeQrFile) { base64Yape = await fileToBase64(yapeQrFile); yapeName = yapeQrFile.name }
            let base64Plin = "", plinName = ""
            if (plinQrFile) { base64Plin = await fileToBase64(plinQrFile); plinName = plinQrFile.name }

            const payload = {
                accion: "guardarConfig",
                eventoActivo, precioTicket, metaTickets, promoActiva, estadoEvento, flayerUrl,
                flayerBase64: base64Flayer, flayerFileName: flayerName,
                yapeTitular, yapeNumero, yapeQrUrl, yapeQrBase64: base64Yape, yapeQrFileName: yapeName,
                plinTitular, plinNumero, plinQrUrl, plinQrBase64: base64Plin, plinQrFileName: plinName,
                tycFecha, tycPremio, tycRegion, tycPdf
            }

            const response = await fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) })
            const result = await response.json()
            if (result.success) {
                alert("✅ ¡Configuración guardada exitosamente!")
                setShowCMS(false); setFlayerFile(null); setYapeQrFile(null); setPlinQrFile(null);
            } else alert("❌ Error: " + result.message)
        } catch (error) {
            alert("❌ Error de conexión al guardar.")
        } finally {
            setLoadingCMS(false)
        }
    }

    const actualizarEstado = async (idRegistro: string, nuevoEstado: string) => {
        setUpdatingStatus(true)
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ accion: 'actualizarEstado', idRegistro: idRegistro, nuevoEstado: nuevoEstado })
            })
            const result = await response.json()
            if (result.success) {
                fetchData()
                if (selectedUser) setSelectedUser({ ...selectedUser, estado: nuevoEstado })
                setUltimoModificadoId(idRegistro)
                setTimeout(() => setUltimoModificadoId(null), 3000)
            } else {
                alert('Error al actualizar: ' + result.message)
            }
        } catch (error) {
            alert('Error de conexión al actualizar.')
        } finally {
            setUpdatingStatus(false)
            setShowModal(false)
        }
    }

    const descargarCSV = () => {
        if (data.length === 0) return;
        const headers = ["Fecha", "Evento", "Participante", "DNI", "Cantidad", "Monto", "Estado", "Codigos"];
        const rows = data.map(p => [
            p.fecha, p.evento, p.nombres + ' ' + p.apellidos, p.documento, p.cantidad, p.monto, p.estado, `"${p.codigos || ''}"`
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_sorteo_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const generarTicketsPDF = () => {
        const listaTickets: { codigo: string; nombre: string; dni: string }[] = [];
        data.forEach(p => {
            if (p.estado === 'APROBADO' && p.codigos) {
                const cods = p.codigos.split(',').map(c => c.trim());
                cods.forEach(c => {
                    if (c) listaTickets.push({
                        codigo: c,
                        nombre: p.participante || `${p.nombres} ${p.apellidos}`,
                        dni: p.documento
                    });
                });
            }
        });

        if (listaTickets.length === 0) {
            alert("No hay participantes aprobados con códigos para generar.");
            return;
        }

        const doc = new jsPDF();
        const cols = 3; const rows = 9; const margen = 10;
        const anchoTicket = 60; const altoTicket = 30;
        let x = margen, y = margen, contadorCol = 0, contadorRow = 0;

        doc.setFontSize(10);
        doc.text(`Total Tickets: ${listaTickets.length}`, margen, margen - 2);

        listaTickets.forEach((ticket) => {
            if (contadorRow >= rows) {
                doc.addPage();
                x = margen; y = margen; contadorRow = 0; contadorCol = 0;
            }
            doc.setDrawColor(200);
            doc.rect(x, y, anchoTicket, altoTicket);
            doc.setTextColor(0); doc.setFont("helvetica", "bold"); doc.setFontSize(22);
            doc.text(ticket.codigo, x + (anchoTicket / 2), y + 12, { align: "center" });
            doc.setFont("helvetica", "normal"); doc.setFontSize(8);
            const nombreCorto = ticket.nombre.length > 25 ? ticket.nombre.substring(0, 25) + "..." : ticket.nombre;
            doc.text(nombreCorto, x + (anchoTicket / 2), y + 20, { align: "center" });
            doc.setFontSize(7); doc.setTextColor(100);
            doc.text(`DNI: ${ticket.dni}`, x + (anchoTicket / 2), y + 25, { align: "center" });

            contadorCol++; x += anchoTicket + 2;
            if (contadorCol >= cols) {
                contadorCol = 0; x = margen; y += altoTicket + 2; contadorRow++;
            }
        });
        doc.save("tickets-para-sorteo.pdf");
    };

    const iniciarSorteo = () => {
        const participantesValidos = data.filter(p => p.estado === 'APROBADO' && p.codigos)
        if (participantesValidos.length === 0) {
            alert('No hay participantes APROBADOS con códigos generados para realizar el sorteo.')
            return
        }
        const anforaVirtual: { ticket: string, dueno: Participante }[] = []
        participantesValidos.forEach(p => {
            const ticketsDeEsteUsuario = p.codigos.split(',').map(c => c.trim()).filter(c => c !== "")
            ticketsDeEsteUsuario.forEach(ticket => {
                anforaVirtual.push({ ticket: ticket, dueno: p })
            })
        })

        setSorteando(true); setGanadorActual(null); setTicketSorteado(null);

        let iteraciones = 0
        const intervalo = setInterval(() => {
            const numAleatorio = Math.floor(1000 + Math.random() * 9000).toString()
            setNumeroAnimado(`CTB-${numAleatorio}`)
            iteraciones++

            if (iteraciones > 30) {
                clearInterval(intervalo)
                const indiceGanador = Math.floor(Math.random() * anforaVirtual.length)
                const resultadoFinal = anforaVirtual[indiceGanador]
                setNumeroAnimado(resultadoFinal.ticket)
                setTicketSorteado(resultadoFinal.ticket)
                setGanadorActual(resultadoFinal.dueno)
                setSorteando(false)
            }
        }, 100)
    }

    const reiniciarSorteo = () => { setGanadorActual(null); setTicketSorteado(null); setNumeroAnimado('00000'); }

    // ==========================================
    // 6. CÁLCULOS Y FILTROS
    // ==========================================

    const participantesFiltrados = data.filter(p => {
        const matchSearch =
            p.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.documento?.includes(searchTerm) ||
            (p.codigos && p.codigos.includes(searchTerm));
        const matchEvento = filterEvento === 'TODOS' || p.evento === filterEvento;
        const matchEstado = filterEstado === 'TODOS' || p.estado === filterEstado;
        return matchSearch && matchEvento && matchEstado;
    });

    const totalRegistros = participantesFiltrados.length;
    const totalAprobados = participantesFiltrados.filter(p => p.estado === 'APROBADO').length;
    const totalPendientes = participantesFiltrados.filter(p => p.estado === 'PENDIENTE').length;
    const totalRechazados = participantesFiltrados.filter(p => p.estado === 'RECHAZADO').length;

    const ticketsVendidos = participantesFiltrados
        .filter(p => p.estado === 'APROBADO')
        .reduce((sum, p) => sum + (parseInt(String(p.cantidad).split('+')[0].trim()) || 0), 0);

    const totalRecaudado = participantesFiltrados
        .filter(p => p.estado === 'APROBADO')
        .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);

    const metaObj = parseInt(metaTickets) || 5000;

    const participacionesData = [
        { name: 'Aprobados', value: totalAprobados, color: '#10b981' },
        { name: 'Pendientes', value: totalPendientes, color: '#f59e0b' },
        { name: 'Rechazados', value: totalRechazados, color: '#ef4444' }
    ];

    const ingresosPorDia: Record<string, number> = {};
    const dataAprobada = participantesFiltrados.filter(d => d.estado === 'APROBADO');
    dataAprobada.forEach(d => {
        const fechaObj = new Date(d.fecha);
        const fecha = isNaN(fechaObj.getTime()) ? d.fecha : fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
        ingresosPorDia[fecha] = (ingresosPorDia[fecha] || 0) + parseFloat(d.monto || '0');
    });
    const ingresosData = Object.keys(ingresosPorDia).slice(-7).map(fecha => ({ fecha: fecha, total: ingresosPorDia[fecha] }));

    const uniqueEvents = Array.from(new Set(data.map(item => item.evento)));
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = itemsPerPage === -1 ? participantesFiltrados : participantesFiltrados.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(participantesFiltrados.length / itemsPerPage);

    // ==========================================
    // 7. RENDERIZADO
    // ==========================================

    if (!authorized) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-white italic tracking-tighter mb-2">PANEL <span className="text-orange-500">ADMIN</span></h1>
                        <p className="text-slate-400">Acceso restringido</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input type="password" placeholder="Contraseña de acceso" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors text-center font-mono" />
                        {authError && <p className="text-red-500 text-sm text-center">Contraseña incorrecta</p>}
                        <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-colors">INGRESAR</button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-4 md:p-8 font-sans selection:bg-orange-500/30">

            {/* CABECERA */}
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter">CTB <span className="text-orange-500">ADMIN</span> V3.0</h1>
                    <p className="text-sm text-slate-500 mt-1">Gestión integral del sistema</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => { cargarConfiguracion(); setShowCMS(true); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2">⚙️ Gestor de Eventos</button>
                    <button onClick={() => { setShowSorteo(true); reiniciarSorteo(); }} className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-900/20">🎲 Realizar Sorteo</button>
                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 font-bold px-4 py-2 text-sm transition-colors">SALIR</button>
                </div>
            </header>

            {/* BARRA DE PESTAÑAS PRINCIPALES */}
            <div className="max-w-7xl mx-auto flex gap-4 mb-8">
                <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300'}`}>
                    📊 Dashboard Estadístico
                </button>
                <button onClick={() => setActiveTab('registros')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'registros' ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-900/50 text-slate-500 hover:text-slate-300'}`}>
                    📋 Registro y Aprobaciones
                </button>
            </div>

            {/* ============================================================== */}
            {/* PESTAÑA: DASHBOARD */}
            {/* ============================================================== */}
            {activeTab === 'dashboard' && (
                <div className="animate-fade-in">
                    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Total Registros</p>
                            <p className="text-3xl font-black text-white">{totalRegistros}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Aprobados</p>
                            <p className="text-3xl font-black text-emerald-500">{totalAprobados}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Pendientes</p>
                            <p className="text-3xl font-black text-amber-500">{totalPendientes}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Rechazados</p>
                            <p className="text-3xl font-black text-red-500">{totalRechazados}</p>
                        </div>
                        <div className="bg-slate-900 border border-orange-500/30 p-6 rounded-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full"></div>
                            <p className="text-xs text-orange-400/80 uppercase font-bold tracking-wider mb-2">Tickets Vendidos</p>
                            <p className="text-3xl font-black text-orange-500">{ticketsVendidos}</p>
                        </div>
                        <div className="bg-emerald-950/30 border border-emerald-500/30 p-6 rounded-2xl flex flex-col justify-center items-center text-center relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full"></div>
                            <p className="text-xs text-emerald-400/80 uppercase font-bold tracking-wider mb-2">Total Recaudado</p>
                            <p className="text-2xl font-black text-emerald-400">S/ {totalRecaudado.toFixed(2)}</p>
                            <p className="text-[10px] text-emerald-500/60 uppercase mt-1 tracking-widest">Aprobado</p>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col">
                            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-6 text-center">Progreso de Evento</h3>
                            <div className="relative w-full h-[200px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={[{ name: 'Vendidos', value: ticketsVendidos }, { name: 'Faltantes', value: Math.max(0, metaObj - ticketsVendidos) }]} innerRadius={65} outerRadius={85} dataKey="value" stroke="none">
                                            <Cell fill="#f97316" />
                                            <Cell fill="#1e293b" />
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} itemStyle={{ color: '#f97316', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-white">{ticketsVendidos}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">de {metaObj}</span>
                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">Tickets</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-800">
                                <div className="bg-slate-950 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-800/50 shadow-inner">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Ingresos Totales</span>
                                    <span className="text-2xl font-black text-emerald-400 tracking-tight">S/ {totalRecaudado.toFixed(2)}</span>
                                    <span className="text-[9px] text-slate-600 uppercase tracking-wider mt-1">(Tickets Aprobados)</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col">
                            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-6 text-center">Estado de Participaciones</h3>
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={participacionesData} cx="50%" cy="50%" innerRadius={0} outerRadius={80} dataKey="value">
                                            {participacionesData.map((e, i) => <Cell key={`c-${i}`} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col">
                            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-6 text-center">Ingresos Últimos Días (S/)</h3>
                            <div className="flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ingresosData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="fecha" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `S/${v}`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} cursor={{ fill: '#1e293b' }} />
                                        <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* PESTAÑA: REGISTRO Y APROBACIONES */}
            {/* ============================================================== */}
            {activeTab === 'registros' && (
                <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <div>
                            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Registro y <span className="text-orange-500">Aprobaciones</span></h2>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                            <button onClick={descargarCSV} className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-emerald-600/50 flex items-center gap-2 whitespace-nowrap">📥 Excel</button>
                            <button onClick={generarTicketsPDF} className="bg-rose-600/20 hover:bg-rose-600 text-rose-500 hover:text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-rose-600/50 flex items-center gap-2 whitespace-nowrap">🖨️ PDF</button>
                            <button onClick={fetchData} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors border border-slate-700 flex items-center gap-2 whitespace-nowrap">🔄 Refrescar</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <input type="text" placeholder="🔍 Buscar nombre, DNI o ticket..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} className="bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors" />
                        <select value={filterEvento} onChange={(e) => { setFilterEvento(e.target.value); setCurrentPage(1) }} className="bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors">
                            <option value="TODOS">Todos los eventos</option>
                            {uniqueEvents.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <select value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(1) }} className="bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors">
                            <option value="TODOS">Todos los estados</option>
                            <option value="APROBADO">Aprobados</option>
                            <option value="PENDIENTE">Pendientes</option>
                            <option value="RECHAZADO">Rechazados</option>
                        </select>
                        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }} className="bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors">
                            <option value={10}>Ver 10</option>
                            <option value={20}>Ver 20</option>
                            <option value={50}>Ver 50</option>
                            <option value={100}>Ver 100</option>
                            <option value={-1}>Ver Todos</option>
                        </select>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-950/80 text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-bold border-b border-slate-800">Fecha</th>
                                        <th className="p-4 font-bold border-b border-slate-800">Evento</th>
                                        <th className="p-4 font-bold border-b border-slate-800">Participante</th>
                                        <th className="p-4 font-bold border-b border-slate-800">DNI</th>
                                        <th className="p-4 font-bold border-b border-slate-800">Comprobante</th>
                                        <th className="p-4 font-bold border-b border-slate-800 text-center">Cant.</th>
                                        <th className="p-4 font-bold border-b border-slate-800 text-center">Monto</th>
                                        <th className="p-4 font-bold border-b border-slate-800 text-center">Estado</th>
                                        <th className="p-4 font-bold border-b border-slate-800 text-center">Acciones</th>
                                        <th className="p-4 font-bold border-b border-slate-800 text-center">Detalles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {loading ? (
                                        <tr><td colSpan={10} className="p-12 text-center text-slate-500 animate-pulse">Cargando registros...</td></tr>
                                    ) : currentItems.length === 0 ? (
                                        <tr><td colSpan={10} className="p-12 text-center text-slate-500">No se encontraron registros.</td></tr>
                                    ) : (
                                        currentItems.map((p, i) => (
                                            <tr key={i} className={`transition-all duration-1000 ${p.idRegistro === ultimoModificadoId ? 'bg-emerald-500/30 ring-2 ring-emerald-500 inset-0 z-10 scale-[1.01] shadow-xl' : 'hover:bg-slate-800/40'}`}>
                                                <td className="p-4 text-[11px] text-slate-500 font-medium whitespace-nowrap">
                                                    {formatSafeDate(p.fecha)}
                                                </td>
                                                <td className="p-4 text-sm font-medium text-slate-300">{p.evento}</td>
                                                <td className="p-4 text-sm">{p.participante || `${p.nombres} ${p.apellidos}`}</td>
                                                <td className="p-4 text-sm text-slate-400 font-mono">{p.documento}</td>
                                                <td className="p-4">
                                                    {p.linkComprobante ? (
                                                        <a href={p.linkComprobante} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline text-xs flex items-center gap-1">📄 Ver</a>
                                                    ) : <span className="text-slate-600 text-xs">-</span>}
                                                </td>
                                                <td className="p-4 text-sm text-center font-bold text-slate-300">{String(p.cantidad).split('+')[0].trim()}</td>
                                                <td className="p-4 text-sm text-center font-bold text-emerald-500 whitespace-nowrap">S/ {p.monto}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.estado === 'APROBADO' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : p.estado === 'RECHAZADO' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'}`}>
                                                        {p.estado}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2 justify-center items-center">
                                                        <a href={obtenerLinkWhatsapp(p)} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400 font-bold bg-green-900/20 p-2 rounded-md hover:bg-green-900/40 transition" title="Contactar Cliente">📱</a>
                                                        {p.estado !== 'APROBADO' && (<button onClick={() => actualizarEstado(p.idRegistro, 'APROBADO')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-medium transition">Aprobar</button>)}
                                                        <button onClick={() => actualizarEstado(p.idRegistro, 'RECHAZADO')} className="bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-md text-xs font-medium transition border border-red-900/50">Rechazar</button>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button onClick={() => { setSelectedUser(p); setShowModal(true); }} className="bg-slate-800 hover:bg-orange-500 text-white p-2 rounded-full transition-all shadow-lg hover:scale-110 active:scale-95">🔍</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-slate-950/80 border-t border-slate-800 gap-4">
                                <span className="text-sm text-slate-400">
                                    Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, participantesFiltrados.length)} de {participantesFiltrados.length} registros
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-700 font-bold text-sm">Anterior</button>
                                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-700 font-bold text-sm">Siguiente</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL DEL CMS (GESTOR DE EVENTOS V3.0) */}
            {/* ============================================================== */}
            {showCMS && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button onClick={() => setShowCMS(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-white italic">GESTOR DE <span className="text-orange-500">CONFIGURACIÓN</span></h2>
                            <p className="text-slate-400 text-sm">Versión 3.0 - Control Total</p>
                        </div>

                        {loadingCMS ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <div className="w-10 h-10 border-4 border-slate-800 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                                <p>Cargando configuración...</p>
                            </div>
                        ) : (
                            <form onSubmit={guardarConfiguracion}>

                                <div className="flex border-b border-slate-800 mb-8 overflow-x-auto">
                                    <button type="button" onClick={() => setCmsTab('evento')} className={`flex-1 py-4 px-6 text-sm font-black tracking-widest uppercase transition-colors whitespace-nowrap ${cmsTab === 'evento' ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-500/5' : 'text-slate-500 hover:text-slate-300'}`}>1. Datos del Evento</button>
                                    <button type="button" onClick={() => setCmsTab('pagos')} className={`flex-1 py-4 px-6 text-sm font-black tracking-widest uppercase transition-colors whitespace-nowrap ${cmsTab === 'pagos' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}>2. Métodos de Pago</button>
                                    <button type="button" onClick={() => setCmsTab('legales')} className={`flex-1 py-4 px-6 text-sm font-black tracking-widest uppercase transition-colors whitespace-nowrap ${cmsTab === 'legales' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-300'}`}>3. Términos Legales</button>
                                </div>

                                <div className="min-h-[400px]">
                                    {/* PESTAÑA: EVENTO (IMAGEN CENTRAL GRANDE) */}
                                    {cmsTab === 'evento' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-slate-400 text-xs font-bold mb-2">Nombre del Evento Actual</label>
                                                <input required type="text" value={eventoActivo} onChange={(e) => setEventoActivo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs font-bold mb-2">Precio del Ticket (Texto Libre)</label>
                                                <input required type="text" value={precioTicket} onChange={(e) => setPrecioTicket(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs font-bold mb-2">Estado del Evento</label>
                                                <select value={estadoEvento} onChange={(e) => setEstadoEvento(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none">
                                                    <option value="ACTIVO">🟢 ACTIVO (Público puede comprar)</option>
                                                    <option value="CERRADO">🔴 CERRADO (Solo muestra info)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs font-bold mb-2">Meta de Tickets (Barra de progreso)</label>
                                                <input type="text" value={metaTickets} onChange={(e) => setMetaTickets(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs font-bold mb-2">Texto de Promoción (Opcional)</label>
                                                <input type="text" value={promoActiva} onChange={(e) => setPromoActiva(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none" />
                                            </div>

                                            <div className="col-span-1 md:col-span-2 mt-6 flex flex-col items-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
                                                <h3 className="text-white font-black uppercase text-sm tracking-wider mb-4">Flyer / Imagen Principal</h3>

                                                {flayerUrl && !flayerFile ? (
                                                    <div className="w-full max-w-sm aspect-[4/5] relative rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl mb-4 mx-auto">
                                                        <img src={obtenerUrlDirecta(flayerUrl)} alt="Flyer" className="w-full h-full object-cover" />
                                                    </div>
                                                ) : !flayerFile && (
                                                    <div className="w-full max-w-sm aspect-[4/5] flex flex-col gap-2 items-center justify-center bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-700 text-slate-500 mb-4 mx-auto">
                                                        <span className="text-4xl">📸</span>
                                                        <p>No hay flyer</p>
                                                    </div>
                                                )}

                                                {flayerFile && (
                                                    <div className="w-full max-w-sm py-8 flex flex-col items-center justify-center bg-orange-500/20 rounded-xl border-2 border-orange-500 text-orange-500 mb-4 mx-auto font-bold text-center">
                                                        <span className="text-4xl mb-2">✅</span>
                                                        <p>Nueva imagen seleccionada</p>
                                                        <p className="text-xs font-normal opacity-80">{flayerFile.name}</p>
                                                    </div>
                                                )}

                                                <div className="w-full max-w-sm mx-auto">
                                                    <input type="file" accept="image/*" onChange={(e) => setFlayerFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:uppercase file:tracking-wider file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer transition-all border border-slate-800 rounded-xl bg-slate-900" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* PESTAÑA: PAGOS (IMÁGENES CENTRALES GRANDES) */}
                                    {cmsTab === 'pagos' && (
                                        <div className="space-y-8 animate-fadeIn">

                                            <div className="bg-[#7408B5]/10 border border-[#7408B5]/30 rounded-2xl p-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 bg-[#7408B5] text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">Configuración de Yape</div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                    <div>
                                                        <label className="block text-[#D18BFF] text-xs font-bold mb-2">Nombre del Titular (Yape)</label>
                                                        <input type="text" value={yapeTitular} onChange={(e) => setYapeTitular(e.target.value)} className="w-full bg-slate-950 border border-[#7408B5]/50 rounded-xl px-4 py-3 text-white focus:border-[#D18BFF] outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[#D18BFF] text-xs font-bold mb-2">Número de Celular (Yape)</label>
                                                        <input type="text" value={yapeNumero} onChange={(e) => setYapeNumero(e.target.value)} className="w-full bg-slate-950 border border-[#7408B5]/50 rounded-xl px-4 py-3 text-white focus:border-[#D18BFF] outline-none" />
                                                    </div>

                                                    {/* QR YAPE CENTRADO */}
                                                    <div className="col-span-1 md:col-span-2 mt-4 flex flex-col items-center">
                                                        <label className="block text-[#D18BFF] text-xs font-bold mb-4 text-center">Subir Foto del QR de Yape</label>

                                                        {yapeQrUrl && !yapeQrFile ? (
                                                            <div className="w-full max-w-xs aspect-square relative rounded-xl overflow-hidden border-2 border-[#7408B5]/50 shadow-lg mb-4 mx-auto">
                                                                <img src={obtenerUrlDirecta(yapeQrUrl)} alt="QR Yape" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : !yapeQrFile && (
                                                            <div className="w-full max-w-xs aspect-square flex flex-col items-center justify-center bg-slate-950 rounded-xl border-2 border-dashed border-[#7408B5]/50 text-slate-500 mb-4 mx-auto">
                                                                <span className="text-4xl">📱</span>
                                                                <p className="text-xs mt-2">Sin QR</p>
                                                            </div>
                                                        )}

                                                        {yapeQrFile && (
                                                            <div className="w-full max-w-xs py-6 flex flex-col items-center justify-center bg-[#7408B5]/20 rounded-xl border-2 border-[#7408B5] text-[#D18BFF] mb-4 mx-auto font-bold text-center">
                                                                <span className="text-3xl mb-2">✅</span>
                                                                <p className="text-sm">Nuevo QR listo</p>
                                                            </div>
                                                        )}

                                                        <div className="w-full max-w-xs mx-auto">
                                                            <input type="file" accept="image/*" onChange={(e) => setYapeQrFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:bg-[#7408B5] file:text-white hover:file:bg-[#5b068f] cursor-pointer border border-[#7408B5]/30 rounded-xl bg-slate-950 transition-all" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-[#00D7D7]/10 border border-[#00D7D7]/30 rounded-2xl p-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 bg-[#00D7D7] text-slate-900 text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">Configuración de Plin</div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                    <div>
                                                        <label className="block text-[#00D7D7] text-xs font-bold mb-2">Nombre del Titular (Plin)</label>
                                                        <input type="text" value={plinTitular} onChange={(e) => setPlinTitular(e.target.value)} className="w-full bg-slate-950 border border-[#00D7D7]/50 rounded-xl px-4 py-3 text-white focus:border-[#00D7D7] outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[#00D7D7] text-xs font-bold mb-2">Número de Celular (Plin)</label>
                                                        <input type="text" value={plinNumero} onChange={(e) => setPlinNumero(e.target.value)} className="w-full bg-slate-950 border border-[#00D7D7]/50 rounded-xl px-4 py-3 text-white focus:border-[#00D7D7] outline-none" />
                                                    </div>

                                                    {/* QR PLIN CENTRADO */}
                                                    <div className="col-span-1 md:col-span-2 mt-4 flex flex-col items-center">
                                                        <label className="block text-[#00D7D7] text-xs font-bold mb-4 text-center">Subir Foto del QR de Plin</label>

                                                        {plinQrUrl && !plinQrFile ? (
                                                            <div className="w-full max-w-xs aspect-square relative rounded-xl overflow-hidden border-2 border-[#00D7D7]/50 shadow-lg mb-4 mx-auto">
                                                                <img src={obtenerUrlDirecta(plinQrUrl)} alt="QR Plin" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : !plinQrFile && (
                                                            <div className="w-full max-w-xs aspect-square flex flex-col items-center justify-center bg-slate-950 rounded-xl border-2 border-dashed border-[#00D7D7]/50 text-slate-500 mb-4 mx-auto">
                                                                <span className="text-4xl">📱</span>
                                                                <p className="text-xs mt-2">Sin QR</p>
                                                            </div>
                                                        )}

                                                        {plinQrFile && (
                                                            <div className="w-full max-w-xs py-6 flex flex-col items-center justify-center bg-[#00D7D7]/20 rounded-xl border-2 border-[#00D7D7] text-[#00D7D7] mb-4 mx-auto font-bold text-center">
                                                                <span className="text-3xl mb-2">✅</span>
                                                                <p className="text-sm">Nuevo QR listo</p>
                                                            </div>
                                                        )}

                                                        <div className="w-full max-w-xs mx-auto">
                                                            <input type="file" accept="image/*" onChange={(e) => setPlinQrFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:bg-[#00D7D7] file:text-slate-900 hover:file:bg-[#00baba] cursor-pointer border border-[#00D7D7]/30 rounded-xl bg-slate-950 transition-all" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {cmsTab === 'legales' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                                            <div className="col-span-1 md:col-span-2 mb-2">
                                                <p className="text-emerald-400 text-sm">Estos datos actualizarán automáticamente la página de <b>Términos y Condiciones</b>.</p>
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs font-bold mb-2">Fecha Exacta del Sorteo</label>
                                                <input type="text" value={tycFecha} onChange={(e) => setTycFecha(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs font-bold mb-2">Premio Principal a Entregar</label>
                                                <input type="text" value={tycPremio} onChange={(e) => setTycPremio(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs font-bold mb-2">Ciudad/Región de Entrega</label>
                                                <input type="text" value={tycRegion} onChange={(e) => setTycRegion(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs font-bold mb-2">Enlace a PDF Formal (Opcional)</label>
                                                <input type="text" value={tycPdf} onChange={(e) => setTycPdf(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end gap-4">
                                    <button type="button" onClick={() => setShowCMS(false)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancelar</button>
                                    <button type="submit" disabled={loadingCMS} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-900/20 transition-all disabled:opacity-50">
                                        {loadingCMS ? 'Guardando...' : '💾 GUARDAR CONFIGURACIÓN'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL DE DETALLES DEL USUARIO Y APROBACIÓN */}
            {/* ============================================================== */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center">✕</button>

                        <div className="mb-6 pb-6 border-b border-slate-800">
                            <h2 className="text-2xl font-black text-white italic capitalize">
                                {selectedUser.participante || `${selectedUser.nombres} ${selectedUser.apellidos}`.toLowerCase()}
                            </h2>
                            <p className="text-slate-400 font-mono text-sm mt-1">ID: {selectedUser.idRegistro}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documento</p>
                                    <p className="text-white font-mono">{selectedUser.tipoDoc || 'DNI'}: {selectedUser.documento}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</p>
                                    <p className="text-white">{selectedUser.celular}</p>
                                    <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ubicación</p>
                                    <p className="text-white text-sm">{selectedUser.ubicacion}</p>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Detalle de Compra</p>
                                    <p className="text-white">Evento: <span className="text-orange-400 font-bold">{selectedUser.evento}</span></p>
                                    <p className="text-white mt-1">Tickets: <span className="font-bold">{String(selectedUser.cantidad).split('+')[0]}</span></p>
                                    <p className="text-emerald-400 font-bold mt-1">Total Pagado: S/ {selectedUser.monto}</p>
                                </div>

                                {selectedUser.estado === 'APROBADO' && selectedUser.codigos && (
                                    <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-900/50">
                                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Tickets Generados</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUser.codigos.split(',').map((code, idx) => (
                                                <span key={idx} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-mono">
                                                    🎟️ {code.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Comprobante de Pago</p>
                                    {selectedUser.linkComprobante ? (
                                        <a href={selectedUser.linkComprobante} target="_blank" rel="noopener noreferrer" className="block w-full h-32 bg-slate-800 rounded-xl overflow-hidden group relative border border-slate-700">
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white font-bold text-sm bg-orange-600 px-4 py-2 rounded-lg">Ver Comprobante Completo</span>
                                            </div>
                                            <img src={obtenerUrlDirecta(selectedUser.linkComprobante)} alt="Comprobante" className="w-full h-full object-cover" />
                                        </a>
                                    ) : (
                                        <div className="w-full h-32 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-slate-600">Sin comprobante</div>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Estado Actual:
                                        <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${selectedUser.estado === 'APROBADO' ? 'bg-emerald-500/20 text-emerald-400' :
                                            selectedUser.estado === 'RECHAZADO' ? 'bg-red-500/20 text-red-400' :
                                                'bg-amber-500/20 text-amber-400'
                                            }`}>{selectedUser.estado || 'PENDIENTE'}</span>
                                    </p>

                                    {updatingStatus ? (
                                        <div className="text-center py-4 text-orange-400 font-bold animate-pulse">Actualizando estado y códigos...</div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <a href={obtenerLinkWhatsapp(selectedUser)} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-xl flex items-center justify-center transition" title="Enviar Mensaje por WhatsApp">📱</a>
                                            {selectedUser.estado !== 'APROBADO' && (<button onClick={() => actualizarEstado(selectedUser.idRegistro, 'APROBADO')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm transition-colors">✅ APROBAR</button>)}
                                            {selectedUser.estado !== 'RECHAZADO' && (<button onClick={() => actualizarEstado(selectedUser.idRegistro, 'RECHAZADO')} className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-300 border border-red-800/50 py-3 rounded-xl font-bold text-sm transition-colors">❌ RECHAZAR</button>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL DEL SORTEO EN VIVO */}
            {/* ============================================================== */}
            {showSorteo && (
                <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-orange-500/30 p-8 md:p-12 rounded-[3rem] w-full max-w-3xl text-center shadow-[0_0_100px_rgba(234,88,12,0.15)] relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-orange-600/5 blur-[100px] pointer-events-none"></div>
                        <button onClick={() => setShowSorteo(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white bg-slate-800 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors">✕</button>

                        <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4 uppercase">SORTEO <span className="text-orange-500">EN VIVO</span></h2>
                        <p className="text-slate-400 mb-12 uppercase tracking-widest text-sm">Chapa Tu Billete Oficial</p>

                        {!ganadorActual && !sorteando ? (
                            <div className="py-12">
                                <div className="text-8xl font-black text-slate-800 tracking-tighter mb-12 font-mono">00000</div>
                                <button onClick={iniciarSorteo} className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white px-12 py-5 rounded-2xl font-black text-xl tracking-wider shadow-[0_0_40px_rgba(234,88,12,0.4)] transition-all transform hover:scale-105">🎰 INICIAR RULETA</button>
                            </div>
                        ) : (
                            <div className="py-8">
                                <div className={`text-6xl md:text-8xl font-black tracking-tighter mb-8 font-mono transition-colors duration-300 ${sorteando ? 'text-orange-500 animate-pulse' : 'text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.4)]'}`}>
                                    {numeroAnimado}
                                </div>
                                {ganadorActual && (
                                    <div className="animate-fadeIn mt-8">
                                        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 mb-8 backdrop-blur-sm">
                                            <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-2">🏆 ¡TENEMOS GANADOR!</p>
                                            <h3 className="text-3xl font-black text-white capitalize mb-2">{ganadorActual?.nombres?.toLowerCase()} {ganadorActual?.apellidos?.toLowerCase()}</h3>
                                            <p className="text-xl text-slate-400 font-mono">DNI: {ganadorActual?.documento}</p>
                                            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">
                                                <p className="text-emerald-400 font-bold text-2xl tracking-widest">Ticket: {ticketSorteado}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 justify-center mt-8">
                                            <button onClick={reiniciarSorteo} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-bold">🔄 Nuevo Sorteo</button>
                                            <button onClick={() => setShowSorteo(false)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20">Cerrar y Validar</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
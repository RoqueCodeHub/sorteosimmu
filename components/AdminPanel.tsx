'use client'

// ==========================================
// 1. IMPORTS Y CONFIGURACIÓN
// ==========================================
import { useState, useEffect, useRef } from 'react'
import jsPDF from 'jspdf'

// URL del Google Apps Script
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1tHJ9cLeaViDfg03b9n_ddZprFQiAFpBsHqzos7660qt3Iog3C2CudRoGxVbtEw5DWQ/exec'

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

    // --- Datos y Carga ---
    const [participantes, setParticipantes] = useState<Participante[]>([])
    const [loading, setLoading] = useState(true)

    // --- Filtros y Búsqueda ---
    const [busqueda, setBusqueda] = useState('')
    const [busquedaTicket, setBusquedaTicket] = useState('')
    const [filtroEvento, setFiltroEvento] = useState('TODOS')
    const [filtroEstado, setFiltroEstado] = useState('TODOS')
    const [limiteVista, setLimiteVista] = useState(20)

    // --- UI e Interacciones ---
    const [selectedUser, setSelectedUser] = useState<Participante | null>(null)
    const [ultimoModificadoId, setUltimoModificadoId] = useState<string | null>(null)

    // Configuración del Modal de Confirmación
    const [modalConfig, setModalConfig] = useState({
        show: false,
        step: 'confirm', // 'confirm' | 'loading' | 'success'
        data: null as any
    });

    // --- NUEVO: ESTADOS PARA EL SORTEO DIGITAL (MODO TICKETS) ---
    const [showSorteo, setShowSorteo] = useState(false);
    const [sorteoState, setSorteoState] = useState('IDLE');
    const [nombrePantalla, setNombrePantalla] = useState('¿Quién será?');
    const [ganadorActual, setGanadorActual] = useState<Participante | null>(null);
    const [ticketSorteado, setTicketSorteado] = useState(''); // <--- IMPORTANTE: Guarda el ticket específico
    const [contadorIntentos, setContadorIntentos] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // ==========================================
    // 3. LÓGICA DE NEGOCIO (FUNCIONES)
    // ==========================================

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            setAuthorized(true)
            cargarDatos()
        } else {
            alert('Contraseña incorrecta')
        }
    }

    // --- Cargar Datos ---
    const cargarDatos = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${APPS_SCRIPT_URL}?accion=listarTodo`);
            const json = await res.json();

            if (json.success) {
                const dataValidada = json.data.map((p: any) => ({
                    ...p,
                    fecha: String(p.fecha || '---'),
                    nombres: String(p.nombres || ''),
                    apellidos: String(p.apellidos || ''),
                    participante: String(p.participante || 'Participante'),
                    codigos: String(p.codigos || ''),
                    celular: String(p.celular || ''),
                    estado: String(p.estado || 'PENDIENTE'),
                }));
                setParticipantes(dataValidada);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authorized) cargarDatos()
    }, [authorized])


    // --- Descargar Excel (CSV) ---
    const descargarCSV = () => {
        if (participantes.length === 0) return;
        const headers = ["Fecha", "Evento", "Participante", "DNI", "Cantidad", "Monto", "Estado", "Codigos"];
        const rows = participantes.map(p => [
            p.fecha, p.evento, p.participante, p.documento, p.cantidad, p.monto, p.estado, `"${p.codigos}"`
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
    };

    // --- Generar PDF de Tickets ---
    const generarTicketsPDF = () => {
        const listaTickets: { codigo: string; nombre: string; dni: string }[] = [];
        participantes.forEach(p => {
            if (p.estado === 'APROBADO' && p.codigos) {
                const cods = p.codigos.split(',').map(c => c.trim());
                cods.forEach(c => {
                    if (c) listaTickets.push({ codigo: c, nombre: p.participante, dni: p.documento });
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


    // --- Gestión de Modales (Aprobar/Rechazar) ---
    const abrirConfirmacion = (participante: Participante, nuevoEstado: string) => {
        setModalConfig({ show: true, step: 'confirm', data: { ...participante, nuevoEstado } });
    };

    const cerrarModalExito = () => {
        if (modalConfig.data) {
            setUltimoModificadoId(modalConfig.data.idRegistro);
            setTimeout(() => setUltimoModificadoId(null), 5000);
        }
        setModalConfig({ show: false, step: 'confirm', data: null });
    };

    // ==========================================
    // 4. GENERADOR DE MENSAJE WHATSAPP (NUEVA LÓGICA)
    // ==========================================
    const obtenerLinkWhatsapp = (p: Participante) => {
        const primerNombre = p.nombres.split(' ')[0] || 'Participante';
        const telefono = p.celular.replace(/\D/g, ''); // Solo números

        let mensaje = '';

        if (p.estado === 'APROBADO') {
            mensaje = `Hola ${primerNombre}. Somos IMMU GANA YA. 🥳\n\n` +
                `Tu pago ha sido verificado con éxito. Ya estás participando en el sorteo *${p.evento}*.\n\n` +
                `🎫 *TUS NÚMEROS ASIGNADOS:*\n` +
                `${p.codigos}\n\n` +
                `🔍 Consulta tus tickets con tu DNI aquí:\n` +
                `https://immuganacomigoya.com`;
        } else {
            // Mensaje genérico si aún no está aprobado
            mensaje = `Hola ${primerNombre}, te escribo de IMMU GANA YA para verificar tu inscripción en el sorteo *${p.evento}*...`;
        }

        return `https://wa.me/51${telefono}?text=${encodeURIComponent(mensaje)}`;
    };

    const actualizarEstado = (idRegistro: string, nuevoEstado: string) => {
        const p = participantes.find(item => item.idRegistro === idRegistro);
        if (p) abrirConfirmacion(p, nuevoEstado);
    };

    const ejecutarCambioEstado = async () => {
        if (!modalConfig.data) return;
        setModalConfig(prev => ({ ...prev, step: 'loading' }));
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    accion: 'actualizarEstado',
                    idRegistro: modalConfig.data.idRegistro,
                    nuevoEstado: modalConfig.data.nuevoEstado
                })
            });
            const result = await response.json();
            if (result.success || result.idRegistro) {
                setModalConfig(prev => ({ ...prev, step: 'success' }));
                cargarDatos();
            } else {
                throw new Error(result.message || "Error en el servidor");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al procesar.");
            setModalConfig({ show: false, step: 'confirm', data: null });
        }
    };

    // ==========================================
    // 4. NUEVO: LÓGICA SORTEO DIGITAL (JUSTO POR TICKETS)
    // ==========================================

    const iniciarSorteoDigital = () => {
        const aptos = participantes.filter(p => p.estado === 'APROBADO');
        if (aptos.length < 3) {
            alert("Necesitas al menos 3 participantes APROBADOS para hacer el sorteo.");
            return;
        }
        setShowSorteo(true);
        setSorteoState('IDLE');
        setContadorIntentos(0);
        setNombrePantalla('¿Quién será?');
    };

    const girarTombola = () => {
        const aptos = participantes.filter(p => p.estado === 'APROBADO');
        if (aptos.length === 0) return;

        setSorteoState('GIRANDO');

        // Animación visual (nombres pasando rápido)
        intervalRef.current = setInterval(() => {
            const randomIdx = Math.floor(Math.random() * aptos.length);
            setNombrePantalla(aptos[randomIdx].participante);
        }, 50);

        // Duración del giro
        const duracion = contadorIntentos === 2 ? 6000 : 3000;

        setTimeout(() => {
            detenerTombola(aptos);
        }, duracion);
    };

    const detenerTombola = (listaAptos: Participante[]) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        // 1. CREAR EL "UNIVERSO" DE TICKETS
        // Esto desglosa cada código para que tengan probabilidad individual
        let universoTickets: { participante: Participante, codigo: string }[] = [];

        listaAptos.forEach(p => {
            if (p.codigos) {
                const listaCodigos = p.codigos.split(',').map(c => c.trim()).filter(c => c !== '');
                listaCodigos.forEach(codigo => {
                    universoTickets.push({ participante: p, codigo: codigo });
                });
            }
        });

        if (universoTickets.length === 0) {
            alert("No hay tickets generados para sortear.");
            setSorteoState('IDLE');
            return;
        }

        // 2. ELEGIR UN TICKET AL AZAR (Equidad matemática)
        const elegido = universoTickets[Math.floor(Math.random() * universoTickets.length)];

        // 3. GUARDAR RESULTADOS
        setGanadorActual(elegido.participante);
        setTicketSorteado(elegido.codigo); // Guardamos qué ticket exacto ganó/perdió
        setNombrePantalla(elegido.participante.participante);

        setSorteoState('RESULTADO');
        setContadorIntentos(prev => prev + 1);
    };

    const reiniciarSorteo = () => {
        setContadorIntentos(0);
        setSorteoState('IDLE');
        setNombrePantalla('¿Quién será?');
    };


    // ==========================================
    // 5. CÁLCULOS Y FILTROS
    // ==========================================

    const filtrados = participantes.filter(p => {
        const coincideBusqueda = p.participante.toLowerCase().includes(busqueda.toLowerCase()) || p.documento.includes(busqueda);
        const listaCodigos = p.codigos ? p.codigos.split(',').map(c => c.trim()) : [];
        const coincideTicket = busquedaTicket === '' || listaCodigos.includes(busquedaTicket);
        const coincideEvento = filtroEvento === 'TODOS' || p.evento === filtroEvento;
        const coincideEstado = filtroEstado === 'TODOS' || (filtroEstado === 'PENDIENTES' ? p.estado !== 'APROBADO' && p.estado !== 'RECHAZADO' : p.estado === filtroEstado);
        return coincideBusqueda && coincideTicket && coincideEvento && coincideEstado;
    });

    const vistaFinal = [...filtrados].reverse().slice(0, limiteVista === 9999 ? undefined : limiteVista);
    const totalRecaudado = filtrados.filter(p => p.estado === 'APROBADO').reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
    const totalTickets = filtrados.filter(p => p.estado === 'APROBADO').reduce((acc, p) => acc + (parseInt(p.cantidad) || 0), 0);
    const eventosDisponibles = ['TODOS', ...Array.from(new Set(participantes.map(p => String(p.evento || ''))))];


    // ==========================================
    // 6. RENDERIZADO (JSX)
    // ==========================================

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
                <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">Acceso Administrativo</h2>
                    <input type="password" placeholder="Contraseña" className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-orange-500 mb-4 text-white text-center" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 transition py-3 rounded-lg font-bold shadow-lg shadow-orange-900/20">Entrar al Panel</button>
                </form>
            </div>
        )
    }

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200">
            <div className="max-w-[1400px] mx-auto">

                {/* HEADER */}
                <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-orange-500 tracking-tight">Panel de Control Sorteos</h1>
                        <p className="text-slate-400 text-sm">Administración y verificación de participantes.</p>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                        {/* --- BOTÓN SORTEO DIGITAL --- */}
                        <button onClick={iniciarSorteoDigital} className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-2 rounded-lg hover:brightness-110 transition text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-purple-900/40 animate-pulse">
                            🎲 MODO SORTEO
                        </button>

                        <button onClick={descargarCSV} className="bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium text-white flex items-center gap-2">📥 Excel</button>
                        <button onClick={generarTicketsPDF} className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium text-white flex items-center gap-2">🖨️ PDF</button>
                        <button onClick={cargarDatos} className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition text-sm font-medium">🔄 Refrescar</button>
                        <button onClick={() => setAuthorized(false)} className="bg-red-900/20 text-red-400 border border-red-900/50 px-4 py-2 rounded-lg hover:bg-red-900/40 transition text-sm font-medium">Salir</button>
                    </div>
                </div>

                {/* KPIS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg ring-1 ring-emerald-500/10">
                        <p className="text-slate-500 text-xs uppercase font-black tracking-widest mb-1">Total Recaudado</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-emerald-500">S/ {totalRecaudado.toFixed(2)}</span>
                            <span className="text-slate-600 text-xs italic">Aprobado</span>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg ring-1 ring-orange-500/10">
                        <p className="text-slate-500 text-xs uppercase font-black tracking-widest mb-1">Tickets Vendidos</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-orange-500">{totalTickets}</span>
                            <span className="text-slate-600 text-xs italic">Unidades</span>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg ring-1 ring-blue-500/10">
                        <p className="text-slate-500 text-xs uppercase font-black tracking-widest mb-1">Viendo Registros</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-blue-500">{vistaFinal.length}</span>
                            <span className="text-slate-600 text-xs italic">de {filtrados.length} encontrados</span>
                        </div>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="flex flex-col xl:flex-row gap-4 mb-6">
                    <div className="flex-1 relative min-w-[200px]">
                        <input type="text" placeholder="Buscar nombre o DNI..." className="w-full p-3 pl-10 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-orange-500 transition shadow-inner text-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        <span className="absolute left-3 top-3 text-slate-500 text-sm">🔍</span>
                    </div>
                    <div className="relative w-full xl:w-40">
                        <input type="text" placeholder="N° Ticket" className="w-full p-3 pl-10 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-orange-500 transition shadow-inner text-sm text-orange-500 font-bold placeholder:text-slate-600 placeholder:font-normal" value={busquedaTicket} onChange={(e) => setBusquedaTicket(e.target.value)} />
                        {busquedaTicket && (<button onClick={() => setBusquedaTicket('')} className="absolute right-3 top-3 text-slate-500 hover:text-white text-xs">✕</button>)}
                        <span className="absolute left-3 top-3 text-sm">🎫</span>
                    </div>
                    <div className="w-full xl:w-48">
                        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={`w-full p-3 rounded-xl border outline-none transition cursor-pointer text-sm font-bold ${filtroEstado === 'PENDIENTES' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : filtroEstado === 'APROBADO' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                            <option value="TODOS">⚡ Todos</option>
                            <option value="PENDIENTES">⏳ Solo Pendientes</option>
                            <option value="APROBADO">✅ Aprobados</option>
                            <option value="RECHAZADO">🚫 Rechazados</option>
                        </select>
                    </div>
                    <div className="w-full xl:w-56">
                        <select value={filtroEvento} onChange={(e) => setFiltroEvento(e.target.value)} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-orange-500 transition cursor-pointer text-slate-300 text-sm">
                            {eventosDisponibles.map(evento => (<option key={evento} value={evento}>{evento === 'TODOS' ? '📅 Todos los Eventos' : evento}</option>))}
                        </select>
                    </div>
                    <div className="w-full xl:w-32">
                        <select value={limiteVista} onChange={(e) => setLimiteVista(Number(e.target.value))} className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-blue-500 transition cursor-pointer text-slate-300 text-sm">
                            <option value={10}>Ver 10</option>
                            <option value={20}>Ver 20</option>
                            <option value={50}>Ver 50</option>
                            <option value={9999}>Ver Todos</option>
                        </select>
                    </div>
                </div>

                {/* TABLA PRINCIPAL */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-2xl bg-slate-900/40 backdrop-blur-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Evento</th>
                                <th className="p-4">Participante</th>
                                <th className="p-4">DNI</th>
                                <th className="p-4">Comprobante</th>
                                <th className="p-4 text-center">Cant.</th>
                                <th className="p-4 text-center">Monto</th>
                                <th className="p-4 text-center">Estado</th>
                                <th className="p-4 text-center">Acciones</th>
                                <th className="p-4 text-center">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (<tr><td colSpan={10} className="p-12 text-center text-slate-500 animate-pulse">Cargando registros...</td></tr>)
                                : vistaFinal.length === 0 ? (<tr><td colSpan={10} className="p-12 text-center text-slate-500">No se encontraron registros.</td></tr>)
                                    : vistaFinal.map((p, i) => (
                                        <tr key={i} className={`transition-all duration-1000 ${p.idRegistro === ultimoModificadoId ? 'bg-emerald-500/30 ring-2 ring-emerald-500 inset-0 z-10 scale-[1.01] shadow-xl' : 'hover:bg-slate-800/40'}`}>
                                            <td className="p-4 text-[11px] text-slate-500 font-medium whitespace-nowrap">{p.fecha}</td>
                                            <td className="p-4 text-sm font-medium text-slate-300">{p.evento}</td>
                                            <td className="p-4 text-sm">{p.participante}</td>
                                            <td className="p-4 text-sm text-slate-400 font-mono">{p.documento}</td>
                                            <td className="p-4"><a href={p.linkComprobante} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline text-xs flex items-center gap-1">📄 Ver</a></td>
                                            <td className="p-4 text-sm text-center font-bold text-slate-300">{p.cantidad}</td>
                                            <td className="p-4 text-sm text-center font-bold text-emerald-500 whitespace-nowrap">S/ {p.monto}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.estado === 'APROBADO' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : p.estado === 'RECHAZADO' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'}`}>{p.estado}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2 justify-center items-center">
                                                    {/* BOTÓN WHATSAPP */}
                                                    <a
                                                        href={obtenerLinkWhatsapp(p)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-500 hover:text-green-400 font-bold bg-green-900/20 p-2 rounded-md hover:bg-green-900/40 transition"
                                                        title={p.estado === 'APROBADO' ? "Enviar Tickets al Cliente" : "Contactar Cliente"}
                                                    >
                                                        📱Ir a WhatsApp
                                                    </a>
                                                    {p.estado !== 'APROBADO' && (<button onClick={() => actualizarEstado(p.idRegistro, 'APROBADO')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-medium transition">Aprobar</button>)}
                                                    <button onClick={() => actualizarEstado(p.idRegistro, 'RECHAZADO')} className="bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-md text-xs font-medium transition border border-red-900/50">Rechazar</button>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center"><button onClick={() => setSelectedUser(p)} className="bg-slate-800 hover:bg-orange-500 text-white p-2 rounded-full transition-all shadow-lg hover:scale-110 active:scale-95">🔍</button></td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-wrap gap-3 justify-left">
                    {/* --- BOTÓN SORTEO DIGITAL --- */}
                    <button onClick={descargarCSV} className="bg-emerald-600 px-6 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium text-white flex items-center gap-2">📥 Excel</button>
                    <button onClick={generarTicketsPDF} className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium text-white flex items-center gap-2">🖨️ PDF</button>
                    <button onClick={cargarDatos} className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition text-sm font-medium">🔄 Refrescar</button>
                    <button onClick={() => setAuthorized(false)} className="bg-red-900/20 text-red-400 border border-red-900/50 px-4 py-2 rounded-lg hover:bg-red-900/40 transition text-sm font-medium">Salir</button>
                </div>

            </div>

            {/* MODAL DETALLE (FICHA) */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
                            <div><h3 className="text-xl font-bold text-orange-500">Ficha Técnica</h3><p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">ID Registro: {selectedUser.idRegistro}</p></div>
                            <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white text-3xl transition">&times;</button>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-6">
                                <div><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Datos del Usuario</h4><p className="text-slate-100 text-lg font-bold leading-tight">{selectedUser.participante}</p><p className="text-slate-400 text-sm mt-1">{selectedUser.tipoDoc}: {selectedUser.documento}</p></div>
                                <div><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Contacto Directo</h4><p className="text-slate-200">📧 {selectedUser.email}</p><p className="text-slate-200">📞 {selectedUser.celular}</p></div>
                                <div><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Ubicación</h4><p className="text-slate-200 italic font-light">{selectedUser.ubicacion}</p></div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/50 shadow-inner">
                                    <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4">Información de Compra</h4>
                                    <div className="flex justify-between items-end mb-4"><div><p className="text-slate-500 text-[10px] uppercase">Cantidad</p><p className="text-slate-100 font-bold text-xl">{selectedUser.cantidad} <span className="text-xs font-normal text-slate-500">Tickets</span></p></div><div className="text-right"><p className="text-slate-500 text-[10px] uppercase">Total</p><p className="text-orange-400 font-bold text-xl">S/ {selectedUser.monto}</p></div></div>
                                    <div className="pt-4 border-t border-slate-800"><p className="text-slate-500 text-[10px] uppercase mb-1">Códigos del Sorteo</p><p className="text-green-500 font-mono text-sm leading-relaxed bg-green-500/5 p-2 rounded-lg border border-green-500/10">{selectedUser.codigos || "Aún no se han generado códigos"}</p></div>
                                </div>
                                <div><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Evidencia de Pago</h4><a href={selectedUser.linkComprobante} target="_blank" className="w-full flex items-center justify-center gap-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white py-3 rounded-xl border border-blue-500/30 transition-all font-bold text-xs uppercase">Ver Comprobante</a></div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-800/30 text-right border-t border-slate-800"><button onClick={() => setSelectedUser(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-2.5 rounded-xl transition font-bold text-sm">Cerrar Detalle</button></div>
                    </div>
                </div>
            )}

            {/* MODAL CONFIRMACION ESTADO */}
            {modalConfig.show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-center ring-1 ring-white/10">
                        {modalConfig.step === 'confirm' && (
                            <><div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${modalConfig.data?.nuevoEstado === 'APROBADO' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'}`}><span className="text-2xl">{modalConfig.data?.nuevoEstado === 'APROBADO' ? '🎫' : '🚫'}</span></div><h3 className="text-xl font-bold text-white">¿{modalConfig.data?.nuevoEstado} Participación?</h3><p className="mt-2 text-sm text-slate-400">Participante: <br /><span className="text-slate-200 font-bold">{modalConfig.data?.participante}</span></p><div className="mt-8 flex gap-3"><button onClick={() => setModalConfig({ show: false, step: 'confirm', data: null })} className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-700 transition">CANCELAR</button><button onClick={ejecutarCambioEstado} className={`flex-1 rounded-xl py-3 text-sm font-bold text-white transition shadow-lg ${modalConfig.data?.nuevoEstado === 'APROBADO' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}`}>CONFIRMAR</button></div></>
                        )}
                        {modalConfig.step === 'loading' && (<div className="py-8"><div className="relative mx-auto h-16 w-16"><div className="absolute inset-0 rounded-full border-4 border-slate-800"></div><div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div></div><h3 className="mt-6 text-lg font-black text-white uppercase tracking-tighter">{modalConfig.data?.nuevoEstado === 'APROBADO' ? 'APROBANDO...' : 'RECHAZANDO...'}</h3><p className="mt-2 text-xs text-slate-500 italic">Por favor, no cierres esta ventana</p></div>)}
                        {modalConfig.step === 'success' && (
                            <><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><span className="text-3xl">✅</span></div><h3 className="text-xl font-bold text-white">¡Proceso Completado!</h3><p className="mt-3 text-sm text-slate-400 leading-relaxed">El usuario ha sido <span className="text-emerald-500 font-bold">{modalConfig.data?.nuevoEstado}</span>.{modalConfig.data?.nuevoEstado === 'APROBADO' && " Sus tickets han sido generados y enviados a su correo electrónico."}</p><button onClick={cerrarModalExito} className="mt-8 w-full rounded-xl bg-emerald-600 py-4 text-sm font-black text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 uppercase tracking-widest">ENTENDIDO</button></>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL SORTEO DIGITAL (FINAL con lógica de Tickets) */}
            {showSorteo && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
                    <button onClick={() => setShowSorteo(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white text-4xl">&times;</button>
                    <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-600 mb-8 uppercase tracking-tighter">Gran Sorteo</h2>
                    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 p-12 rounded-3xl text-center w-full max-w-4xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500"></div>

                        {sorteoState !== 'RESULTADO' && (
                            <div className="space-y-8">
                                <div className="h-32 flex items-center justify-center"><p className={`text-5xl md:text-7xl font-black text-white transition-all ${sorteoState === 'GIRANDO' ? 'blur-sm scale-110' : ''}`}>{nombrePantalla}</p></div>
                                <div className="flex gap-4 justify-center">
                                    <button disabled={sorteoState === 'GIRANDO'} onClick={girarTombola} className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-12 py-6 rounded-2xl text-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-900/30 transition-all active:scale-95">{sorteoState === 'GIRANDO' ? 'Girando...' : (contadorIntentos === 2 ? '🔥 ¡GIRAR POR EL PREMIO! 🔥' : `Girar #${contadorIntentos + 1}`)}</button>
                                </div>
                                <p className="text-slate-500 uppercase tracking-widest text-sm font-bold">Intento {contadorIntentos + 1} de 3</p>
                            </div>
                        )}

                        {sorteoState === 'RESULTADO' && (
                            <div className="animate-in zoom-in duration-300">
                                {contadorIntentos < 3 ? (
                                    // VISTA: AL AGUA (Ticket eliminado)
                                    <div className="space-y-6">
                                        <div className="text-8xl mb-4">🌊</div>
                                        <h3 className="text-5xl font-black text-slate-300 uppercase">¡AL AGUA!</h3>

                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 inline-block min-w-[300px]">
                                            <p className="text-2xl text-slate-200 font-bold">{ganadorActual?.participante}</p>
                                            <p className="text-red-400 font-mono text-lg mt-1 border-t border-slate-700 pt-2">
                                                Ticket al agua: <span className="font-bold text-xl">{ticketSorteado}</span>
                                            </p>
                                        </div>

                                        <p className="text-slate-500 text-sm">Este ticket ya no juega. ¡Suerte para la próxima!</p>
                                        <button onClick={() => { setSorteoState('IDLE'); setNombrePantalla('¿Quién sigue?'); }} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl text-lg font-bold mt-4">Siguiente Intento ➡️</button>
                                    </div>
                                ) : (
                                    // VISTA: GANADOR FINAL (Con ticket específico)
                                    <div className="space-y-6 relative">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"><span className="text-9xl animate-spin-slow">✨</span></div>
                                        <div className="text-8xl mb-4 animate-bounce">🏆</div>
                                        <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase drop-shadow-sm">¡GANADOR!</h3>

                                        <div className="bg-slate-800/80 p-6 rounded-2xl border border-yellow-500/30">
                                            <p className="text-4xl text-white font-black mb-2">{ganadorActual?.participante}</p>
                                            <p className="text-xl text-slate-400 font-mono">DNI: {ganadorActual?.documento}</p>

                                            {/* AQUÍ MOSTRAMOS EL TICKET EXACTO GANADOR */}
                                            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">
                                                <p className="text-emerald-400 font-bold text-2xl tracking-widest">
                                                    Ticket: {ticketSorteado}
                                                </p>
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
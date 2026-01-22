'use client'

import { useState, useEffect } from 'react'

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

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1tHJ9cLeaViDfg03b9n_ddZprFQiAFpBsHqzos7660qt3Iog3C2CudRoGxVbtEw5DWQ/exec'


export default function AdminPanel() {
    const [authorized, setAuthorized] = useState(false)
    const [password, setPassword] = useState('')
    const [participantes, setParticipantes] = useState<Participante[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [busquedaTicket, setBusquedaTicket] = useState('')
    const [selectedUser, setSelectedUser] = useState<Participante | null>(null)
    const [filtroEvento, setFiltroEvento] = useState('TODOS')
    const ADMIN_PASSWORD = 'arce'
    const [ultimoModificadoId, setUltimoModificadoId] = useState<string | null>(null);

    // para controlar tres estados en el modal: CONFIRMACIÓN → CARGANDO → ÉXITO/ERROR.
    const [modalConfig, setModalConfig] = useState({
        show: false,
        step: 'confirm', // 'confirm' | 'loading' | 'success'
        data: null as any
    });

    //para descargar a excel
    const descargarCSV = () => {
        if (participantes.length === 0) return;

        // Encabezados del archivo
        const headers = ["Fecha", "Evento", "Participante", "DNI", "Cantidad", "Monto", "Estado", "Codigos"];

        // Crear las filas
        const rows = participantes.map(p => [
            p.fecha,
            p.evento,
            p.participante,
            p.documento,
            p.cantidad,
            p.monto,
            p.estado,
            `"${p.codigos}"` // Entre comillas por si hay comas
        ]);

        // Unir todo con punto y coma (mejor para Excel en español)
        const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");

        // Crear el archivo y descargarlo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_sorteo_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Función unificada para abrir el modal de confirmación
    const abrirConfirmacion = (participante: Participante, nuevoEstado: string) => {
        setModalConfig({
            show: true,
            step: 'confirm',
            data: { ...participante, nuevoEstado }
        });
    };

    const ejecutarCambioEstado = async () => {
        if (!modalConfig.data) return;

        const participanteData = modalConfig.data;
        setModalConfig(prev => ({ ...prev, step: 'loading' }));

        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                // Eliminamos no-cors para poder leer el JSON de respuesta
                body: JSON.stringify({
                    accion: 'actualizarEstado',
                    idRegistro: participanteData.idRegistro,
                    nuevoEstado: participanteData.nuevoEstado
                })
            });

            const result = await response.json();

            if (result.success || result.idRegistro) {
                setModalConfig(prev => ({ ...prev, step: 'success' }));
                cargarDatos(); // Recarga la tabla de fondo
            } else {
                throw new Error(result.message || "Error en el servidor");
            }
        } catch (error) {
            console.error("Error detallado:", error);
            alert("Error al procesar: El servidor tardó mucho o hubo un fallo de red.");
            setModalConfig({ show: false, step: 'confirm', data: null });
        }
    };

    //visualizacion del ultimo registro
    const cerrarModalExito = () => {
        if (modalConfig.data) {
            // Guardamos el ID para resaltarlo en la tabla
            setUltimoModificadoId(modalConfig.data.idRegistro);

            // Hacemos que el resalte desaparezca solo después de 5 segundos
            setTimeout(() => setUltimoModificadoId(null), 5000);
        }
        // Cerramos el modal
        setModalConfig({ show: false, step: 'confirm', data: null });
    };
    // Reemplazamos la lógica antigua de actualizarEstado para que use el modal
    const actualizarEstado = (idRegistro: string, nuevoEstado: string) => {
        const p = participantes.find(item => item.idRegistro === idRegistro);
        if (p) abrirConfirmacion(p, nuevoEstado);
    };


    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (password === ADMIN_PASSWORD) {
            setAuthorized(true)
            cargarDatos()
        } else {
            alert('Contraseña incorrecta')
        }
    }

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${APPS_SCRIPT_URL}?accion=listarTodo`);
            const json = await res.json();
            if (json.success) {
                const dataValidada = json.data.map((p: any) => ({
                    ...p,
                    // Simplemente nos aseguramos que sea un string, sin procesar nada
                    fecha: String(p.fecha || '---'),
                }));
                setParticipantes(dataValidada);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (authorized) cargarDatos()
    }, [authorized])

    // --- LÓGICA DE FILTRADO Y CÁLCULOS ACTUALIZADA ---
    const filtrados = participantes.filter(p => {
        // Filtro por Nombre o DNI
        const coincideBusqueda = p.participante.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.documento.includes(busqueda);

        // Filtro por Número de Ticket (Búsqueda exacta)
        // Convertimos "1034, 1035" en un array ["1034", "1035"] para evitar que al buscar "10" salga el "1034"
        const listaCodigos = p.codigos ? p.codigos.split(',').map(c => c.trim()) : [];
        const coincideTicket = busquedaTicket === '' || listaCodigos.includes(busquedaTicket);

        const coincideEvento = filtroEvento === 'TODOS' || p.evento === filtroEvento;

        return coincideBusqueda && coincideTicket && coincideEvento;
    });

    const eventosDisponibles = ['TODOS', ...Array.from(new Set(participantes.map(p => String(p.evento || ''))))];

    const totalRecaudado = filtrados
        .filter(p => p.estado === 'APROBADO')
        .reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);

    const totalTickets = filtrados
        .filter(p => p.estado === 'APROBADO')
        .reduce((acc, p) => acc + (parseInt(p.cantidad) || 0), 0);

    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
                <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">Acceso Administrativo</h2>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-orange-500 mb-4 text-white text-center"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 transition py-3 rounded-lg font-bold shadow-lg shadow-orange-900/20">
                        Entrar al Panel
                    </button>
                </form>
            </div>
        )
    }


    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-orange-500 tracking-tight">Panel de Control Sorteos</h1>
                        <p className="text-slate-400 text-sm">Administración y verificación de participantes.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={descargarCSV} className="bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium text-white flex items-center gap-2">
                            📥 Descargar Excel
                        </button>
                        <button onClick={cargarDatos} className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition text-sm font-medium">
                            🔄 Refrescar
                        </button>
                        <button onClick={() => setAuthorized(false)} className="bg-red-900/20 text-red-400 border border-red-900/50 px-4 py-2 rounded-lg hover:bg-red-900/40 transition text-sm font-medium">
                            Salir
                        </button>
                    </div>
                </div>

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
                        <p className="text-slate-500 text-xs uppercase font-black tracking-widest mb-1">Total Registros (Vista)</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-blue-500">{filtrados.length}</span>
                            <span className="text-slate-600 text-xs italic">Registros</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* BUSCADOR POR TEXTO */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o DNI..."
                            className="w-full p-4 pl-12 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-orange-500 transition shadow-inner"
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <span className="absolute left-4 top-4.5 text-slate-500">🔍</span>
                    </div>
                    <div className="md:w-48 relative">
                        <input
                            type="text"
                            placeholder="N° Ticket..."
                            className="w-full p-4 pl-12 rounded-xl bg-slate-900 border border-orange-500/50 outline-none focus:border-orange-500 transition shadow-inner text-orange-500 font-bold placeholder:font-normal placeholder:text-slate-600"
                            value={busquedaTicket}
                            onChange={(e) => setBusquedaTicket(e.target.value)}
                        />
                        {busquedaTicket && (
                            <button
                                onClick={() => setBusquedaTicket('')}
                                className="absolute right-3 top-4 text-slate-500 hover:text-white"
                            >
                                ✕
                            </button>
                        )}
                        <span className="absolute left-4 top-4.5">🎫</span>
                    </div>
                    {/* FILTRO POR EVENTO */}
                    <div className="md:w-64">
                        <select
                            value={filtroEvento}
                            onChange={(e) => setFiltroEvento(e.target.value)}
                            className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 outline-none focus:border-orange-500 transition cursor-pointer text-slate-300"
                        >
                            {eventosDisponibles.map(evento => (
                                <option key={evento} value={evento}>
                                    {evento === 'TODOS' ? '📅 Todos los Eventos' : evento}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

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
                            {loading ? (
                                <tr><td colSpan={10} className="p-12 text-center text-slate-500 animate-pulse">Cargando registros...</td></tr>
                            ) : filtrados.length === 0 ? (
                                <tr><td colSpan={10} className="p-12 text-center text-slate-500">No se encontraron registros.</td></tr>
                            ) : filtrados.map((p, i) => (
                                <tr key={i} className={`transition-all duration-1000 ${p.idRegistro === ultimoModificadoId
                                    ? 'bg-emerald-500/30 ring-2 ring-emerald-500 inset-0 z-10 scale-[1.01] shadow-xl'
                                    : 'hover:bg-slate-800/40'
                                    }`}>
                                    <td className="p-4 text-[11px] text-slate-500 font-medium whitespace-nowrap">{p.fecha}</td>
                                    <td className="p-4 text-sm font-medium text-slate-300">{p.evento}</td>
                                    <td className="p-4 text-sm">{p.participante}</td>
                                    <td className="p-4 text-sm text-slate-400 font-mono">{p.documento}</td>
                                    <td className="p-4">
                                        <a href={p.linkComprobante} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline text-xs flex items-center gap-1">
                                            📄 Ver
                                        </a>
                                    </td>
                                    <td className="p-4 text-sm text-center font-bold text-slate-300">{p.cantidad}</td>
                                    <td className="p-4 text-sm text-center font-bold text-emerald-500 whitespace-nowrap">S/ {p.monto}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.estado === 'APROBADO' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-orange-500/20 text-orange-400 border border-orange-500/20'}`}>
                                            {p.estado}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2 justify-center">
                                            {p.estado !== 'APROBADO' && (
                                                <button
                                                    onClick={() => actualizarEstado(p.idRegistro, 'APROBADO')}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs font-medium transition"
                                                >
                                                    Aprobar
                                                </button>
                                            )}
                                            <button
                                                onClick={() => actualizarEstado(p.idRegistro, 'RECHAZADO')}
                                                className="bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-md text-xs font-medium transition border border-red-900/50"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => setSelectedUser(p)} className="bg-slate-800 hover:bg-orange-500 text-white p-2 rounded-full transition-all shadow-lg hover:scale-110 active:scale-95">
                                            🔍
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='p-2 bg-slate-950 min-h-screen text-slate-200'>
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex gap-3">

                            <button onClick={descargarCSV} className="bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm font-medium text-white flex items-center gap-2">
                                📥 Descargar Excel
                            </button>
                            <button onClick={cargarDatos} className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition text-sm font-medium">
                                🔄 Refrescar
                            </button>
                            <button onClick={() => setAuthorized(false)} className="bg-red-900/20 text-red-400 border border-red-900/50 px-4 py-2 rounded-lg hover:bg-red-900/40 transition text-sm font-medium">
                                Salir
                            </button>

                        </div>
                    </div>
                </div>

            </div>

            {
                selectedUser && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                        <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
                                <div>
                                    <h3 className="text-xl font-bold text-orange-500">Ficha Técnica</h3>
                                    <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">ID Registro: {selectedUser.idRegistro}</p>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white text-3xl transition">&times;</button>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Datos del Usuario</h4>
                                        <p className="text-slate-100 text-lg font-bold leading-tight">{selectedUser.participante}</p>
                                        <p className="text-slate-400 text-sm mt-1">{selectedUser.tipoDoc}: {selectedUser.documento}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Contacto Directo</h4>
                                        <p className="text-slate-200">📧 {selectedUser.email}</p>
                                        <p className="text-slate-200">📞 {selectedUser.celular}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Ubicación</h4>
                                        <p className="text-slate-200 italic font-light">{selectedUser.ubicacion}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/50 shadow-inner">
                                        <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-4">Información de Compra</h4>
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <p className="text-slate-500 text-[10px] uppercase">Cantidad</p>
                                                <p className="text-slate-100 font-bold text-xl">{selectedUser.cantidad} <span className="text-xs font-normal text-slate-500">Tickets</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-slate-500 text-[10px] uppercase">Total</p>
                                                <p className="text-orange-400 font-bold text-xl">S/ {selectedUser.monto}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-800">
                                            <p className="text-slate-500 text-[10px] uppercase mb-1">Códigos del Sorteo</p>
                                            <p className="text-green-500 font-mono text-sm leading-relaxed bg-green-500/5 p-2 rounded-lg border border-green-500/10">
                                                {selectedUser.codigos || "Aún no se han generado códigos"}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Evidencia de Pago</h4>
                                        <a href={selectedUser.linkComprobante} target="_blank" className="w-full flex items-center justify-center gap-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white py-3 rounded-xl border border-blue-500/30 transition-all font-bold text-xs uppercase">
                                            Ver Comprobante
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-800/30 text-right border-t border-slate-800">
                                <button onClick={() => setSelectedUser(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-2.5 rounded-xl transition font-bold text-sm">
                                    Cerrar Detalle
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* MODAL DE PROCESAMIENTO para mostrar aprobación o rechazo */}
            {
                modalConfig.show && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                        <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-center ring-1 ring-white/10">

                            {/* PASO 1: CONFIRMACIÓN */}
                            {modalConfig.step === 'confirm' && (
                                <>
                                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${modalConfig.data?.nuevoEstado === 'APROBADO' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'}`}>
                                        <span className="text-2xl">{modalConfig.data?.nuevoEstado === 'APROBADO' ? '🎫' : '🚫'}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">¿{modalConfig.data?.nuevoEstado} Participación?</h3>
                                    <p className="mt-2 text-sm text-slate-400">
                                        Participante: <br />
                                        <span className="text-slate-200 font-bold">{modalConfig.data?.participante}</span>
                                    </p>
                                    <div className="mt-8 flex gap-3">
                                        <button
                                            onClick={() => setModalConfig({ show: false, step: 'confirm', data: null })}
                                            className="flex-1 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white hover:bg-slate-700 transition"
                                        >
                                            CANCELAR
                                        </button>
                                        <button
                                            onClick={ejecutarCambioEstado}
                                            className={`flex-1 rounded-xl py-3 text-sm font-bold text-white transition shadow-lg ${modalConfig.data?.nuevoEstado === 'APROBADO' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'}`}
                                        >
                                            CONFIRMAR
                                        </button>
                                    </div>

                                </>
                            )}

                            {/* PASO 2: CARGANDO */}
                            {modalConfig.step === 'loading' && (
                                <div className="py-8">
                                    <div className="relative mx-auto h-16 w-16">
                                        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                                    </div>
                                    <h3 className="mt-6 text-lg font-black text-white uppercase tracking-tighter">
                                        {modalConfig.data?.nuevoEstado === 'APROBADO' ? 'APROBANDO PARTICIPACIÓN...' : 'RECHAZANDO...'}
                                    </h3>
                                    <p className="mt-2 text-xs text-slate-500 italic">Por favor, no cierres esta ventana</p>
                                </div>
                            )}

                            {/* PASO 3: ÉXITO */}
                            {modalConfig.step === 'success' && (
                                <>
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                                        <span className="text-3xl">✅</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">¡Proceso Completado!</h3>
                                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                                        El usuario ha sido <span className="text-emerald-500 font-bold">{modalConfig.data?.nuevoEstado}</span>.
                                        {modalConfig.data?.nuevoEstado === 'APROBADO' && " Sus tickets han sido generados y enviados a su correo electrónico."}
                                    </p>
                                    <button
                                        onClick={cerrarModalExito} // <--- CAMBIA ESTO
                                        className="mt-8 w-full rounded-xl bg-emerald-600 py-4 text-sm font-black text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 uppercase tracking-widest"
                                    >
                                        ENTENDIDO
                                    </button>
                                </>
                            )}

                        </div>
                    </div>
                )
            }
        </div >
    )
}
// ConfirmationModal.tsx

import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    id: string; // El ID de registro para mostrar
    onClose: () => void; // Función para cerrar el modal
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ id, onClose }) => {
    return (
        // Overlay (Fondo oscuro)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Contenido del Modal */}
            <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full relative transform transition-all duration-300 scale-100">
                
                {/* Botón de cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Cerrar modal"
                >
                    <X size={24} />
                </button>

                {/* Icono de éxito */}
                <div className="text-center mb-6">
                    <CheckCircle size={64} className="text-green-500 mx-auto" /> 
                </div>

                {/* Título y Mensaje MEJORADO */}
                <h2 className="text-3xl font-bold text-center text-green-700 mb-3">
                    ¡Participación Confirmada! 
                </h2>
                
                <p className="text-center text-xl text-black font-semibold mb-4">
                    ¡Estás dentro del sorteo! 🎉
                </p>

                <p className="text-center text-gray-700 mb-6 leading-relaxed">
                    La validación de tu comprobante de pago está en curso. Una vez aprobada, recibirás tu *Código de Sorteo Oficial y los detalles completos* directamente en tu *Correo Electrónico*.
                </p>
                
                <p className="text-center text-lg font-bold text-orange-600 mb-8">
                    ¡Mucha Suerte! 🍀
                </p>


                {/* Detalles del ID de registro (se mantiene) */}
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400 mb-8">
                    <p className="font-semibold text-gray-700">Tu ID de Registro es:</p>
                    <p className="text-xl font-extrabold text-green-800 break-words">{id}</p>
                </div>
                <p className="text-center text-lg font-bold text-orange-600 mb-8">
                    Verifica tu correo spam
                </p>

                {/* Botón de acción */}
                <button
                    onClick={onClose}
                    className="w-full px-4 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition"
                >
                    Aceptar
                </button>

            </div>
        </div>
    );
};
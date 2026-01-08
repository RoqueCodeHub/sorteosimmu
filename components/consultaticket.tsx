'use client'

import { useState } from 'react'

interface Resultado {
  codigos: string[]
}

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxEnQkvBYUqXlkUKcTSclH2O-0L0Odz7i5sF9F5CueaAzQUhPy4NPkYD4LbWm4cjyf6QA/exec'

export default function ConsultarCodigo() {
  const [documento, setDocumento] = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const buscarCodigo = async () => {
    if (!documento.trim()) {
      setError('Ingrese su DNI o CE')
      return
    }

    setLoading(true)
    setError('')
    setResultado(null)

    try {
      const response = await fetch(
        `${APPS_SCRIPT_URL}?accion=buscar&documento=${encodeURIComponent(
          documento.trim()
        )}`
      )

      const data = await response.json()

      if (!data.success) {
        setError(data.message || 'No se encontraron códigos')
      } else {
        setResultado(data.data)
      }
      // CORRECCIÓN: Argumento 'err' cambiado a '_err' (no usado)
    } catch {
      setError('Error al consultar el código')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    buscarCodigo()
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-900 via-black to-orange-900 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white/10 backdrop-blur-md p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          ¡Consulta tu Código de Participación!
        </h1>

        <h2 className="text-center text-lg mb-6">
          Consultar Código por DNI / CE
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ingrese DNI o CE"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            className="w-full mb-4 rounded-lg px-4 py-3 bg-white text-black"
          />

          <button
            type="submit"
            disabled={loading || !documento.trim()}
            className="w-full bg-orange-700 hover:bg-orange-800 transition rounded-lg py-3 font-semibold disabled:opacity-60"
          >
            {loading ? 'Buscando...' : 'Buscar Código'}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-400 text-center">{error}</p>
        )}

        {resultado && (
          <div className="mt-6 bg-green-600/20 border border-green-500 rounded-lg p-4 text-center">
            <p className="text-lg mb-3">Tus códigos son:</p>

            <ul className="space-y-2">
              {resultado.codigos.map((codigo, index) => (
                <li
                  key={index}
                  className="text-2xl font-bold bg-black/30 rounded-md py-2"
                >
                  {codigo}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
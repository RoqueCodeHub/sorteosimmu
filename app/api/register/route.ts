import { NextResponse } from "next/server";

// 🚨 ATENCIÓN: Asegúrate de que esta URL sea la más reciente y correcta de tu Implementación Web App.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5G80PRdfad6eSk_KYOrfsInp98JArt4Js1sccLahby3ZwkPQFAK0dLjLOjL-_6kXINA/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Opcional: validaciones mínimas en servidor
    if (!body.nombres || !body.apellidos || !body.email) {
      return NextResponse.json({ status: "error", message: "Campos requeridos faltantes" }, { status: 400 });
    }

    // 1. Reenvía al Apps Script como JSON
    const resp = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // 2. Manejo de respuesta (Intentamos leer como JSON)
    let data;
    try {
        // CORRECCIÓN 1: Argumento de catch 'e' cambiado a '_e' (no usado)
        // Lee la respuesta como JSON. Si el Apps Script retorna HTML de error,
        // esto lanzará una excepción y lo capturamos abajo.
        data = await resp.json(); 
    } catch { 
        // Si no se pudo parsear como JSON (ej: Apps Script retornó HTML o texto plano de error),
        // Leemos el cuerpo como texto y lo usamos como mensaje de error detallado.
        const errorText = await resp.text(); 
        
        // Devolvemos un error con los detalles del texto HTML/plano de Google.
        console.error("Error de Apps Script (no JSON):", errorText);
        return NextResponse.json(
            { status: "error", message: "Error del servidor externo. Revise logs de Apps Script." },
            { status: resp.status || 500 }
        );
    }
    
    // 3. Devolvemos la respuesta JSON recibida del Apps Script (sea success o error).
    return NextResponse.json(data);
    
  // CORRECCIÓN 2: Eliminado ': any' del catch para evitar el error de tipado explícito.
  } catch (err) {
    console.error("API /api/registro error:", err);
    // Error de red o en la lectura del body de la solicitud inicial
    return NextResponse.json({ status: "error", message: "Error interno del servidor proxy." }, { status: 500 });
  }
}
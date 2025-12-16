// /app/page.tsx
// ESTE ARCHIVO ES UN COMPONENTE DE SERVIDOR POR DEFECTO

import { Suspense } from 'react';
import HomeClient from "@/components/HomeClient";


export default function Home() {
  return (
    <>
      
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xl font-bold">Cargando sitio...</div>}>
        <HomeClient />
      </Suspense>
      
    </>
  );
}
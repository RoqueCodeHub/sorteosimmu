import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. CONFIGURACIÓN CLAVE para la exportación estática
  output: "export", 

  // 2. OPCIONAL: Recomendado si usas next/image
  images: {
    unoptimized: true,
  },

  /* Puedes añadir cualquier otra opción de configuración aquí */
};

export default nextConfig;
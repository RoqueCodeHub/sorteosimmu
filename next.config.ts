/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Esto evita errores si usas trailing slashes en tus rutas
  trailingSlash: true,
};

export default nextConfig;
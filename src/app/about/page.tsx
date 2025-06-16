'use client';

import { FaHeart, FaArrowLeft, FaUser } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const router = useRouter(); // Obtener el objeto router

  const handleGoBack = () => {
    router.back(); // Llama a la función back del router
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      {/* Encabezado Rojo */}
      <header className="bg-red-600 p-4 w-full"></header>

      <div className="flex flex-1">
        {/* Contenido Principal de Favoritos */}
        <div className="flex-1 p-8">
          {/* Título de la Página */}
          <div className="text-center text-3xl font-bold mb-12">
            Como funciona el scrapper?
          </div>
        </div>

        {/* Iconos de Navegación Lateral Derecha */}
        <div className="flex flex-col items-center justify-center p-4 border-l border-gray-200">
          <div className="p-4 border-2 border-solid mb-6 mt-6 hover:bg-gray-100 transition-colors cursor-pointer">
            {/* Botón de Regresar */}
            <button onClick={handleGoBack} className="flex items-center justify-center w-full h-full">
              <FaArrowLeft size={30} />
            </button>
          </div>
          <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer">
            <Link href={"/login"}>
              <FaUser size={30} />
            </Link>
          </div>
          <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer">
            <Link href={"/favorites"}>
              < FaHeart size={30} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
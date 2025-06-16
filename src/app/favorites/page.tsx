'use client';

import { FaArrowLeft, FaUser, FaFilter } from "react-icons/fa";
import { IoIosInformationCircle } from "react-icons/io";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
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
            Favoritos
          </div>

          {/* Opciones de Filtro y Ordenación */}
          <div className="flex justify-center space-x-4 mb-12">
            <button className="flex items-center px-6 py-3 bg-gray-200 rounded-lg text-lg font-medium hover:bg-gray-300 transition-colors">
              <FaFilter className="mr-2 text-xl" />
              Filtrar productos
            </button>
            <button className="flex items-center px-6 py-3 bg-gray-200 rounded-lg text-lg font-medium hover:bg-gray-300 transition-colors">
              Ordenar por
              <MdOutlineKeyboardArrowDown className="ml-2 text-xl" />
            </button>
          </div>

          {/* Espacios para Productos Favoritos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {/* Estos div representan las tarjetas de productos favoritos */}
            <div className="aspect-square bg-gray-100 border border-gray-300 rounded-lg shadow-sm"></div>
            <div className="aspect-square bg-gray-100 border border-gray-300 rounded-lg shadow-sm"></div>
            <div className="aspect-square bg-gray-100 border border-gray-300 rounded-lg shadow-sm"></div>
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
            <Link href={"/about"}>
              <IoIosInformationCircle size={30} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
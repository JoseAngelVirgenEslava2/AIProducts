import { FaHeart, FaSearch, FaFilter, FaUser } from 'react-icons/fa';
import { IoIosInformationCircle } from 'react-icons/io';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      {/* Encabezado */}
      <header className="bg-red-600 p-4 text-white text-center text-xl font-bold">
        Pagina web
      </header>

      <div className="flex flex-1">
        {/* Contenido Principal */}
        <div className="flex-1 p-8">
          {/* Barra de Búsqueda */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Buscar producto"
                className="w-full py-3 pl-5 pr-12 border-2 border-purple-500 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-2xl" />
            </div>
          </div>

          {/* Filtros y Categorías */}
          <div className="flex justify-center space-x-4 mb-12">
            <button className="flex items-center px-6 py-3 bg-gray-200 rounded-lg text-lg font-medium hover:bg-gray-300 transition-colors">
              <FaFilter className="mr-2 text-xl" />
              Filtrar productos
            </button>
            <button className="flex items-center px-6 py-3 bg-gray-200 rounded-lg text-lg font-medium hover:bg-gray-300 transition-colors">
              Categorías
              <MdOutlineKeyboardArrowDown className="ml-2 text-xl" />
            </button>
          </div>

          {/* Productos Destacados */}
          <div className="text-center text-2xl font-semibold mb-8">
            Productos destacados
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {/* Espacios para productos destacados */}
            <div className="aspect-square bg-gray-100 border border-gray-300 rounded-lg shadow-sm"></div>
            <div className="aspect-square bg-gray-100 border border-gray-300 rounded-lg shadow-sm"></div>
            <div className="aspect-square bg-gray-100 border border-gray-300 rounded-lg shadow-sm"></div>
          </div>
        </div>

        {/* Iconos de Navegación Lateral */}
        <div className="flex flex-col items-center justify-center p-4 border-l border-gray-200">
          <div className="p-4 border-2 border-solid mb-6 mt-6 hover:bg-gray-100 transition-colors cursor-pointer">
            <Link href="/favorites">
              <FaHeart size={30} />
            </Link>
          </div>
          <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer">
            <Link href="/login">
              <FaUser size={30} />
            </Link>
          </div>
          <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer">
            <Link href="/about">
              <IoIosInformationCircle size={30} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

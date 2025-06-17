'use client';

import { useState } from 'react';
import { FaHeart, FaSearch, FaFilter, FaUser } from 'react-icons/fa';
import { IoIosInformationCircle } from 'react-icons/io';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  url: string;
  source: string;
  image: string; // <-- ¡Nueva propiedad para la URL de la imagen!
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setCargando(true);
    try {
      // Asegúrate de que tu servidor Python esté corriendo en http://localhost:5000
      const pythonBackendUrl = `http://localhost:5000/search?q=${encodeURIComponent(query)}`;
      
      console.log(`Realizando solicitud al backend Python: ${pythonBackendUrl}`);
      const res = await fetch(pythonBackendUrl);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error en el backend Python: ${errorData.error || res.statusText}`);
      }

      const data: Product[] = await res.json(); // Los datos ahora vienen de Python
      console.log('Productos obtenidos del backend Python:', data);
      setResultados(data);
    } catch (err) {
      console.error('Error al buscar productos:', err);
      setResultados([]); // Limpia los resultados en caso de error
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      <header className="bg-red-600 p-4 text-white text-center text-xl font-bold">
        Pagina web
      </header>

      <div className="flex flex-1">
        <div className="flex-1 p-8">
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Buscar producto"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full py-3 pl-5 pr-12 border-2 border-purple-500 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button onClick={handleSearch} className="absolute right-4 top-1/2 -translate-y-1/2">
                <FaSearch className="text-gray-500 text-2xl" />
              </button>
            </div>
          </div>

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

          <div className="text-center text-2xl font-semibold mb-8">
            {cargando ? 'Buscando productos...' : 'Resultados de búsqueda'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {resultados.length === 0 && !cargando && query ? (
              <p className="text-center text-gray-500 col-span-full">
                No se encontraron resultados para {query}.
              </p>
            ) : null}
            {resultados.map((p) => (
              <div key={p.id} className="border border-gray-300 rounded-lg shadow p-4 flex flex-col items-center">
                {/* Contenedor de imagen: Asegura un tamaño y manejo de carga */}
                <div className="w-full h-48 mb-4 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    width={100}
                    height={100}
                    src={p.image}
                    alt={p.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // Evita bucle infinito si la imagen de respaldo falla
                      e.currentTarget.src = "https://placehold.co/200x200/cccccc/ffffff?text=No+Image"; // Imagen de respaldo
                      e.currentTarget.alt = "Imagen no disponible";
                    }}
                  />
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-center">{p.name}</h3>
                <p className="text-gray-600 mb-1">{p.price} {p.currency}</p>
                <p className="text-sm text-gray-400 mb-2">Fuente: {p.source}</p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer" // Recomendado por seguridad
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver producto
                </a>
              </div>
            ))}
          </div>
        </div>

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

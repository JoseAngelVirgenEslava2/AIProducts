'use client';

import { FaArrowLeft, FaUser, FaFilter, FaHeart, FaTrashAlt } from "react-icons/fa"; // Agregamos FaTrashAlt
import { IoIosInformationCircle } from "react-icons/io";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';

// Interfaz para el producto favorito tal como se guarda en la base de datos
interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  url: string;
  image: string;
  source: string;
  addedAt: string; // La fecha se recibirá como string
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'none' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'addedAt-asc' | 'addedAt-desc'>('addedAt-desc');
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  // Función para cargar los favoritos
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      setError("Necesitas iniciar sesión para ver tus favoritos.");
      setLoading(false);
      // Opcional: Redirigir al login si no hay sesión
      // router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Incluye el token JWT
        },
      });

      const data = await res.json();

      if (res.ok) {
        setFavoriteProducts(data.favorites || []); // Asegura que sea un array
      } else {
        setError(data.error || "Error al cargar favoritos.");
        // Si el token es inválido o expirado, limpia la sesión
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userId');
          alert("Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente.");
          router.push('/login');
        }
      }
    } catch (err) {
      console.error("Error al obtener favoritos:", err);
      setError("Error de conexión al cargar favoritos: " + err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Cargar favoritos al montar el componente
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Lógica de ordenamiento para favoritos
  const sortedFavoriteProducts = useMemo(() => {
    const currentProducts = [...favoriteProducts];

    switch (sortBy) {
      case 'name-asc':
        currentProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        currentProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        currentProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        currentProducts.sort((a, b) => b.price - a.price);
        break;
      case 'addedAt-asc':
        currentProducts.sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
        break;
      case 'addedAt-desc':
        currentProducts.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        break;
      default:
        break;
    }
    return currentProducts;
  }, [favoriteProducts, sortBy]);

  const handleGoBack = () => {
    router.back();
  };

  // --- NUEVA FUNCIÓN: ELIMINAR DE FAVORITOS ---
  const handleRemoveFavorite = useCallback(async (productId: string) => {
    // Reemplaza window.confirm con una implementación de modal personalizada si estás en un entorno restringido.
    // Por ahora, para la funcionalidad, usamos confirm.
    if (!confirm("¿Estás seguro de que quieres eliminar este producto de tus favoritos?")) {
      return;
    }

    const token = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      alert("No se encontró la sesión. Por favor, inicia sesión nuevamente.");
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/favorites/remove', {
        method: 'DELETE', // Método DELETE
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: productId }), // Envía el ID del producto
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Producto eliminado de favoritos.");
        // Actualiza la lista de favoritos en el frontend después de la eliminación
        setFavoriteProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      } else {
        alert(data.error || "Error al eliminar de favoritos.");
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userId');
          router.push('/login');
        }
      }
    } catch (err) {
      console.error("Error al eliminar de favoritos:", err);
      alert("Error de conexión al intentar eliminar de favoritos: " + err);
    }
  }, [router]);


  return (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      {/* Encabezado Rojo */}
      <header className="bg-red-600 p-4 w-full text-white text-center text-xl font-bold rounded-b-lg shadow-md">
        Mis Productos Favoritos
      </header>

      <div className="flex flex-1">
        {/* Contenido Principal de Favoritos */}
        <div className="flex-1 p-8">
          <div className="text-center text-3xl font-bold mb-12 text-purple-700">
            Tus Favoritos
          </div>

          {/* Opciones de Filtro y Ordenación */}
          <div className="flex justify-center space-x-4 mb-12">
            <div className="relative">
              <button
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                className="flex items-center px-6 py-3 bg-gray-200 rounded-lg text-lg font-medium hover:bg-gray-300 transition-colors shadow-sm"
              >
                <FaFilter className="mr-2 text-xl" />
                Filtrar / Ordenar
                <MdOutlineKeyboardArrowDown className={`ml-2 text-xl transition-transform ${showFilterOptions ? 'rotate-180' : ''}`} />
              </button>
              {showFilterOptions && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-t-lg"
                    onClick={() => { setSortBy('name-asc'); setShowFilterOptions(false); }}
                  >
                    Nombre (A-Z)
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => { setSortBy('name-desc'); setShowFilterOptions(false); }}
                  >
                    Nombre (Z-A)
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => { setSortBy('price-asc'); setShowFilterOptions(false); }}
                  >
                    Precio (Menor a Mayor)
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => { setSortBy('price-desc'); setShowFilterOptions(false); }}
                  >
                    Precio (Mayor a Menor)
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => { setSortBy('addedAt-desc'); setShowFilterOptions(false); }}
                  >
                    Fecha de Añadido (Más Reciente)
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-b-lg"
                    onClick={() => { setSortBy('addedAt-asc'); setShowFilterOptions(false); }}
                  >
                    Fecha de Añadido (Más Antiguo)
                  </button>
                  {sortBy !== 'none' && (
                    <button
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-100 rounded-b-lg border-t border-gray-200"
                        onClick={() => { setSortBy('none'); setShowFilterOptions(false); }}
                    >
                        Quitar Filtros
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {loading && <p className="text-center text-gray-600 text-xl mt-8">Cargando favoritos...</p>}
          {error && <p className="text-center text-red-600 text-xl mt-8">{error}</p>}
          {!loading && !error && favoriteProducts.length === 0 && (
            <p className="text-center text-gray-500 text-xl mt-8">
              No tienes productos favoritos aún. ¡Explora y añade algunos!
            </p>
          )}

          {/* Cuadrícula de Productos Favoritos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
            {sortedFavoriteProducts.map((p: FavoriteProduct) => (
              <div key={p.id} className="border border-gray-300 rounded-lg shadow-md p-4 flex flex-col items-center bg-white hover:shadow-lg transition-shadow duration-200 relative">
                {/* Ícono de Corazón Rojo para indicar que es favorito */}
                <FaHeart className="absolute top-3 right-10 text-red-500" size={24} />
                {/* Nuevo botón para eliminar producto */}
                <button 
                  onClick={() => handleRemoveFavorite(p.id)} 
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-700 transition-colors z-10"
                  title="Eliminar de favoritos"
                >
                  <FaTrashAlt size={20} />
                </button>
                
                {/* Contenedor de imagen */}
                <div className="w-full h-48 mb-4 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.name}
                    height={300}
                    width={300}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://placehold.co/200x200/cccccc/ffffff?text=No+Image`;
                      e.currentTarget.alt = "Imagen no disponible";
                    }}
                  />
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-center text-gray-800 leading-tight">{p.name}</h3>
                <p className="text-green-700 font-semibold text-xl mb-1">{p.currency} {p.price.toLocaleString('es-MX')}</p>
                <p className="text-xs text-gray-400 mb-2">Fuente: {p.source}</p>
                <p className="text-xs text-gray-500 italic">Añadido: {new Date(p.addedAt).toLocaleDateString()}</p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Ver producto
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Iconos de Navegación Lateral Derecha */}
        <div className="flex flex-col items-center justify-center p-4 border-l border-gray-200 bg-gray-50">
          <div className="p-4 border-2 border-solid mb-6 mt-6 hover:bg-gray-100 transition-colors cursor-pointer rounded-full">
            {/* Botón de Regresar */}
            <button onClick={handleGoBack} className="flex items-center justify-center w-full h-full">
              <FaArrowLeft size={30} className="text-gray-500" />
            </button>
          </div>
          <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer rounded-full">
            <Link href={"/login"}>
              <FaUser size={30} className="text-blue-500" />
            </Link>
          </div>
          <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer rounded-full">
            <Link href={"/about"}>
              <IoIosInformationCircle size={30} className="text-gray-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

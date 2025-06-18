'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { FaHeart, FaSearch, FaFilter, FaUser, FaSortAlphaDown, FaSortAlphaUp, FaSortNumericDown, FaSortNumericUp, FaTimes, FaTags, FaLightbulb } from 'react-icons/fa';
import { IoIosInformationCircle } from 'react-icons/io';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  bef_price: number | null;
  currency: string;
  url: string;
  image: string;
  source: string;
  seller_rating: number | null;
  seller_reviews: number | null;
  historical_deal_score: number | null;
  score?: number; 
  discount_percentage?: number;
  best_time_to_buy_message?: string;
  reasoning?: string;
}

const PRODUCTS_PER_PAGE = 10;

export default function Home() {
  const [query, setQuery] = useState('');
  const [allResults, setAllResults] = useState<Product[]>([]);
  const [displayedProductsCount, setDisplayedProductsCount] = useState(PRODUCTS_PER_PAGE);
  const [cargando, setCargando] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [showTopProductsModal, setShowTopProductsModal] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para verificar sesión

  // Lógica de ordenamiento
  const [sortBy, setSortBy] = useState<'none' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('none');

  // Comprueba la sesión al cargar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      const userId = localStorage.getItem('userId');
      console.log('useEffect en Home - Estado inicial del token/userId:', { token, userId }); // DEPURACIÓN
      setIsLoggedIn(!!token && !!userId); // Si hay token Y userId, el usuario está logueado
    }
  }, []);

  const handleLoadMore = () => {
    setDisplayedProductsCount(prevCount => prevCount + PRODUCTS_PER_PAGE);
  };

  const handleSearch = useCallback(async () => {
    if (!query) return;
    setCargando(true);
    setDisplayedProductsCount(PRODUCTS_PER_PAGE);
    setShowFilterOptions(false);
    setTopProducts([]);

    try {
      const pythonBackendUrl = `http://localhost:5000/search?q=${encodeURIComponent(query)}`;
      console.log(`Realizando solicitud al backend Python: ${pythonBackendUrl}`);
      const res = await fetch(pythonBackendUrl);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error en el backend Python: ${errorData.error || res.statusText}`);
      }

      const data: Product[] = await res.json();
      setAllResults(data);
      console.log('Productos obtenidos del backend Python:', data);
    } catch (err) {
      console.error('Error al buscar productos:', err);
      setAllResults([]);
    } finally {
      setCargando(false);
    }
  }, [query]);

  // Productos que se muestran en la UI después de ordenar y paginar
  const displayedAndSortedProducts = useMemo(() => {
    const currentProducts = [...allResults];

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
      default:
        break;
    }

    return currentProducts.slice(0, displayedProductsCount);
  }, [allResults, displayedProductsCount, sortBy]);

  // Lógica para encontrar los mejores productos (Análisis con API de IA)
  const findBestProducts = useCallback(async () => {
    if (allResults.length === 0) {
      alert("No hay productos para analizar. Por favor, realiza una búsqueda primero.");
      return;
    }

    setAiAnalysisLoading(true);
    setTopProducts([]);

    const productsToSendToAI = allResults.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      bef_price: p.bef_price,
      currency: p.currency,
      seller_rating: p.seller_rating,
      seller_reviews: p.seller_reviews,
      historical_deal_score: p.historical_deal_score
    }));

    try {
      const aiAnalysisUrl = `http://localhost:5000/analyze-products`;
      const res = await fetch(aiAnalysisUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productsToSendToAI),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error en el análisis de IA del backend: ${errorData.error || res.statusText}`);
      }

      const aiResponse = await res.json();
      console.log('Respuesta de la IA:', aiResponse);

      const bestProductId = aiResponse.best_product_id;
      const aiReasoning = aiResponse.reasoning;
      const aiAdvice = aiResponse.best_time_to_buy_advice;

      const bestProductFromAI = allResults.find(p => p.id === bestProductId);

      if (bestProductFromAI) {
        const productWithAIAnalysis = {
          ...bestProductFromAI,
          reasoning: aiReasoning,
          best_time_to_buy_message: aiAdvice,
          discount_percentage: (bestProductFromAI.bef_price !== null && bestProductFromAI.bef_price > bestProductFromAI.price && bestProductFromAI.bef_price > 0)
            ? ((bestProductFromAI.bef_price - bestProductFromAI.price) / bestProductFromAI.bef_price) * 100
            : 0
        };
        setTopProducts([productWithAIAnalysis]);

      } else {
        alert("La IA no pudo identificar el mejor producto o el ID no se encontró.");
        setTopProducts([]);
      }

      setShowTopProductsModal(true);

    } catch (err) {
      console.error('Error al analizar productos con IA:', err);
      alert(`Error al analizar productos con IA: ${err}. Verifica la consola para más detalles.`);
      setTopProducts([]);
    } finally {
      setAiAnalysisLoading(false);
    }
  }, [allResults]);

  // --- FUNCIÓN: AGREGAR A FAVORITOS ---
  const handleAddToFavorites = useCallback(async (product: Product) => {
    console.log('Intentando agregar a favoritos. isLoggedIn:', isLoggedIn);
    const token = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');
    console.log('Tokens en handleAddToFavorites:', { token, userId });

    if (!isLoggedIn || !token || !userId) { // Triple verificación para mayor seguridad
      alert("Necesitas iniciar sesión para agregar productos a favoritos.");
      // Limpia el localstorage por si acaso la sesión estaba corrupta
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
      setIsLoggedIn(false); 
      return;
    }

    try {
      const favoriteProductData = {
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        url: product.url,
        image: product.image,
        source: product.source,
      };

      const res = await fetch('http://localhost:5000/favorites/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Incluye el token JWT
        },
        body: JSON.stringify(favoriteProductData),
      });

      const data = await res.json();
      console.log('Respuesta del backend al agregar favoritos:', data);

      if (res.ok) {
        alert(data.message || "Producto agregado a favoritos.");
      } else {
        if (res.status === 401 || res.status === 403) {
            alert("Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente.");
            localStorage.removeItem('userToken');
            localStorage.removeItem('userId');
            setIsLoggedIn(false);
        } else {
            alert(data.error || "Error al agregar a favoritos.");
        }
      }
    } catch (err) {
      console.error("Error al agregar a favoritos:", err);
      alert("Error de conexión al intentar agregar a favoritos: " + err);
    }
  }, [isLoggedIn]);


  return (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      <header className="bg-red-600 p-4 text-white text-center text-xl font-bold rounded-b-lg shadow-md">
        Página web de Análisis de Productos
      </header>

      <div className="flex flex-1">
        {/* Contenido principal */}
        <div className="flex-1 p-8">
          {/* Barra de búsqueda */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Buscar producto (ej. 'laptop', 'celular samsung')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full py-3 pl-5 pr-12 border-2 border-purple-500 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm"
              />
              <button onClick={handleSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800 transition-colors">
                <FaSearch className="text-2xl" />
              </button>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-center space-x-4 mb-12">
            {/* Botón de filtrar productos */}
            <div className="relative">
              <button
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                className="flex items-center px-6 py-3 bg-gray-200 rounded-lg text-lg font-medium hover:bg-gray-300 transition-colors shadow-sm"
              >
                <FaFilter className="mr-2 text-xl" />
                Filtrar productos
                <MdOutlineKeyboardArrowDown className={`ml-2 text-xl transition-transform ${showFilterOptions ? 'rotate-180' : ''}`} />
              </button>
              {showFilterOptions && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-t-lg"
                    onClick={() => { setSortBy('name-asc'); setShowFilterOptions(false); }}
                  >
                    <FaSortAlphaDown className="mr-2" /> Nombre (A-Z)
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => { setSortBy('name-desc'); setShowFilterOptions(false); }}
                  >
                    <FaSortAlphaUp className="mr-2" /> Nombre (Z-A)
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => { setSortBy('price-asc'); setShowFilterOptions(false); }}
                  >
                    <FaSortNumericDown className="mr-2" /> Precio (Menor a Mayor)
                  </button>
                  <button
                    className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-b-lg"
                    onClick={() => { setSortBy('price-desc'); setShowFilterOptions(false); }}
                  >
                    <FaSortNumericUp className="mr-2" /> Precio (Mayor a Menor)
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

            {/*"Encontrar los mejores productos" */}
            <button
              onClick={findBestProducts}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
              disabled={aiAnalysisLoading}
            >
              {aiAnalysisLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analizando...
                </>
              ) : (
                <>
                  <FaLightbulb className="mr-2 text-xl" />
                  Encontrar el mejor producto
                </>
              )}
            </button>
          </div>

          <div className="text-center text-2xl font-semibold mb-8">
            {cargando ? 'Buscando productos...' : 'Resultados de búsqueda'}
          </div>

          {/* Mostrar mensaje si no hay resultados */}
          {allResults.length === 0 && !cargando && query && (
            <p className="text-center text-gray-500 col-span-full">
              No se encontraron resultados para {query}.
            </p>
          )}

          {/* Cuadrícula de productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
            {displayedAndSortedProducts.map((p) => (
              <div key={p.id} className="border border-gray-300 rounded-lg shadow-md p-4 flex flex-col items-center bg-white hover:shadow-lg transition-shadow duration-200 relative">
                {/* Botón de favoritos, visible solo si el usuario está logueado */}
                {isLoggedIn && (
                  <button 
                    onClick={() => handleAddToFavorites(p)} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors z-10"
                    title="Agregar a favoritos"
                  >
                    <FaHeart size={24} />
                  </button>
                )}
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
                {/* Muestra el precio anterior solo si existe */}
                {p.bef_price !== null && (
                    <p className="text-gray-500 font-semibold text-sm mb-1 line-through">
                        {p.currency} {p.bef_price.toLocaleString('es-MX')}
                    </p>
                )}
                <p className="text-green-700 font-semibold text-xl mb-1">{p.currency} {p.price.toLocaleString('es-MX')}</p>
                
                <p className="text-sm text-gray-500 mb-2">
                    Vendedor: {p.seller_rating !== null ? `${p.seller_rating} ★` : 'N/A'}
                    {p.seller_reviews !== null ? ` ${p.seller_reviews} reviews` : ''}
                </p>
                <p className="text-xs text-gray-400 mb-2">Fuente: {p.source}</p>
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

          {/*"Mostrar más productos" */}
          {allResults.length > displayedProductsCount && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-8 py-4 bg-purple-600 text-white rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors shadow-md"
              >
                Mostrar más productos ({Math.min(allResults.length - displayedProductsCount, PRODUCTS_PER_PAGE)} restantes)
              </button>
            </div>
          )}
        </div>

        {/* Barra lateral derecha */}
        <div className="flex flex-col items-center justify-center p-4 border-l border-gray-200 bg-gray-50">
          <div className="p-4 border-2 border-solid mb-6 mt-6 hover:bg-gray-100 transition-colors cursor-pointer rounded-full">
            <Link href="/favorites">
              <FaHeart size={30} className="text-red-500" />
            </Link>
          </div>
          <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer rounded-full">
            <Link href="/login">
              <FaUser size={30} className="text-blue-500" />
            </Link>
          </div>
          <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer rounded-full">
            <Link href="/about">
              <IoIosInformationCircle size={30} className="text-gray-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal para "Mejores Productos" */}
      {showTopProductsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowTopProductsModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
            >
              <FaTimes />
            </button>
            <h2 className="text-3xl font-bold mb-6 text-center text-purple-700">Mejor Producto Recomendado por IA</h2>
            {topProducts.length === 0 ? (
              <p className="text-center text-gray-600">No se encontró una recomendación de IA.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {topProducts.map((p) => (
                  <div
                    key={p.id}
                    className="border border-yellow-500 ring-4 ring-yellow-300 rounded-lg p-6 flex flex-col items-center shadow-lg bg-yellow-50"
                  >
                    <p className="text-xl font-bold text-yellow-600 mb-4 animate-pulse">
                      ¡LA IA RECOMIENDA ESTE PRODUCTO! 🎉
                    </p>
                    <div className="w-48 h-48 mb-4 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.name}
                        height={400}
                        width={400}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/200x200/cccccc/ffffff?text=No+Image`; }}
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-2 text-gray-900">{p.name}</h3>
                    {p.bef_price !== null && (
                        <p className="text-gray-500 font-semibold text-lg mb-1 line-through">
                            {p.currency} {p.bef_price.toLocaleString('es-MX')}
                        </p>
                    )}
                    <p className="text-green-700 font-bold text-3xl mb-2">{p.currency} {p.price.toLocaleString('es-MX')}</p>
                    
                    {p.discount_percentage !== undefined && p.discount_percentage > 0 && (
                        <p className="text-purple-600 text-lg font-semibold mb-2">
                            <FaTags className="inline-block mr-2" /> ¡{p.discount_percentage.toFixed(0)}% de Descuento!
                        </p>
                    )}
                    <p className="text-md text-gray-700 mb-1">
                        Vendedor: {p.seller_rating !== null ? `${p.seller_rating} ★` : 'N/A'}
                        {p.seller_reviews !== null ? ` ${p.seller_reviews} reviews` : ''}
                    </p>
                    <p className="text-sm text-blue-700 font-medium mt-3 text-center flex items-center justify-center">
                        <FaLightbulb className="inline-block mr-2 text-yellow-500 text-xl" /> Análisis IA: {p.best_time_to_buy_message}
                    </p>
                    <p className="text-md text-gray-700 mt-2 text-center italic">
                       Razón de la IA: {p.reasoning || "No se proporcionó una razón detallada."}
                    </p>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
                    >
                      Ver producto
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

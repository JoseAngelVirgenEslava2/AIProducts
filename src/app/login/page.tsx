"use client";

import { useEffect, useState } from 'react';
import { FaHeart, FaArrowLeft, FaUser } from 'react-icons/fa';
import { IoIosInformationCircle } from 'react-icons/io';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface DecodedJWT {
  sub: string;
  email: string;
  exp: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [session, setSession] = useState<DecodedJWT | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  /* ------------------------------------------------------------------
   * Comprobamos si existe un JWT válido en localStorage. Si existe y no
   * está expirado, lo guardamos en session para mostrar la info.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const decoded: DecodedJWT = jwtDecode(token);
      // Si el token no ha expirado, guardamos los datos
      if (decoded.exp * 1000 > Date.now()) {
        setSession(decoded);
      } else {
        localStorage.removeItem('jwt'); // Token expirado
      }
    } catch (err) {
      console.log(err);
      localStorage.removeItem('jwt');
    }
  }, []);

  const handleGoBack = () => router.back();

  /* ------------------------------------------------------------------
   * Dummy handlers (en producción harías peticiones a /api/login, etc.)
   * ------------------------------------------------------------------ */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: llamar a API y guardar jwt en localStorage
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: llamar a API registro, guardar jwt en localStorage
  };

  /* ------------------------------------------------------------------
   * Renderizado condicional
   * ------------------------------------------------------------------ */
  if (session) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-mono">
        <header className="bg-red-600 p-4 w-full" />

        <div className="flex flex-1 relative">
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
            <FaUser className="text-gray-500 text-8xl" />
            <p className="text-2xl font-semibold">Hola, {session.email}!</p>
            <button
              className="w-full max-w-md py-4 bg-purple-400 text-white font-semibold text-lg rounded-lg hover:bg-purple-500 transition-colors shadow-md"
              onClick={() => {
                localStorage.removeItem('jwt');
                setSession(null);
              }}
            >
              Cerrar sesión
            </button>
          </div>

          {/* Lateral */}
          <div className="flex flex-col items-center justify-center p-4 border-l border-gray-200">
            <div className="p-4 border-2 border-solid mb-6 mt-6 hover:bg-gray-100 transition-colors cursor-pointer">
              <Link href="/favorites">
                <FaHeart size={30} />
              </Link>
            </div>
            <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer">
              <button onClick={handleGoBack} className="flex items-center justify-center w-full h-full">
                <FaArrowLeft size={30} />
              </button>
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

  /* ------------------------------------------------------------------
   * Vista de Login / Registro
   * ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      <header className="bg-red-600 p-4 w-full" />

      <div className="flex flex-1 relative">
        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <FaUser className="text-gray-500 text-8xl mb-12" />

          {/* Formulario de Login o Registro */}
          {!isCreating ? (
            <form onSubmit={handleLogin} className="flex flex-col items-center w-full max-w-md">
              <input
                type="email"
                placeholder="Correo electrónico"
                required
                className="w-full py-4 px-6 mb-6 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <input
                type="password"
                placeholder="Contraseña"
                required
                className="w-full py-4 px-6 mb-12 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                type="submit"
                className="w-full py-4 bg-purple-400 text-white font-semibold text-lg rounded-lg hover:bg-purple-500 transition-colors shadow-md"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full mt-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Crear cuenta
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col items-center w-full max-w-md">
              <input
                type="text"
                placeholder="Nombre"
                required
                className="w-full py-4 px-6 mb-6 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                required
                className="w-full py-4 px-6 mb-6 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <input
                type="password"
                placeholder="Contraseña"
                required
                className="w-full py-4 px-6 mb-12 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                type="submit"
                className="w-full py-4 bg-purple-400 text-white font-semibold text-lg rounded-lg hover:bg-purple-500 transition-colors shadow-md"
              >
                Registrarme
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-full mt-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Volver a iniciar sesión
              </button>
            </form>
          )}
        </div>

        {/* Lateral */}
        <div className="flex flex-col items-center justify-center p-4 border-l border-gray-200">
          <div className="p-4 border-2 border-solid mb-6 mt-6 hover:bg-gray-100 transition-colors cursor-pointer">
            <Link href="/favorites">
              <FaHeart size={30} />
            </Link>
          </div>
          <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer">
            <button onClick={handleGoBack} className="flex items-center justify-center w-full h-full">
              <FaArrowLeft size={30} />
            </button>
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
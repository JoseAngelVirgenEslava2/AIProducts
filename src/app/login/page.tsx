'use client';

import { useEffect, useRef, useState } from 'react';
import { FaHeart, FaArrowLeft, FaUser } from 'react-icons/fa';
import { IoIosInformationCircle } from 'react-icons/io';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // Asegúrate de tener 'jwt-decode' instalado: npm install jwt-decode

interface DecodedJWT {
  sub: string; // 'sub' es el ID de usuario (uid) del token
  email: string;
  exp: number; // Tiempo de expiración del token (timestamp Unix)
}

export default function LoginPage() {
  const router = useRouter();
  const [session, setSession] = useState<DecodedJWT | null>(null);
  const [isCreating, setIsCreating] = useState(false); // Determina si mostrar formulario de login o registro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------------
   * Comprobamos si existe un JWT válido en localStorage al cargar la página.
   * Si existe y no está expirado, lo guardamos en session.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (typeof window === 'undefined') return; // Asegurarse de que el código corre en el cliente
    const token = localStorage.getItem('userToken'); // Usamos 'userToken'
    if (!token) return;

    try {
      const decoded: DecodedJWT = jwtDecode(token);
      // Si el token no ha expirado, guardamos los datos de la sesión
      if (decoded.exp * 1000 > Date.now()) {
        setSession(decoded);
      } else {
        localStorage.removeItem('userToken'); // Eliminar token expirado
        localStorage.removeItem('userId'); // También eliminar el userId
      }
    } catch (err) {
      console.error("Error al decodificar JWT:", err);
      localStorage.removeItem('userToken'); // Limpiar si el token es inválido
      localStorage.removeItem('userId');
    }
  }, []);

  const handleGoBack = () => router.back();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      setError('Por favor, ingresa email y contraseña.');
      setLoading(false);
      return;
    }
  
    try {
      const res = await fetch('http://localhost:5000/login', { // Apunta al backend Python
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });
    
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('userToken', data.token); // Guardar el JWT
        localStorage.setItem('userId', data.uid); // Guardar el UID que viene del backend
        
        const decoded: DecodedJWT = jwtDecode(data.token);
        setSession(decoded);
        alert('¡Inicio de sesión exitoso!');
        router.push('/'); // Redirige a la página principal
      } else {
        setError(data.error || 'Error al iniciar sesión.');
      }
    } catch (err) {
      console.error("Error en handleLogin:", err);
      setError('Error de conexión o del servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const name = nameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!name || !email || !password) {
      setError('Por favor, completa todos los campos.');
      setLoading(false);
      return;
    }
  
    try {
      const res = await fetch('http://localhost:5000/register', { // Apunta al backend Python
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
        headers: { 'Content-Type': 'application/json' }
      });
    
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('userToken', data.token); // Guardar el JWT (opcional, para autologin)
        // El UID podría venir aquí también si tu backend lo devuelve en el registro
        
        const decoded: DecodedJWT = jwtDecode(data.token);
        setSession(decoded); // Establece la sesión para el usuario recién registrado
        alert('¡Registro exitoso! Sesión iniciada.');
        router.push('/'); // Redirige a la página principal después del registro y autologin
      } else {
        setError(data.error || 'Error al registrar.');
      }
    } catch (err) {
      console.error("Error en handleRegister:", err);
      setError('Error de conexión o del servidor.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------
   * Renderizado condicional basado en la sesión
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
                localStorage.removeItem('userToken'); // Eliminar token
                localStorage.removeItem('userId'); // Eliminar UID
                setSession(null); // Limpiar sesión en el estado
                router.push('/login'); // Redirigir al login
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

          {/* Muestra errores */}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* Formulario de Login o Registro */}
          {!isCreating ? (
            <form onSubmit={handleLogin} className="flex flex-col items-center w-full max-w-md">
              <input
                type="email"
                placeholder="Correo electrónico"
                required
                ref={emailRef}
                className="w-full py-4 px-6 mb-6 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <input
                type="password"
                placeholder="Contraseña"
                required
                ref={passwordRef}
                className="w-full py-4 px-6 mb-12 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                type="submit"
                className="w-full py-4 bg-purple-400 text-white font-semibold text-lg rounded-lg hover:bg-purple-500 transition-colors shadow-md"
                disabled={loading} // Deshabilita el botón durante la carga
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
              <button
                type="button"
                onClick={() => { setIsCreating(true); setError(''); }} // Limpiar error al cambiar de formulario
                className="w-full mt-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading} // Deshabilita el botón durante la carga
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
                ref={nameRef}
                className="w-full py-4 px-6 mb-6 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                required
                ref={emailRef}
                className="w-full py-4 px-6 mb-6 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <input
                type="password"
                placeholder="Contraseña"
                required
                ref={passwordRef}
                className="w-full py-4 px-6 mb-12 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                type="submit"
                className="w-full py-4 bg-purple-400 text-white font-semibold text-lg rounded-lg hover:bg-purple-500 transition-colors shadow-md"
                disabled={loading} // Deshabilita el botón durante la carga
              >
                {loading ? 'Registrando...' : 'Registrarme'}
              </button>
              <button
                type="button"
                onClick={() => { setIsCreating(false); setError(''); }} // Limpiar error al cambiar de formulario
                className="w-full mt-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading} // Deshabilita el botón durante la carga
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

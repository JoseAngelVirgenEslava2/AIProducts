'use client';

import { FaHeart, FaArrowLeft, FaUser } from "react-icons/fa";
import { IoIosInformationCircle } from "react-icons/io";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };
  return (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      {/* Encabezado Rojo */}
      <header className="bg-red-600 p-4 w-full"></header>

      <div className="flex flex-1 relative"> {/* Añadimos relative para posicionar el borde azul */}
        {/* Contenido Principal del Formulario */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Icono de Usuario Central */}
          <FaUser className="text-gray-500 text-8xl mb-12" /> {/* Tamaño grande para el ícono */}

          {/* Campos de Entrada */}
          <input
            type="text"
            placeholder="Nombre"
            className="w-full max-w-md py-4 px-6 mb-6 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <input
            type="email" // Usamos type="email" para validación de correo
            placeholder="Correo electronico"
            className="w-full max-w-md py-4 px-6 mb-12 bg-purple-50 rounded-lg text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {/* Botón Iniciar Sesión */}
          <button className="w-full max-w-md py-4 bg-purple-400 text-white font-semibold text-lg rounded-lg hover:bg-purple-500 transition-colors shadow-md">
            Iniciar sesion
          </button>
        </div>

        {/* Iconos de Navegación Lateral Derecha */}
        <div className="flex flex-col items-center justify-center p-4 border-l border-gray-200">
          <div className="p-4 border-2 border-solid mb-6 mt-6 hover:bg-gray-100 transition-colors cursor-pointer">
            <Link href={"/favorites"}>
              <FaHeart size={30} />
            </Link>
          </div>
          <div className="p-4 border-2 border-solid mb-6 hover:bg-gray-100 transition-colors cursor-pointer">
          <button onClick={handleGoBack} className="flex items-center justify-center w-full h-full"> {/* Usamos un botón para manejar el click */}
              <FaArrowLeft size={30} />
          </button>
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
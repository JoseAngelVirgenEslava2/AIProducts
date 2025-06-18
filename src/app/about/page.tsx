'use client';

import { FaHeart, FaArrowLeft, FaUser } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function AboutPage() { // Cambiado el nombre del componente a AboutPage
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-mono">
      {/* Encabezado Rojo */}
      <header className="bg-red-600 p-4 w-full text-white text-center text-xl font-bold rounded-b-lg shadow-md">
        Acerca de
      </header>

      <div className="flex flex-1">
        {/* Contenido Principal de la Página de Información */}
        <div className="flex-1 p-8 overflow-y-auto"> {/* Añadido overflow-y-auto para desplazamiento */}
          {/* Título de la Sección */}
          <div className="text-center text-3xl font-bold mb-8 text-purple-700">
            ¿Cómo funciona este scraper?
          </div>

          <div className="max-w-3xl mx-auto text-gray-800 leading-relaxed space-y-6 text-lg">
            <p>
              Esta aplicación web te ayuda a encontrar los mejores productos en línea mediante un proceso inteligente de recolección y análisis de datos. Aquí te explicamos cómo funciona el scraper que da vida a esta funcionalidad:
            </p>

            <h3 className="text-2xl font-semibold text-blue-600 mt-6 mb-3">1. Solicitud de Búsqueda</h3>
            <p>
              Cuando introduces un término en la barra de búsqueda (por ejemplo, laptop Dell o celular Samsung) y presionas buscar (o utilizas la búsqueda por voz), tu solicitud se envía a un servidor backend desarrollado en <strong>Python</strong>.
            </p>

            <h3 className="text-2xl font-semibold text-blue-600 mt-6 mb-3">2. Web Scraping en Mercado Libre</h3>
            <p>
              El servidor Python recibe tu término de búsqueda y lo utiliza para construir una URL de búsqueda específica para <strong>Mercado Libre México</strong>. Luego, realiza una solicitud HTTP a esta URL, simulando ser un navegador web.
            </p>
            <p>
              Una vez que obtiene el código HTML de la página de resultados de Mercado Libre, el scraper utiliza la librería <strong>BeautifulSoup</strong> para parsear o analizar este HTML. BeautifulSoup le permite identificar y extraer información relevante de los productos, como:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Nombre del producto</li>
              <li>Precio actual</li>
              <li>Precio anterior (si aplica, para calcular descuentos)</li>
              <li>Moneda</li>
              <li>URL del producto</li>
              <li>URL de la imagen</li>
              <li>Fuente (Mercado Libre en este caso)</li>
              <li>Calificación del vendedor (estrellas)</li>
              <li>Número de reseñas del vendedor</li>
              <li>Un puntaje simulado de oferta histórica (para el análisis de IA)</li>
            </ul>

            <h3 className="text-2xl font-semibold text-blue-600 mt-6 mb-3">3. Procesamiento y Envío al Frontend</h3>
            <p>
              Toda la información extraída de los productos se organiza en una estructura de datos limpia y se envía de vuelta a tu navegador como una respuesta JSON.
            </p>

            <h3 className="text-2xl font-semibold text-blue-600 mt-6 mb-3">4. Análisis Inteligente con IA (Gemini API)</h3>
            <p>
              Cuando haces clic en Encontrar el mejor producto, los datos de los productos que se muestran se envían a la <strong>API de Gemini</strong> (Google AI). La inteligencia artificial analiza estos productos basándose en varios criterios que le proporcionamos, como:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Porcentaje de descuento</li>
              <li>Calificación del vendedor y número de reseñas</li>
              <li>Puntaje de oferta histórica (simulado para este demo)</li>
            </ul>
            <p>
              La IA te devuelve una recomendación del mejor producto en ese momento, junto con una explicación detallada de su razonamiento y un consejo sobre el momento de compra.
            </p>

            <h3 className="text-2xl font-semibold text-blue-600 mt-6 mb-3">5. Gestión de Favoritos (MongoDB Atlas)</h3>
            <p>
              Para tus productos favoritos, la aplicación utiliza <strong>MongoDB Atlas</strong>, una base de datos NoSQL basada en la nube.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>
                <strong>Almacenamiento:</strong> Cuando añades un producto a favoritos, su información se guarda de forma segura dentro de tu propio perfil de usuario en MongoDB Atlas. Esto significa que tu lista de favoritos es personal y persistente.
              </li>
              <li>
                <strong>Autenticación:</strong> Tu sesión de usuario se gestiona mediante tokens <strong>JWT (JSON Web Tokens)</strong>, lo que garantiza que solo tú puedas acceder y modificar tu lista de favoritos.
              </li>
              <li>
                <strong>Seguridad:</strong> Las contraseñas de los usuarios se almacenan de forma segura utilizando <strong>bcrypt</strong> (un algoritmo de hash de contraseñas), lo que significa que ni siquiera los administradores de la base de datos pueden ver tu contraseña original.
              </li>
            </ul>

            <h3 className="text-2xl font-semibold text-blue-600 mt-6 mb-3">En Resumen:</h3>
            <p>
              Esta aplicación combina el poder del web scraping para recolectar datos de productos, la inteligencia artificial para analizar y recomendar las mejores ofertas, y una base de datos en la nube para gestionar tus preferencias de usuario de forma segura y eficiente.
            </p>
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
            <Link href={"/favorites"}>
              <FaHeart size={30} className="text-red-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

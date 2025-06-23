# 🧠 AIProducts – Comparador Inteligente de Precios

**AIProducts** es una plataforma web que permite a los usuarios buscar productos desde múltiples sitios (como Mercado Libre), comparar precios, guardar favoritos y recibir recomendaciones personalizadas basadas en inteligencia artificial. Además, permite hacer búsquedas por voz y recibir notificaciones por correo cuando los precios bajan.

---

## 🔍 Características principales

* 🔎 **Búsqueda de productos**
* 🤖 **Análisis con IA (Gemini)** para recomendar el mejor momento para comprar y el mejor producto
* 🛒 **Comparación de precios**
* ❤️ **Favoritos personalizados** por usuario
* 🔐 Autenticación con **JWT**
* 🧩 Arquitectura limpia dividida en entidades, servicios, infraestructura y presentación

---

## 🧱 Estructura del proyecto

AIProducts/

│

├── src/

│ ├── app/ # Frontend with Next.js (React + TypeScript)

│ │ ├── api/

│ │ ├── components/ # visual components

│ │ ├── infrastructure/ # Scrapers, JWT manager, email

│ │ ├── models/ # Entities

│ │ ├── services/ # Login, favorites, search

│ │ ├── utils/ # Helpers, sessions

│ │ └── ...

│ ├── server.py (backend)

│

├── .env.local # environment variables

├── package.json # Dependencies

├── README.md

└── ...

---

## 🚀 Instalación y ejecución del proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/JoseAngelVirgenEslava2/AIProducts.git
```
2. Instalar las dependencias
```bash
npm install
```

3. Configurar las variables de entorno
Crea un archivo .env en la raíz con el siguiente contenido:
```bash
#JWT
JWT_SECRET=tu_secreto_seguro
MONGODB_URI=tu_uri_mongo (Atlas)
GEMINI_API_KEY=api_key_para_gemini
```

4. Ejecutar el frontend
```bash
npm run dev
```

Visita 👉 http://localhost:3000

🔍 Búsqueda

Después de una búsqueda, puedes presionar “Encontrar el mejor producto”. Se enviará la información al backend (Flask y Gemini API) para obtener el mejor producto y el mejor momento de compra.

📦 Dependencias clave

    Frontend: Next.js, React, TailwindCSS, TypeScript
    Scraping: BeautifulSoup
    Autenticación: JSON Web Tokens (JWT)
    Backend Python: Flask, Gemini API, BeautifulSoup
    
📄 Licencia

Este proyecto es de uso personal y educativo. Puedes modificarlo, adaptarlo o usarlo como base para tus propias ideas.

📬 Autor

Desarrollado por José Ángel Virgen Eslava
GitHub: @JoseAngelVirgenEslava2

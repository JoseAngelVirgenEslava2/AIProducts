# backend_api.py
from flask import Flask, request, jsonify
from flask_cors import CORS # Necesario para permitir solicitudes desde tu frontend Next.js
import requests
from bs4 import BeautifulSoup
from collections import namedtuple # Para organizar los datos de los artículos

app = Flask(__name__)
CORS(app) # Habilita CORS para todas las rutas

# Define una estructura para tus artículos, similar a tu clase Product de TypeScript
# Usamos un namedtuple para simplificar la creación de objetos
Articulo = namedtuple('Articulo', ['id', 'name', 'price', 'currency', 'url', 'image', 'source'])

@app.route('/search', methods=['GET'])
def search_mercadolibre():
    query = request.args.get('q')
    if not query:
        return jsonify({"error": "Parámetro 'q' requerido"}), 400

    url = f'https://listado.mercadolibre.com.mx/{query}'
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
        )
    }

    lista_articulos = []
    try:
        r = requests.get(url, headers=headers, timeout=10) # Agregamos un timeout
        r.raise_for_status() # Lanza una excepción para errores HTTP (4xx o 5xx)
        html_contents = r.text
        html_soup = BeautifulSoup(html_contents, 'html.parser')

        articulos_mercado = html_soup.find_all('li', class_='ui-search-layout__item')
        for i, articulo_tag in enumerate(articulos_mercado):
            # Selector de título más común: h2 con clase ui-search-item__title
            # Si 'h3 poly-component__title-wrapper' te funcionó antes, puedes mantenerlo.
            nombre_tag = articulo_tag.find('h3', class_='poly-component__title-wrapper')
            nombre = nombre_tag.text.strip() if nombre_tag else 'N/A'

            precio_tag = articulo_tag.find('span', class_='andes-money-amount__fraction')
            centavos_tag = articulo_tag.find('span', class_='andes-money-amount__cents')
            
            precio_actual = None
            if precio_tag:
                precio_str = precio_tag.text.replace(".", "").replace(",", ".") # Elimina puntos, cambia coma a punto
                if centavos_tag:
                    precio_str += "." + centavos_tag.text.strip()
                try:
                    precio_actual = float(precio_str)
                except ValueError:
                    precio_actual = None # No pudo convertir a float

            # Extraer URL del producto
            link_tag = articulo_tag.find('a', class_='ui-search-link')
            product_url = link_tag.get('href') if link_tag else 'N/A'
            
            # *** CORRECCIÓN CLAVE AQUÍ: Extraer la URL de la imagen ***
            # Busca la etiqueta img y obtén el atributo 'data-src' o 'src'
            imagen_tag = articulo_tag.find('img', class_='poly-component__picture') # Clase común para la imagen principal
            # Si 'poly-component__picture' te funcionó antes, puedes mantenerlo.
            # imagen_tag = articulo_tag.find('img', class_='poly-component__picture')

            image_url = imagen_tag.get('data-src') or imagen_tag.get('src') if imagen_tag else 'N/A'


            # Asegurar un ID único para cada producto
            product_id = f"ML-{i}-{hash(nombre)}"[0:20] # Usamos hash para pseudo-unicidad

            if nombre != 'N/A' and precio_actual is not None and precio_actual > 0:
                lista_articulos.append(
                    Articulo(
                        id=product_id,
                        name=nombre,
                        price=precio_actual,
                        currency='MXN', # Asumimos MXN para Mercado Libre México
                        url=product_url,
                        image=image_url, # <--- ¡Ahora pasamos la URL (string), no el Tag!
                        source='MercadoLibre'
                    )
                )

    except requests.exceptions.RequestException as e:
        print(f"Error de solicitud HTTP: {e}")
        return jsonify({"error": f"Error al conectar con Mercado Libre: {e}"}), 500
    except Exception as e:
        print(f"Error inesperado durante el scraping: {e}")
        return jsonify({"error": f"Error interno del servidor: {e}"}), 500

    # Convertimos la lista de namedtuples a una lista de diccionarios para jsonify
    return jsonify([articulo._asdict() for articulo in lista_articulos])

if __name__ == '__main__':
    # Ejecuta el servidor Flask en el puerto 5000
    app.run(debug=True, port=5000)

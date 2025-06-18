# backend_api.py
import random
from flask import Flask, json, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from collections import namedtuple
import os
from dotenv import load_dotenv

# Importar PyMongo, bcrypt y PyJWT
from pymongo import MongoClient
from bson.objectid import ObjectId # Importar ObjectId
import bcrypt
import jwt
from datetime import datetime, timedelta

load_dotenv()
app = Flask(__name__)
CORS(app) # Habilita CORS para todas las rutas

# --- Configuración de MongoDB Atlas ---
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    print("ERROR: MONGO_URI no está configurada en el archivo .env")
    # No salimos aquí, la aplicación continuará pero los endpoints de DB fallarán
    client = None
    db_mongo = None
    users_collection = None
else:
    try:
        client = MongoClient(MONGO_URI)
        # Reemplaza 'your_database_name' con el nombre de tu base de datos en Atlas
        db_mongo = client.get_database('scrapper') 
        users_collection = db_mongo.get_collection('users')
        print("Conexión a MongoDB Atlas establecida correctamente.")
    except Exception as e:
        print(f"ERROR: Fallo al conectar con MongoDB Atlas: {e}")
        client = None
        db_mongo = None
        users_collection = None

# --- Comprobación inicial de colecciones (para depuración) ---

# --- Configuración JWT ---
JWT_SECRET = os.getenv('JWT_SECRET')
if not JWT_SECRET:
    print("ERROR: JWT_SECRET no está configurada en el archivo .env")
    # No salimos, los endpoints JWT fallarán
    JWT_SECRET = "supersecretfallbackkey_change_me_in_prod" # Fallback para evitar errores, PERO INSEGURO

# Configuración de la API de Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_API_URL = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}'

# Define una estructura para tus artículos, incluyendo historical_deal_score para IA
# RENOMBRADOS: 'ratings' a 'seller_rating', 'reviews' a 'seller_reviews'
Articulo = namedtuple('Articulo', ['id', 'name', 'price', 'bef_price', 'currency', 'url', 'image', 'source', 
                                   'seller_rating', 'seller_reviews', 'historical_deal_score'])


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
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        html_contents = r.text
        html_soup = BeautifulSoup(html_contents, 'html.parser')

        articulos_mercado = html_soup.find_all('li', class_='ui-search-layout__item')
        for i, articulo_tag in enumerate(articulos_mercado):
            nombre_tag = articulo_tag.find('h2', class_='ui-search-item__title') 
            if not nombre_tag: 
                nombre_tag = articulo_tag.find('h3', class_='poly-component__title-wrapper')
            nombre = nombre_tag.text.strip() if nombre_tag else 'N/A'
            
            # Seller Rating (CORREGIDO)
            seller_rating = None
            seller_rating_tag = articulo_tag.find('span', class_='poly-reviews__rating')
            if seller_rating_tag:
                try:
                    seller_rating = float(seller_rating_tag.text.strip())
                except ValueError:
                    seller_rating = None

            # Seller Reviews (CORREGIDO)
            seller_reviews = None
            seller_reviews_tag = articulo_tag.find('span', class_='poly-reviews__total')
            if seller_reviews_tag:
                try:
                    reviews_text = seller_reviews_tag.text.strip().replace('(', '').replace(')', '').replace('.', '').replace(',', '')
                    if 'K' in reviews_text:
                        seller_reviews = int(float(reviews_text.replace('K', '')) * 1000)
                    else:
                        seller_reviews = int(reviews_text)
                except ValueError:
                    seller_reviews = None

            precio_actual = None
            current_price_container = articulo_tag.find('div', class_='poly-price__current')
            if current_price_container:
                precio_actual_fraction_tag = current_price_container.find('span', class_='andes-money-amount__fraction')
                precio_actual_cents_tag = current_price_container.find('span', class_='andes-money-amount__cents')
                
                if precio_actual_fraction_tag:
                    precio_str = precio_actual_fraction_tag.text.strip().replace(".", "").replace(",", ".")
                    if precio_actual_cents_tag:
                        precio_str += "." + precio_actual_cents_tag.text.strip()
                    try:
                        precio_actual = float(precio_str)
                    except ValueError:
                        precio_actual = None

            precio_anterior = None
            previous_price_container = articulo_tag.find('s', class_=['andes-money-amount', 'andes-money-amount--previous', 'andes-money-amount--cents-dot'])
            if previous_price_container:
                precio_anterior_fraction_tag = previous_price_container.find('span', class_='andes-money-amount__fraction')
                if precio_anterior_fraction_tag:
                    precio_ant_str = precio_anterior_fraction_tag.text.strip().replace('.', '').replace(',', '.')
                    try:
                        precio_anterior = float(precio_ant_str)
                    except ValueError:
                        precio_anterior = None

            link_tag = articulo_tag.find('a', class_='ui-search-link')
            product_url = link_tag.get('href') if link_tag else 'N/A'
            
            imagen_tag = articulo_tag.find('img', class_='ui-search-result-image')
            if not imagen_tag: 
                imagen_tag = articulo_tag.find('img', class_='poly-component__picture')
            image_url = imagen_tag.get('data-src') or imagen_tag.get('src') if imagen_tag else 'N/A'

            product_id = f"ML-{i}-{hash(nombre)}"[0:20]
            simulated_historical_deal_score = random.randint(1, 100)

            if nombre != 'N/A' and precio_actual is not None and precio_actual > 0:
                lista_articulos.append(
                    Articulo(
                        id=product_id,
                        name=nombre,
                        price=precio_actual,
                        bef_price=precio_anterior,
                        currency='MXN',
                        url=product_url,
                        image=image_url,
                        source='MercadoLibre',
                        seller_rating=seller_rating, # Usar seller_rating
                        seller_reviews=seller_reviews, # Usar seller_reviews
                        historical_deal_score=simulated_historical_deal_score
                    )
                )

    except requests.exceptions.RequestException as e:
        print(f"Error de solicitud HTTP: {e}")
        return jsonify({"error": f"Error al conectar con Mercado Libre: {e}"}), 500
    except Exception as e:
        print(f"Error inesperado durante el scraping: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error interno del servidor: {e}"}), 500

    return jsonify([articulo._asdict() for articulo in lista_articulos])


@app.route('/analyze-products', methods=['POST'])
def analyze_products():
    if not GEMINI_API_KEY:
        return jsonify({"error": "GEMINI_API_KEY no está configurada en el servidor."}), 500
    
    products_data = request.json
    if not products_data:
        return jsonify({"error": "Datos de productos requeridos para el análisis."}), 400

    product_descriptions = []
    products_to_analyze = products_data[:10]

    for p in products_to_analyze:
        discount_info = ""
        bef_price = p['bef_price'] if p['bef_price'] is not None else 0
        current_price = p['price'] if p['price'] is not None else 0

        if bef_price > current_price and bef_price > 0:
            discount_percentage = ((bef_price - current_price) / bef_price) * 100
            discount_info = f", con un descuento del {discount_percentage:.1f}% sobre su precio anterior de {p['currency']} {bef_price:.2f}"
        
        rating_info = f"{p.get('seller_rating', 'N/A')} estrellas" # Usar .get() para seguridad
        reviews_info = f"{p.get('seller_reviews', 'N/A')} reseñas" # Usar .get() para seguridad

        historical_score_info = p.get('historical_deal_score', 'N/A')

        product_descriptions.append(
            f"- ID: {p['id']}, Nombre: {p['name']}, Precio: {p['currency']} {current_price:.2f}{discount_info}, "
            f"Calificación del vendedor: {rating_info}, Reseñas: {reviews_info}, "
            f"Puntaje de oferta histórica (simulado): {historical_score_info}."
        )

    prompt = (
        "Analiza la siguiente lista de productos y determina cuál es el 'mejor producto' para comprar "
        "en este momento, considerando los siguientes criterios:\n"
        "1.  **Mayor descuento:** Prioriza productos con un alto porcentaje de descuento respecto a su precio anterior.\n"
        "2.  **Calificación del vendedor:** Productos con mayor número de estrellas (rating) son mejores.\n"
        "3.  **Cantidad de reseñas:** Mayor número de reseñas indica mayor fiabilidad y popularidad del producto/vendedor.\n"
        "4.  **Análisis de precio histórico (simulado):** Un puntaje de oferta histórica más alto (simulado) indica una mejor oportunidad.\n\n"
        "Devuelve tu análisis como un objeto JSON con una clave 'best_product_id' (string) "
        "para el ID del mejor producto, una clave 'reasoning' (string) explicando por qué es el mejor, "
        "y una clave 'best_time_to_buy_advice' (string) con un consejo sobre el momento de compra.\n\n"
        "Aquí está la lista de productos:\n" + "\n".join(product_descriptions) + "\n\n"
        "Ejemplo de formato JSON esperado:\n"
        "```json\n"
        "{\n"
        "  \"best_product_id\": \"ID_DEL_MEJOR_PRODUCTO\",\n"
        "  \"reasoning\": \"Explicación detallada de por qué este producto es el mejor.\",\n"
        "  \"best_time_to_buy_advice\": \"Consejo sobre si es un buen momento para comprar.\"\n"
        "}\n"
        "```"
    )

    try:
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "OBJECT",
                    "properties": {
                        "best_product_id": {"type": "STRING"},
                        "reasoning": {"type": "STRING"},
                        "best_time_to_buy_advice": {"type": "STRING"}
                    },
                    "propertyOrdering": ["best_product_id", "reasoning", "best_time_to_buy_advice"]
                }
            }
        }
        
        response = requests.post(GEMINI_API_URL, headers={'Content-Type': 'application/json'}, json=payload)
        response.raise_for_status()
        
        gemini_response = response.json()
        
        if gemini_response and gemini_response.get('candidates') and \
           gemini_response['candidates'][0].get('content') and \
           gemini_response['candidates'][0]['content'].get('parts'):
            
            gemini_analysis_text = gemini_response['candidates'][0]['content']['parts'][0]['text']
            
            try:
                gemini_analysis = json.loads(gemini_analysis_text)
                return jsonify(gemini_analysis), 200
            except json.JSONDecodeError as e:
                print(f"Error al parsear la respuesta JSON de Gemini: {e}")
                print(f"Respuesta cruda de Gemini: {gemini_analysis_text}")
                return jsonify({"error": "Error al procesar la respuesta de la IA. Formato inesperado.", "details": str(e)}), 500
        else:
            return jsonify({"error": "Respuesta inesperada de la IA (estructura vacía o incorrecta)."}), 500

    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con la API de Gemini: {e}")
        return jsonify({"error": f"Error al conectar con la IA: {e}"}), 500
    except Exception as e:
        print(f"Error inesperado al procesar la solicitud de IA: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error interno del servidor al analizar con IA: {e}"}), 500

# --- ENDPOINTS DE AUTENTICACIÓN Y FAVORITOS CON MONGODB ---
@app.route('/register', methods=['POST'])
def register_user():
    if not users_collection: # Usar la colección directamente para la verificación
        return jsonify({"error": "Conexión a la base de datos no disponible para usuarios."}), 500
    
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name', 'Usuario Nuevo') 

    if not email or not password:
        return jsonify({"error": "Email y contraseña son requeridos"}), 400

    try:
        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return jsonify({"error": "El correo ya está registrado"}), 409

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        user_doc = {
            'email': email,
            'name': name,
            'passwordHash': hashed_password,
            'createdAt': datetime.now(),
            'favorites': {'products': []} # Crea la lista de favoritos vacía
        }
        result = users_collection.insert_one(user_doc)
        user_id = str(result.inserted_id) # Convertir ObjectId a string

        token_payload = {
            'sub': user_id,
            'email': email,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(token_payload, JWT_SECRET, algorithm='HS256')

        return jsonify({"message": "Registro exitoso", "token": token, "uid": user_id}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error interno del servidor al registrar: {e}"}), 500

@app.route('/login', methods=['POST'])
def login_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email y contraseña son requeridos"}), 400

    try:
        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({"error": "Credenciales inválidas"}), 401

        if not bcrypt.checkpw(password.encode('utf-8'), user['passwordHash'].encode('utf-8')):
            return jsonify({"error": "Credenciales inválidas"}), 401

        user_id = str(user['_id'])
        token_payload = {
            'sub': user_id,
            'email': email,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(token_payload, JWT_SECRET, algorithm='HS256')

        return jsonify({"message": "Login exitoso", "token": token, "uid": user_id}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error interno del servidor al iniciar sesión: {e}"}), 500

# --- Función para verificar token (middleware de autenticación) ---
def verify_token(req):
    auth_header = req.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, "Authorization header faltante o malformado", 401
    
    token = auth_header.split(' ')[1]
    
    try:
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        uid = decoded_token['sub']
        return uid, None, None
    except jwt.ExpiredSignatureError:
        return None, "Token expirado", 401
    except jwt.InvalidTokenError:
        return None, "Token inválido", 403
    except Exception as e:
        import traceback
        traceback.print_exc()
        return None, f"Error al verificar token: {e}", 500

# --- NUEVO ENDPOINT PARA AGREGAR PRODUCTOS A FAVORITOS ---
@app.route('/favorites/add', methods=['POST'])
def add_favorite_product():
    uid, error, status_code = verify_token(request)
    if error:
        return jsonify({"error": error}), status_code

    product_data = request.json
    if not product_data:
        return jsonify({"error": "Datos del producto requeridos."}), 400

    # Extraer solo los campos relevantes para guardar en favoritos
    favorite_product = {
        "id": product_data.get('id'),
        "name": product_data.get('name'),
        "price": product_data.get('price'),
        "currency": product_data.get('currency'),
        "url": product_data.get('url'),
        "image": product_data.get('image'),
        "source": product_data.get('source'),
        "addedAt": datetime.now() # Fecha de adición
    }

    # Validar campos esenciales
    if not all([favorite_product['id'], favorite_product['name'], favorite_product['price'], favorite_product['url']]):
        return jsonify({"error": "Datos incompletos para agregar a favoritos."}), 400

    try:
        # Buscar el usuario por su ObjectId y actualizar el array 'favorites.products'
        user_object_id = ObjectId(uid) 
        
        update_result = users_collection.update_one(
            {'_id': user_object_id},
            {'$addToSet': {'favorites.products': favorite_product}} # Usa $addToSet para evitar duplicados
        )

        if update_result.matched_count == 0:
            return jsonify({"error": "Usuario no encontrado."}), 404
        elif update_result.modified_count == 0:
            return jsonify({"message": "El producto ya está en favoritos o no se pudo modificar."}), 200
        else:
            return jsonify({"message": "Producto agregado a favoritos exitosamente."}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error interno del servidor al agregar a favoritos: {e}"}), 500

@app.route('/favorites', methods=['GET'])
def get_favorite_products():
    uid, error, status_code = verify_token(request)
    if error:
        return jsonify({"error": error}), status_code

    try:
        user_object_id = ObjectId(uid)
        user_doc = users_collection.find_one(
            {'_id': user_object_id},
            {'favorites.products': 1} # Proyectar solo el campo de favoritos
        )

        if not user_doc:
            return jsonify({"error": "Usuario no encontrado."}), 404
        
        # Obtener la lista de productos favoritos, si existe. Si no, un array vacío.
        favorite_products = user_doc.get('favorites', {}).get('products', [])
        return jsonify({"favorites": favorite_products}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error interno del servidor al obtener favoritos: {e}"}), 500

@app.route('/favorites/remove', methods=['DELETE'])
def remove_favorite_product():
    uid, error, status_code = verify_token(request)
    if error:
        return jsonify({"error": error}), status_code

    product_data = request.json
    product_id = product_data.get('id') # Esperamos el ID del producto a eliminar
    
    if not product_id:
        return jsonify({"error": "ID del producto requerido para eliminar."}), 400

    try:
        user_object_id = ObjectId(uid)
        
        # Usar $pull para eliminar el producto que coincida con el 'id'
        update_result = users_collection.update_one(
            {'_id': user_object_id},
            {'$pull': {'favorites.products': {'id': product_id}}}
        )

        if update_result.matched_count == 0:
            return jsonify({"error": "Usuario no encontrado."}), 404
        elif update_result.modified_count == 0:
            return jsonify({"message": "El producto no se encontró en la lista de favoritos del usuario o no se pudo eliminar."}), 200
        else:
            return jsonify({"message": "Producto eliminado de favoritos exitosamente."}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error interno del servidor al eliminar de favoritos: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

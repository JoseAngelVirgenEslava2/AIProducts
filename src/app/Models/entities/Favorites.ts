import { Product } from './Product';

export class Favorites {
  private products: Product[] = [];

  agregar(product: Product): void {
    if (!this.products.find((p) => p.id === product.id)) {
      this.products.push(product);
    }
  }

  eliminar(idProducto: string): void {
    this.products = this.products.filter((p) => p.id !== idProducto);
  }

  obtenerTodos(): Product[] {
    return this.products;
  }
}
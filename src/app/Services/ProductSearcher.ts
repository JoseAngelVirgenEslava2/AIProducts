import { Product } from "../Models/entities/Product";

export interface BuscadorProductos {
  buscar(nombre: string): Promise<Product[]>;
}
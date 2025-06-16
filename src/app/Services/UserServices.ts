import { User } from "../Models/entities/User";
import { Product } from "../Models/entities/Product";
import { RepositorioUsuario } from "../Persistence/Repositories/UserRepository";
import { RepositorioFavoritos } from "../Persistence/Repositories/FavoritesRepository";
import { BuscadorProductos } from "./ProductSearcher";
import { JWTManager } from "../infrastructure/JWTManager";

export class UsuarioService implements BuscadorProductos {
  constructor(
    private repoUsuario: RepositorioUsuario,
    private repoFavoritos: RepositorioFavoritos,
    private buscadores: BuscadorProductos[]
  ) {}

  async crearCuenta(email: string, password: string, name: string): Promise<string> {
    type UserDocLike = User & { password: string };
    const nuevo: UserDocLike = new User('', email, '', name) as UserDocLike;
    nuevo.password = password;
    const guardado = await this.repoUsuario.guardar(nuevo);
    return JWTManager.generarToken(guardado);
  }

  async iniciarSesion(email: string, password: string): Promise<string | null> {
    const usuario = await this.repoUsuario.obtenerPorCorreo(email);
    if (!usuario) return null;
    // Verificación (simplificada):
    const bcrypt = await import("bcryptjs");
    const ok = bcrypt.compareSync(password, usuario.passwordHash);
    return ok ? JWTManager.generarToken(usuario) : null;
  }

  async buscar(nombre: string): Promise<Product[]> {
    const resultados = await Promise.all(this.buscadores.map((b) => b.buscar(nombre)));
    return resultados.flat();
  }

  async agregarFavoritos(idUsuario: string, producto: Product): Promise<void> {
    const favs = await this.repoFavoritos.obtenerPorUsuario(idUsuario);
    favs.agregar(producto);
    await this.repoFavoritos.guardar(idUsuario, favs);
  }

  async eliminarFavoritos(idUsuario: string, idProducto: string): Promise<void> {
    await this.repoFavoritos.eliminarProducto(idUsuario, idProducto);
  }
}
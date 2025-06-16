import { FavoriteModel, IFavoriteDoc } from "../FavoritesSchema";
import { Favorites } from "../../Models/entities/Favorites";
import { Product } from "../../Models/entities/Product";
import mongoose from "mongoose";

export class RepositorioFavoritos {
  async obtenerPorUsuario(idUsuario: string): Promise<Favorites> {
    const doc = await FavoriteModel.findOne({ userId: idUsuario }).exec();
    return doc ? this.toDomain(doc) : new Favorites();
  }

  async guardar(idUsuario: string, favorites: Favorites): Promise<void> {
    await FavoriteModel.findOneAndUpdate(
      { userId: idUsuario },
      {
        userId: new mongoose.Types.ObjectId(idUsuario),
        products: favorites.obtenerTodos(),
      },
      { upsert: true }
    ).exec();
  }

  async eliminarProducto(idUsuario: string, idProducto: string): Promise<void> {
    await FavoriteModel.updateOne(
      { userId: idUsuario },
      { $pull: { products: { id: idProducto } } }
    ).exec();
  }

  private toDomain(doc: IFavoriteDoc): Favorites {
    const fav = new Favorites();
    doc.products.forEach((p) =>
      fav.agregar(
        new Product(p.id, p.name, p.price, p.currency, p.url, p.source, p.lastChecked)
      )
    );
    return fav;
  }
}
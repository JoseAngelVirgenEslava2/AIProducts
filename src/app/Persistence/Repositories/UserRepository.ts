import { UserModel, IUserDoc } from "../UserSchema";
import { User } from "../../Models/entities/User";

export class RepositorioUsuario {
  async obtenerPorCorreo(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async guardar(usuario: User): Promise<User> {
    const doc = await UserModel.findOneAndUpdate(
      { _id: usuario.id },
      {
        email: usuario.email,
        passwordHash: usuario.passwordHash,
        name: usuario.name,
      },
      { upsert: true, new: true }
    ).exec();
    return this.toDomain(doc);
  }

  private toDomain(doc: IUserDoc): User {
    return new User(doc.id, doc.email, doc.passwordHash, doc.name);
  }
}
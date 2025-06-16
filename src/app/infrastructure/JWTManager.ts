import jwt from "jsonwebtoken";
import { User } from "../Models/entities/User";

const SECRET = process.env.JWT_SECRET || "super-secret";
const EXPIRATION = "1h";

export class JWTManager {
  static generarToken(usuario: User): string {
    return jwt.sign({ sub: usuario.id, email: usuario.email }, SECRET, {
      expiresIn: EXPIRATION,
    });
  }

  static verificarToken(token: string): { sub: string; email: string } | null {
    try {
      return jwt.verify(token, SECRET) as { sub: string; email: string };
    } catch (_) {
      console.log(_);
      return null;
    }
  }
}
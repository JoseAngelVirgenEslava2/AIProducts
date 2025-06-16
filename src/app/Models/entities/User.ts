import { Favorites } from "./Favorites";

export class User {
  constructor(
    public id: string,
    public email: string,
    public passwordHash: string,
    public name: string,
    public favorites: Favorites = new Favorites()
  ) {}
}
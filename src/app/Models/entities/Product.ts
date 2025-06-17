export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public currency: string, // <-- Este campo es requerido por tu constructor
    public url: string,
    public image: string,
    public source: string
  ) {}
}

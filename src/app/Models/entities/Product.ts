export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public currency: string,
    public url: string,
    public source: string,
    public lastChecked: Date = new Date()
  ) {}
}
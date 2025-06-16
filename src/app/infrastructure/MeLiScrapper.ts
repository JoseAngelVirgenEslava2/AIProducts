import { BuscadorProductos } from "../Services/ProductSearcher";
import { Product } from "../Models/entities/Product";
import { chromium } from "playwright";

export class ScraperMercadoLibre implements BuscadorProductos {
  async buscar(nombre: string): Promise<Product[]> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(nombre)}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const data = await page.$$eval(".ui-search-result", (nodes) =>
      nodes.slice(0, 10).map((node) => {
        const nombre = (node.querySelector("h2") as HTMLElement)?.innerText.trim();
        const priceText = (node.querySelector(".price-tag-fraction") as HTMLElement)?.innerText.trim();
        const url = (node.querySelector("a") as HTMLAnchorElement)?.href;
        return { nombre, priceText, url };
      })
    );

    await browser.close();

    return data.map(
      (d, idx) =>
        new Product(
          `ML-${idx}-${Date.now()}`,
          d.nombre,
          parseFloat(d.priceText.replace(/[^\d]/g, "")),
          "MXN",
          d.url,
          "MercadoLibre"
        )
    );
  }
}
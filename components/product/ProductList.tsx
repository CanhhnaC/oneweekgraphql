import Link from "next/link";
import { ProductItem } from "./ProductItem";

import type { Product } from "lib/products";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-flow-row-dense grid-cols-1 md:grid-cols-2">
      {products.map((product, index) => (
        <ProductLink key={index} product={product} />
      ))}
    </ul>
  );
}

export function ProductLink({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} key={product.slug}>
      <a style={{ height: 500 }} className="bg-gray-500">
        <ProductItem product={product} />
      </a>
    </Link>
  );
}

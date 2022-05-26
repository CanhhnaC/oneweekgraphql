import { Header } from "../components/Header";
import { Product, products } from "../lib/products";

import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { ProductList } from "../components/ProductList";

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  products,
}) => {
  return (
    <div>
      <Header />
      <main>
        <section>
          <ProductList products={products} />
        </section>
      </main>
    </div>
  );
};

export const getStaticProps: GetStaticProps<{
  products: Product[];
}> = async () => ({
  props: {
    products: products.slice(0, 6),
  },
});

export default Home;

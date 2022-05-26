import { Header } from "components/ui/Header";
import { ProductList } from "components/product/ProductList";
import { Product, products } from "lib/products";

import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";

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

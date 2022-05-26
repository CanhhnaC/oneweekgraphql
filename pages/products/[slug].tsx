import { Header } from "components/ui/Header";
import { ProductDetail } from "components/product/ProductDetail";
import { Product, products } from "lib/products";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";

const ProductPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ product }) => (
  <div>
    <Header />
    <ProductDetail product={product} />
  </div>
);

export const getServerSideProps: GetServerSideProps<{
  product: Product | null;
}> = async ({ req, res, query }) => {
  const product =
    products.find((product) => product.slug === query.slug) || null;
  return { props: { product } };
};

export default ProductPage;

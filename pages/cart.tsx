import { getCartId } from "../lib/cart.client";
import { useGetCartQuery } from "../types";
import { Header } from "../components/Header";
import { CartDetail } from "../components/CartDetail";

import type { GetServerSideProps, NextPage } from "next";

interface ICartProps {
  cartId: string;
}

const Cart: NextPage<ICartProps> = ({ cartId }) => {
  const { data } = useGetCartQuery({ variables: { id: cartId } });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="p-8 min-h-screen">
        <div className="mx-auto max-w-xl space-y-8">
          <h1 className="text-4xl">Cart</h1>
          <CartDetail cart={data?.cart} />
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ICartProps> = async ({
  req,
  res,
}) => {
  const cartId = getCartId({ req, res });
  return { props: { cartId } };
};

export default Cart;

import { useRouter } from "next/router";
import { getCartId } from "../lib/cart.client";
import { useCreateCheckoutSessionMutation, useGetCartQuery } from "@@types";
import { Header } from "components/ui/Header";
import { CartDetail } from "components/cart/CartDetail";

import type { GetServerSideProps, NextPage } from "next";
import { CartError } from "@components/cart/CartError";

interface ICartProps {
  cartId: string;
}

const Cart: NextPage<ICartProps> = ({ cartId }) => {
  const router = useRouter();
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  const [createCheckoutSession, { loading: creatingCheckoutSession, error }] =
    useCreateCheckoutSessionMutation({
      variables: {
        input: {
          cartId,
        },
      },
      onCompleted: (data) => {
        if (data?.createCheckoutSession?.url) {
          router.push(data.createCheckoutSession?.url);
        }
      },
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="p-8 min-h-screen">
        <div className="mx-auto max-w-xl space-y-8">
          <h1 className="text-4xl">Cart</h1>
          <CartError error={error} />
          <CartDetail cart={data?.cart} />
          <div>
            <button
              onClick={(e) => {
                e.preventDefault();
                createCheckoutSession();
              }}
              disabled={creatingCheckoutSession}
              className="p-1 font-light border border-neutral-700 hover:bg-black hover:text-white w-full"
            >
              {creatingCheckoutSession
                ? "Redirecting to Checkout"
                : "Go to Checkout"}
            </button>
          </div>
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

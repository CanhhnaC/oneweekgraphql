import { createServer, GraphQLYogaError } from "@graphql-yoga/node";
import { join } from "path";
import { readFileSync } from "fs";
import currencyFormatter from "currency-formatter";
import prisma from "lib/prisma";
import { findOrCreateCart, validateCartItems } from "lib/cart";
import { stripe } from "lib/stripe";
import { origin } from "lib/client";
import { products } from "lib/products";

import type { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Resolvers } from "types";

const currencyCode = "USD";

export type GraphQLContext = {
  prisma: PrismaClient;
};

export async function createContext(): Promise<GraphQLContext> {
  return {
    prisma,
  };
}

const typeDefs = readFileSync(join(process.cwd(), "schema.graphql"), {
  encoding: "utf-8",
});

const resolvers: Resolvers = {
  Query: {
    cart: async (_, { id }, { prisma }) => {
      return findOrCreateCart(prisma, id);
    },
  },

  Cart: {
    items: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart.findUnique({ where: { id } }).items();
      return items;
    },
    totalItems: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: { id },
        })
        .items();

      return items.reduce((total, item) => total + item.quantity || 1, 0);
    },
    subTotal: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: { id },
        })
        .items();

      const amount =
        items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;

      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: currencyCode,
        }),
      };
    },
  },
  CartItem: {
    unitTotal: (item) => {
      const amount = item.price;

      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: currencyCode,
        }),
      };
    },
    lineTotal: (item) => {
      const amount = item.quantity * item.price;

      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: currencyCode,
        }),
      };
    },
  },
  Mutation: {
    addItem: async (_, { input }, { prisma }) => {
      const cart = await findOrCreateCart(prisma, input.cartId);

      await prisma.cartItem.upsert({
        create: {
          cartId: cart.id,
          id: input.id,
          name: input.name,
          description: input.description,
          image: input.image,
          price: input.price,
          quantity: input.quantity || 1,
        },
        update: {
          quantity: {
            increment: input.quantity || 1,
          },
        },
        where: {
          id_cartId: {
            id: input.id,
            cartId: cart.id,
          },
        },
      });

      return cart;
    },
    removeItem: async (_, { input }, { prisma }) => {
      const { cartId } = await prisma.cartItem.delete({
        where: { id_cartId: { id: input.id, cartId: input.cartId } },
        select: {
          cartId: true,
        },
      });
      return findOrCreateCart(prisma, cartId);
    },
    increaseCartItem: async (_, { input }, { prisma }) => {
      const { cartId } = await prisma.cartItem.update({
        data: {
          quantity: {
            increment: 1,
          },
        },
        where: {
          id_cartId: {
            id: input.id,
            cartId: input.cartId,
          },
        },
        select: {
          cartId: true,
          quantity: true,
        },
      });
      return findOrCreateCart(prisma, cartId);
    },
    decreaseCartItem: async (_, { input }, { prisma }) => {
      const { cartId, quantity } = await prisma.cartItem.update({
        data: {
          quantity: {
            decrement: 1,
          },
        },
        where: {
          id_cartId: {
            id: input.id,
            cartId: input.cartId,
          },
        },
        select: {
          cartId: true,
          quantity: true,
        },
      });

      if (quantity <= 0) {
        await prisma.cartItem.delete({
          where: { id_cartId: { id: input.id, cartId: input.cartId } },
        });
      }

      return findOrCreateCart(prisma, cartId);
    },
    createCheckoutSession: async (_, { input }, { prisma }) => {
      const { cartId } = input;
      const cart = await prisma.cart.findUnique({
        where: {
          id: cartId,
        },
      });

      if (!cart) {
        throw new GraphQLYogaError("Invalid cart.");
      }

      const cartItems = await prisma.cart
        .findUnique({
          where: { id: cartId },
        })
        .items();

      if (!cartItems || cartItems.length === 0) {
        throw new GraphQLYogaError("Cart is empty.");
      }

      const line_items = validateCartItems(products, cartItems);

      const session = await stripe.checkout.sessions.create({
        success_url: `${origin}/thankyou?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart?cancelled=true`,
        line_items,
        metadata: {
          cartId: cart.id,
        },
        mode: "payment",
      });

      return {
        id: session.id,
        url: session.url,
      };
    },
  },
};

const server = createServer<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  endpoint: "/api",
  schema: {
    typeDefs,
    resolvers,
  },
  context: createContext(),
});

export default server;

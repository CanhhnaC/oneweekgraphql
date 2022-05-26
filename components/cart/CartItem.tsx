import Image from "next/image";
import { MinusIcon } from "components/icons/MinusIcon";
import { PlusIcon } from "components/icons/PlusIcon";

import {
  CartItem,
  GetCartDocument,
  useDecreaseCartItemMutation,
  useIncreaseCartItemMutation,
} from "types";

export function CartItem({ item, cartId }: { item: CartItem; cartId: string }) {
  const [increaseCartItem, { loading: increasingCartItem }] =
    useIncreaseCartItemMutation({
      refetchQueries: [GetCartDocument],
    });

  const [decreaseCartItem, { loading: decreasingCartItem }] =
    useDecreaseCartItemMutation({
      refetchQueries: [GetCartDocument],
    });

  function handleClickIncrease() {
    increaseCartItem({
      variables: { input: { id: item.id, cartId } },
    });
  }

  function handleClickDecrease() {
    decreaseCartItem({
      variables: { input: { id: item.id, cartId } },
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <Image
          src={item.image || ""}
          width={75}
          height={75}
          alt={item.name}
          objectFit="cover"
        />
        <div className="flex justify-between items-baseline flex-1 gap-2">
          <span className="text-lg">{item.name}</span>
          <span className="text-sm font-light">{item.unitTotal.formatted}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 flex">
          <div className="px-2 py-1 font-light border border-t-neutral-700 flex-1">
            {item.quantity}
          </div>
          <button
            onClick={handleClickDecrease}
            disabled={decreasingCartItem}
            className="p-1 font-light border border-neutral-700 hover:bg-black"
          >
            <MinusIcon />
          </button>
          <button
            onClick={handleClickIncrease}
            disabled={increasingCartItem}
            className="p-1 font-light border border-neutral-700 hover:bg-black"
          >
            <PlusIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

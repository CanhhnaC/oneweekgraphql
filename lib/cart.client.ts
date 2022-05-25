import { getCookie, setCookies } from "cookies-next";
import { v4 as uuid } from "uuid";

import type { IncomingMessage, ServerResponse } from "http";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";

export function getCartId({
  req,
  res,
}: {
  req: IncomingMessage & {
    cookies: NextApiRequestCookies;
  };
  res: ServerResponse;
}) {
  let cartId = getCookie("cartId", { req, res });
  if (!cartId) {
    const id = uuid();
    setCookies("cartId", id, { req, res });
    cartId = id;
  }
  return String(cartId);
}

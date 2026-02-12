import { SquareClient, SquareEnvironment } from "square";
import { getSquareAccessToken } from "./credentials";

const environment =
  process.env.SQUARE_ENVIRONMENT === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

export async function getSquareClient() {
  const token = await getSquareAccessToken();
  return new SquareClient({
    token,
    environment,
  });
}

export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID || "";

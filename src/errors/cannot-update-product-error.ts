import { ApplicationError } from "../protocols";

export function cannotUpdateProductError(): ApplicationError {
  return {
    name: "CannotUpdateProductError",
    message: "Não foi possível atualizar os preços. O arquivo apresenta dados inválidos.",
  };
}

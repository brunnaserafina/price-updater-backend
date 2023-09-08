import { ApplicationError } from "../protocols";

export function invalidHeadersCsvError(): ApplicationError {
  return {
    name: "InvalidHeadersCsvError",
    message:
      "Cabeçalhos Inválidos. Certifique-se de que o arquivo CSV possui os cabeçalhos corretos na ordem esperada ('product_code' e 'new_price').",
  };
}

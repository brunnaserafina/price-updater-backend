import { ApplicationError } from "../protocols";

export function invalidDataCsvError(): ApplicationError {
  return {
    name: "InvalidDataCsvError",
    message: "Conteúdo inválido, o arquivo CSV não possui os códigos e os novos preços dos produtos.",
  };
}

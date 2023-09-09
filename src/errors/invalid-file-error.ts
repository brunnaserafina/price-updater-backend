import { ApplicationError } from "../protocols";

export function invalidFileError(): ApplicationError {
  return {
    name: "InvalidFileError",
    message: "Arquivo inválido!",
  };
}

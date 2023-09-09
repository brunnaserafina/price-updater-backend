import csv from "csvtojson";
import { invalidHeadersCsvError } from "@/errors/invalid-headers-csv-error";
import { invalidDataCsvError } from "@/errors/invalid-data-csv-error";

export async function validateAndConvertCsvToJson(buffer: Buffer) {
  const jsonArray = await csv().fromString(buffer.toString());

  if (jsonArray.length === 0) {
    throw invalidDataCsvError();
  }

  const expectedHeaders = ["product_code", "new_price"];
  const csvHeaders = Object.keys(jsonArray[0]);

  if (JSON.stringify(csvHeaders) !== JSON.stringify(expectedHeaders)) {
    throw invalidHeadersCsvError();
  }

  return jsonArray;
}

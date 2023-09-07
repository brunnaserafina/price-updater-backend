import { NextFunction, Request, Response } from "express";
import { invalidFileError } from "@/errors/invalid-file-error";

export interface BufferRequest extends Request {
  buffer?: Buffer;
}

export async function csvValidateFile(req: BufferRequest, _res: Response, next: NextFunction) {
  try {
    const file = req.file;

    if (file) {
      const buffer = file.buffer;
      req.buffer = buffer;

      return next();
    }
  } catch (err) {
    throw invalidFileError();
  }
}

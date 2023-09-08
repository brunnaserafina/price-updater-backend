import { NextFunction, Request, Response } from "express";
import { invalidFileError } from "@/errors/invalid-file-error";
import httpStatus from "http-status";

export interface BufferRequest extends Request {
  buffer?: Buffer;
}

export async function csvValidateFile(req: BufferRequest, res: Response, next: NextFunction) {
  try {
    const file = req.file;

    if (file.mimetype !== "text/csv") throw invalidFileError();

    if (file) {
      const buffer = file.buffer;
      req.buffer = buffer;

      return next();
    }
  } catch (err) {
    return res.status(httpStatus.UNSUPPORTED_MEDIA_TYPE).send(invalidFileError());
  }
}

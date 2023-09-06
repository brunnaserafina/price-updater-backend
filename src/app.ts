import express, { Express } from "express";
import cors from "cors";

import { connectDb, disconnectDb } from "./config/database";
import { loadEnv } from "./config/envs";

loadEnv();

const app: Express = express();

app
  .use(cors())
  .use(express.json())
  .get("/status", (req, res) => {
    res.send("Ok!");
  });

export function init(): Promise<Express> {
  connectDb();
  return Promise.resolve(app);
}

export async function close(): Promise<void> {
  await disconnectDb();
}

export default app;

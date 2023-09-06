import express from "express";
import cors from "cors";

const app = express();

app
  .use(cors())
  .use(express.json())
  .get("/status", (req, res) => {
    res.send("Ok!");
  });

export default app;

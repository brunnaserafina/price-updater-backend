import express from "express";

const server = express();

const port = process.env.PORT || 5000;

server.get("/status", (req, res) => {
  res.send("Ok!");
});

server.listen(port, () => {
  /* eslint-disable-next-line no-console */
  console.log("Running on port " + port);
});

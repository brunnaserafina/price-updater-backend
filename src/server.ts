import app from "./app";

const port = process.env.PORT || 5000;

app.listen(port, () => {
  /* eslint-disable-next-line no-console */
  console.log("Running on port " + port);
});

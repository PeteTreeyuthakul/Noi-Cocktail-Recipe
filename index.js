const server = require("./server");
const mongoose = require("mongoose");

const port = process.env.PORT || 3000;

mongoose
  .connect("mongodb://127.0.0.1/noi-cocktail-recipe", {})
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`);
    });
  })
  .catch((e) => {
    console.error(`Failed to start server:`, e);
  });
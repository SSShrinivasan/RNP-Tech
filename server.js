require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const routes = require("./routes");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://rnpfr.netlify.app"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/api", routes);

connectDB();
connectDB();

//  IMPORTANT: only start server if NOT in test
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

//  EXPORT APP FOR TESTING
module.exports = app;

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
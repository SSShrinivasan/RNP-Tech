require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const routes = require("./routes");
const app = express();
app.use(express.json());
app.use("/api", routes);


// DB connection
connectDB();

//  Using PORT from env
const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
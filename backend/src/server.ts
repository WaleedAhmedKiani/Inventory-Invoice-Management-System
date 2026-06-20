import app from "./app.js";
import dotenv from "dotenv";
import redis from "./config/redis.js";

dotenv.config();
const PORT = process.env.PORT || 5000;

console.log(" Redis status: is", redis.status);

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
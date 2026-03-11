import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
});

export default app;
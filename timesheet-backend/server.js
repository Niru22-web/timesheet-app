import express from "express";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://13.232.211.142"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.options("*", cors());


app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
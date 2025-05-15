import express from "express";
import cors from "cors"
import morgan from "morgan"
const bodyParser = require('body-parser');

export const app = express();

app.use(
    cors({
      origin: ["http://localhost:3000", "https://dashboard.trip-swift.ai", "http://localhost:3004", "http://localhost:3001", "https://app.trip-swift.ai"], 
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
      allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"],
      credentials: true,
    })
  );

// Increase the payload size limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ 
    limit: '50mb', 
    extended: true 
}));

// app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(express.json({ limit: '50mb' }));


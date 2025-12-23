import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import customerRoutes from "./routes/customer.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import { connectToSheets } from "./services/sheets.service.js";

dotenv.config();

// Connect to Google Sheets (or Mock)
connectToSheets();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get("/", (req: Request, res: Response) => {
  res.send("Smart Khata Backend is Running");
});

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/transactions", transactionRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ error: "Something went wrong!", message: err.message });
});

// Check if this module is the main module
import { fileURLToPath } from "url";
import path from "path";

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In ES modules, we can check if the file is being run directly by comparing the process.argv[1]
if (process.argv[1] === __filename) {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
}

export default app;

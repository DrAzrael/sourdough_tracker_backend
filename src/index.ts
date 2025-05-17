import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import { connectToDatabase } from "./config/db"
import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"

// Load environment variables
dotenv.config()

// Initialize express app
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Connect to MongoDB
connectToDatabase()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app

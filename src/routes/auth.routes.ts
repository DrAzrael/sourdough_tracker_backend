import express from "express"
import { login, register, refreshToken, logout } from "../controllers/auth.controller"

const router = express.Router()

// Authentication routes
router.post("/login", login)
router.post("/register", register)
router.post("/refresh-token", refreshToken)
router.post("/logout", logout)

export default router

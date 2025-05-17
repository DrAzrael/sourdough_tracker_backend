import express from "express"
import { verifyAccessToken } from "../auth"

const router = express.Router()

// Protected route example
router.get("/profile", verifyAccessToken, (req, res) => {
  res.status(200).json({
    message: "Profile accessed successfully",
    user: req.user,
  })
})

export default router

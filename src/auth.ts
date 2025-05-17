import jwt from "jsonwebtoken"
import * as dotenv from "dotenv"
import type { Request, Response, NextFunction } from "express"
import type { User } from "./item.model"

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        username: string
      }
    }
  }
}

dotenv.config()

// Token secrets
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("Missing JWT secrets in environment variables")
}

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "15m" // Short-lived
const REFRESH_TOKEN_EXPIRY = "7d" // Long-lived

export function generateTokens(user: User) {
  const accessToken = jwt.sign({ userId: user._id.toString(), username: user.login }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  })

  const refreshToken = jwt.sign({ userId: user._id.toString() }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  })

  return { accessToken, refreshToken }
}

export function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(" ")[1] // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" })
    }

    // Attach user data to the request
    req.user = decoded as { userId: string; username: string }
    next()
  })
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string }
  } catch (err) {
    return null
  }
}

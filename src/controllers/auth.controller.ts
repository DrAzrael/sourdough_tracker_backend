import type { Request, Response } from "express"
import { ObjectId } from "mongodb"
import bcrypt from "bcrypt"
import { getDb } from "../config/db"
import { generateTokens } from "../auth"
import type { User } from "../item.model"

export async function login(req: Request, res: Response) {
  try {
    const { login, password } = req.body

    // Validate request
    if (!login || !password) {
      return res.status(400).json({ message: "Login and password are required" })
    }

    const db = getDb()
    const usersCollection = db.collection("users")

    // Find user by login
    const user = (await usersCollection.findOne({ login })) as User

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.pass)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user)

    // Store refresh token in database
    await usersCollection.updateOne({ _id: user._id }, { $set: { refreshToken } })

    // Return tokens
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        login: user.login,
        roblox_username: user.roblox_username,
        user_state: user.user_state,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { login, password, roblox_username } = req.body

    // Validate request
    if (!login || !password || !roblox_username) {
      return res.status(400).json({
        message: "Login, password, and roblox_username are required",
      })
    }

    const db = getDb()
    const usersCollection = db.collection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ login })
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const newUser = {
      _id: new ObjectId(),
      login,
      pass: hashedPassword,
      roblox_username,
      user_state: 1, // Default user state
      refreshToken: null,
    }

    // Insert user into database
    await usersCollection.insertOne(newUser)

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser as User)

    // Update user with refresh token
    await usersCollection.updateOne({ _id: newUser._id }, { $set: { refreshToken } })

    // Return user data and tokens
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        login: newUser.login,
        roblox_username: newUser.roblox_username,
        user_state: newUser.user_state,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" })
    }

    // Verify refresh token
    const decoded = await import("../auth").then((auth) => auth.verifyRefreshToken(refreshToken))

    if (!decoded) {
      return res.status(403).json({ message: "Invalid or expired refresh token" })
    }

    const db = getDb()
    const usersCollection = db.collection("users")

    // Find user by ID
    const user = (await usersCollection.findOne({
      _id: new ObjectId(decoded.userId),
      refreshToken,
    })) as User

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" })
    }

    // Generate new tokens
    const tokens = generateTokens(user)

    // Update refresh token in database
    await usersCollection.updateOne({ _id: user._id }, { $set: { refreshToken: tokens.refreshToken } })

    return res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" })
    }

    const db = getDb()
    const usersCollection = db.collection("users")

    // Remove refresh token from database
    await usersCollection.updateOne({ refreshToken }, { $set: { refreshToken: null } })

    return res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

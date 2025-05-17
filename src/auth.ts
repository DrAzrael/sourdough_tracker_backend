import jwt from "jsonwebtoken"
import * as dotenv from "dotenv";
dotenv.config();

//token secrets
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("Missing JWT secrets in environment variables");
}

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "15m";  // Short-lived  
const REFRESH_TOKEN_EXPIRY = "7d";  // Long-lived

import { Request, Response, NextFunction } from "express";
import { User } from "./item.model";


export function genTokens(user: User) {
const accessToken = jwt.sign(
    { userId: user._id, username: user.login },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

export function checkToken(req: any, res: any) {
    const token = req.headers.authorization

    if (!token) {
        return res.status(401).json({ message: "No token provided." })
    }

    // verification here
}
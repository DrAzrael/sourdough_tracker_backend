import jwt from "jsonwebtoken"
import * as dotenv from "dotenv";
dotenv.config();

//token secrets
// const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
// const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

// if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
//   throw new Error("Missing JWT secrets in environment variables");
// }

// Token expiration times
// const ACCESS_TOKEN_EXPIRY = "15m";  // Short-lived  
// const REFRESH_TOKEN_EXPIRY = "7d";  // Long-lived

import { Request, Response, NextFunction } from "express";
import { User, JwtPayload } from "./item.model";


// export function genTokens(user: User) {
// const accessToken = jwt.sign(
//     { userId: user._id, username: user.login },
//     ACCESS_TOKEN_SECRET,
//     { expiresIn: ACCESS_TOKEN_EXPIRY }
//   );

//   const refreshToken = jwt.sign(
//     { userId: user._id },
//     REFRESH_TOKEN_SECRET,
//     { expiresIn: REFRESH_TOKEN_EXPIRY }
//   );

//   return { accessToken, refreshToken };
// }

export function genToken(user: User): string {
    if (!process.env.SECRET) {
        throw new Error("JWT secret is not defined in environment variables.");
    }

    const token = jwt.sign(
        { login: user.login }, 
        process.env.SECRET, 
        { expiresIn: "1d" }
    );

    return token;
}

export function checkToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
        if (!process.env.SECRET) {
        res.status(500).json({ message: "Server misconfiguration." });
        }

        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                res.status(401).json({ message: "Invalid token." });
            }

            // Type guard to ensure decoded matches JwtPayload
            if (decoded && typeof decoded === 'object' && 'login' in decoded) {
                req.user = (decoded as JwtPayload).login; // Assign login to req.user
                next();
            } else {
                res.status(401).json({ message: "Malformed token payload." });
            }
        });
    }
    else{
      res.status(401).json({ message: "No token provided." });
    }
    
}

// export function userFromToken(req: Request, res: Response, next: NextFunction){
//     const authHeader = req.headers.authorization;
//     const token = authHeader?.split(' ')[1];

//     if (!token) {
//         res.status(401).json({ message: 'No token provided' });
//     }
//     else{
//         jwt.verify(token, process.env.SECRET, (err, decoded)=> {
//             if (err) {
//                 res.status(401).json({ message: "Invalid token." });
//             }

//             // Type guard to ensure decoded matches JwtPayload
//             if (decoded && typeof decoded === 'object' && 'login' in decoded) {
//                 req.user = (decoded as JwtPayload).login; // Assign login to req.user
//                 next();
//             } else {
//                 res.status(401).json({ message: "Malformed token payload." });
//             }
//         })
//     }
    
// }
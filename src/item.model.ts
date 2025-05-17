import { ObjectId, WithId } from 'mongodb';

// export interface Village {
//     x: number;
//     y: number;
//     image: string;
//     name: string;
//     slogan: string;
//     mayor: string;
//     confirmed: boolean;
// }

// export interface Info {
//     x: number;
//     y: number;
//     type_id: number;
//     value: number;
//     edit_date: Date;
//     confirmed: boolean;
// }

export interface UserSchema {
  _id: ObjectId;
  login: string;
  pass: string;
  roblox_username: string;
  user_state: number;
}

export interface RegisterRequest {
    username: string;
    login: string;
    password: string;
}

export interface LoginRequest {
    login: string;
    password: string;
}

export type User = WithId<Document> & UserSchema;

export interface JwtPayload {
    login: string;
    // Add other fields if needed (e.g., userId, role)
}
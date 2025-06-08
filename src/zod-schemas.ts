import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { isDate } from 'util/types';

const objectIdSchema = z.string().refine(val => ObjectId.isValid(val), {
  message: "Invalid ObjectId format"
});

export const RegisterRequestSchema = z.object({
  username: z.string().min(1, "Username is required."),
  login: z.string().email("Invalid email format."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

export const LoginRequestSchema = z.object({
  login: z.string().email("Invalid email format."),
  password: z.string().min(1, "Password is required.")
});

export const VillageStatsRequestSchema = z.object({
  village_id: objectIdSchema
});

export const VillageStatHistoryRequestSchema = z.object({
  village_id: objectIdSchema,
  stat_type_id: objectIdSchema
});

export const VillageRequestSchema = z.object({
  x: z.number().int("X coordinate must be an int."),
  y: z.number().int("Y coordinate must be an int.")
});

// Optional: You can also derive TypeScript types from the schemas
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type VillageStatsRequest = z.infer<typeof VillageStatsRequestSchema>;
export type VillageStatHistoryRequest = z.infer<typeof VillageStatHistoryRequestSchema>;
export type VillageRequest = z.infer<typeof VillageRequestSchema>;



export const VillagePostSchema = z.object({
  x: z.number().int("X coordinate must be an int."),
  y: z.number().int("Y coordinate must be an int."),
  mayor: z.string().min(1, "Mayors username is required."),
  name: z.string().min(1, "Username is required.")  
});


export const VillageDeleteSchema = z.object({
    x: z.number(),
    y: z.number()
});
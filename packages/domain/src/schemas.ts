import { z } from "zod";

// Ethiopian mobile: 09xxxxxxxx, 07xxxxxxxx, +2519xxxxxxxx or +2517xxxxxxxx
const phone = z
  .string()
  .trim()
  .regex(/^(\+251|0)[79]\d{8}$/, "Enter a valid Ethiopian mobile number");

const location = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  label: z.string().trim().min(1, "Choose a location"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60, "Name is too long"),
  phone,
  role: z.enum(["client", "worker"]),
  password: z.string().min(8, "Use at least 8 characters"), // confirm with the login design
});

export const loginSchema = z.object({
  phone,
  password: z.string().min(1, "Enter your password"),
});

export const jobSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(80, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(10, "Describe the work in at least 10 characters")
    .max(1000, "Description is too long"),
  skills: z.array(z.string()).min(1, "Choose at least 1 skill").max(5, "Choose at most 5 skills"),
  location,
});

export const profileSchema = z.object({
  skills: z.array(z.string()).min(1, "Choose at least 1 skill"),
  experienceYears: z.coerce.number().int().min(0).max(50),
  about: z.string().trim().max(500, "Keep it under 500 characters").optional(),
  location,
});

export const ratingSchema = z.object({
  stars: z.coerce.number().int().min(1, "Choose 1 to 5 stars").max(5),
  comment: z.string().trim().max(500, "Keep it under 500 characters").optional(),
});

export const messageSchema = z.object({
  text: z.string().trim().min(1).max(1000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type MessageInput = z.infer<typeof messageSchema>;

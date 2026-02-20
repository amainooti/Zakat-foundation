// lib/validations/blog.ts
import { z } from "zod";

export const blogPostSchema = z.object({
  title:       z.string().min(1, "Title is required"),
  slug:        z.string().min(1, "Slug is required"),
  excerpt:     z.string().optional(),
  content:     z.string().optional(),
  cover_image: z.string().optional(),
  category:    z.string().optional(),
  tags:        z.array(z.string()).default([]),      // ← .default([]) makes it required in output
  published:   z.boolean().default(false),           // ← .default(false) makes it required in output
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>; // derive from schema, don't hand-write it
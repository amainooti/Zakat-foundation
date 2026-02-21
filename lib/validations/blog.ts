import { z } from "zod";

export const blogPostSchema = z.object({
  title:       z.string().min(3, "Title must be at least 3 characters"),
  slug:        z.string().min(3, "Slug must be at least 3 characters")
                 .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  excerpt:     z.string().max(300, "Excerpt must be under 300 characters").optional(),
  content:     z.string().optional(),
  cover_image: z.string().optional(),
  category:    z.string().optional(),
  tags:        z.array(z.string()).default([]),
  published:   z.boolean().default(false),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;
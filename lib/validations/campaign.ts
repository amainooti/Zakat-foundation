import { z } from "zod";

export const campaignSchema = z.object({
  title:         z.string().min(3, "Title must be at least 3 characters"),
  slug:          z.string().min(3, "Slug must be at least 3 characters")
                   .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  subtitle:      z.string().optional(),
  description:   z.string().optional(),
  cover_image:   z.string().optional(),
  location:      z.string().optional(),
  status:        z.enum(["active", "urgent", "completed", "archived"]).default("active"),
  category:      z.string().optional(),
  tags:          z.array(z.string()).default([]),
  target_amount: z.coerce.number().positive("Target amount must be greater than 0"),
  is_featured:   z.boolean().default(false),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

export const contributionSchema = z.object({
  amount:      z.coerce.number().positive("Amount must be greater than 0"),
  currency:    z.string().default("USD"),
  note:        z.string().optional(),
  donor_name:  z.string().optional(),
  donor_email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export type ContributionFormData = z.infer<typeof contributionSchema>;
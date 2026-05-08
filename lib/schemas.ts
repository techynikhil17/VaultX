import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

const VALID_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export const vaultEntrySchema = z.object({
  site_name: z.string().min(1, "Site name is required").max(120),
  username: z.string().max(200).refine(
    (val) => !val.includes("@") || VALID_EMAIL_RE.test(val),
    { message: "Looks like an email but the domain isn't valid — try user@gmail.com" }
  ),
  password: z.string().min(1, "Password is required").max(500),
  url: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  category: z.enum(["Social", "Work", "Finance", "Email", "Shopping", "Entertainment", "Other"]),
});

export type VaultEntryInput = z.infer<typeof vaultEntrySchema>;

export const CATEGORIES = [
  "Social", "Work", "Finance", "Email", "Shopping", "Entertainment", "Other",
] as const;

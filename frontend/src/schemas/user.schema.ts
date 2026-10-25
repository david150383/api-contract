import { z } from "zod";
import { zUserCreate } from "../api/generated/zod.gen";

// Start with backend-generated validation.
export const userCreateFormSchema = zUserCreate.extend({
  // Frontend-only validation for a better user experience.
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .refine(
      (value) => /[a-zA-Z]/.test(value),
      "Name must contain at least one letter",
    ),
});

export type UserCreateFormValues = z.infer<typeof userCreateFormSchema>;

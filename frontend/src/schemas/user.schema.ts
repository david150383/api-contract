import { z } from "zod";
import { zUserCreate } from "../api/generated/zod.gen";

// Shared validation for create and update forms.
const userBaseFormSchema = zUserCreate.extend({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .refine(
      (value) => /[a-zA-Z]/.test(value),
      "Name must contain at least one letter",
    ),
});

// Update requires isActive, while create lets the backend set it.
export const userCreateFormSchema = userBaseFormSchema;

export const userUpdateFormSchema = userBaseFormSchema.extend({
  isActive: z.boolean(),
});

export type UserCreateFormValues = z.output<typeof userCreateFormSchema>;

export type UserUpdateFormValues = z.output<typeof userUpdateFormSchema>;

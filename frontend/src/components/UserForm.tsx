import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UserOut } from "../api/generated";

const userSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters"),
  email: z.email("Enter a valid email address"),
  is_active: z.boolean(),
});

export type UserFormValues = z.infer<typeof userSchema>;

type UserFormProps = {
  user?: UserOut | null;
  onSave: (values: UserFormValues) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
};

export default function UserForm({
  user,
  onSave,
  onCancel,
  submitting,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      is_active: true,
    },
  });

  useEffect(() => {
    reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
      is_active: user?.is_active ?? true,
    });
  }, [user, reset]);

  return (
    <form onSubmit={handleSubmit(onSave)} className="user-form" noValidate>
      <h2>{user ? "Edit user" : "Create user"}</h2>

      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          {...register("name")}
          placeholder="John Doe"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john@example.com"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>

      <label className="checkbox-field">
        <input type="checkbox" {...register("is_active")} />
        Active user
      </label>

      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : user ? "Update user" : "Create user"}
        </button>

        {user && (
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

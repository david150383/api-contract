import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UserOut } from "../api/generated";
import {
  userCreateFormSchema,
  type UserCreateFormValues,
} from "../schemas/user.schema";
import type { UserField } from "../api/api-errors";

type UserFormProps = {
  user?: UserOut | null;
  onSave: (values: UserCreateFormValues) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  serverErrors: Partial<Record<UserField, string>>;
  onClearServerError: (field: UserField) => void;
};

export default function UserForm({
  user,
  onSave,
  onCancel,
  submitting,
  serverErrors,
  onClearServerError,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateFormSchema),
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
          {...register("name", {
            onChange: () => onClearServerError("name"),
          })}
          aria-invalid={Boolean(errors.name || serverErrors.name)}
        />
        {(errors.name?.message || serverErrors.name) && (
          <p className="field-error">
            {errors.name?.message ?? serverErrors.name}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register("email", {
            onChange: () => onClearServerError("email"),
          })}
          aria-invalid={Boolean(errors.email || serverErrors.email)}
        />
        {(errors.email?.message || serverErrors.email) && (
          <p className="field-error">
            {errors.email?.message ?? serverErrors.email}
          </p>
        )}
      </div>

      <label className="checkbox-field">
        <input
          type="checkbox"
          {...register("is_active", {
            onChange: () => onClearServerError("is_active"),
          })}
        />
        Active user
      </label>

      {serverErrors.is_active && (
        <p className="field-error">{serverErrors.is_active}</p>
      )}

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

import { useCallback, useEffect, useState } from "react";
import {
  createUser,
  deleteUser as deleteUserApi,
  listUsers,
  updateUser,
} from "./api/generated";
import type { UserOut } from "./api/generated";
import UserForm, { type UserFormValues } from "./components/UserForm";
import { parseApiError, type UserField } from "./api/api-errors";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "detail" in error) {
    const detail = error.detail;

    if (typeof detail === "string") {
      return detail;
    }
  }

  return "Something went wrong. Please try again.";
}

function clearServerError(field: UserField) {
  setServerErrors((current) => ({
    ...current,
    [field]: undefined,
  }));
}

export default function App() {
  const [users, setUsers] = useState<UserOut[]>([]);
  const [editingUser, setEditingUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<
    Partial<Record<UserField, string>>
  >({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listUsers();

      if (response.error) {
        throw new Error(getErrorMessage(response.error));
      }

      setUsers(response.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleSave(values: UserFormValues) {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setServerErrors({});

    try {
      const response = editingUser
        ? await updateUser({
            path: { user_id: editingUser.id },
            body: values,
          })
        : await createUser({
            body: values,
          });

      if (response.error) {
        const apiError = parseApiError(response.error);

        setServerErrors(apiError.fieldErrors);
        setError(apiError.message);
        return;
      }

      setSuccess(
        editingUser
          ? "User updated successfully."
          : "User created successfully.",
      );

      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      const apiError = parseApiError(err);
      setServerErrors(apiError.fieldErrors);
      setError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(user: UserOut) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(user.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await deleteUserApi({
        path: { user_id: user.id },
      });

      if (response.error) {
        throw new Error(getErrorMessage(response.error));
      }

      if (editingUser?.id === user.id) {
        setEditingUser(null);
      }

      setSuccess("User deleted successfully.");
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage users through your FastAPI backend.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            setError(null);
            setSuccess(null);
          }}
        >
          + New user
        </button>
      </header>

      {error && (
        <div className="alert error-alert" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert success-alert" role="status">
          {success}
        </div>
      )}

      <section className="form-panel">
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => setEditingUser(null)}
          submitting={submitting}
          serverErrors={serverErrors}
          onClearServerError={clearServerError}
        />
      </section>

      <section className="users-section">
        <div className="section-header">
          <h2>Users</h2>
          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadUsers()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found. Create your first user above.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={
                          user.is_active ? "status active" : "status inactive"
                        }
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setEditingUser(user);
                            setError(null);
                            setSuccess(null);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => void handleDelete(user)}
                          disabled={deletingId === user.id}
                        >
                          {deletingId === user.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

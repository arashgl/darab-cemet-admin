import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

interface Category {
  id: number;
  name: string;
  description?: string;
}

export function CategoryManager() {
  const { user, token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Category>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories(
        editingId
          ? categories.map((c) => (c.id === editingId ? updated : c))
          : [...categories, updated]
      );
      setForm({});
      setEditingId(null);
    }
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, description: cat.description });
    setEditingId(cat.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setCategories(categories.filter((c) => c.id !== id));
  };

  if (loading) return <div>Loading categories...</div>;

  return (
    <div className="p-4 bg-white rounded shadow mb-6">
      <h2 className="text-lg font-bold mb-2">Categories</h2>
      <ul className="mb-4">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between py-1">
            <span>
              <b>{cat.name}</b>{" "}
              {cat.description && <span>- {cat.description}</span>}
            </span>
            {isAdmin && (
              <span>
                <button
                  className="text-blue-600 mr-2"
                  onClick={() => handleEdit(cat)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600"
                  onClick={() => handleDelete(cat.id)}
                >
                  Delete
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
      {isAdmin && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            placeholder="Category name"
            required
            className="border p-1 rounded"
          />
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            placeholder="Description (optional)"
            className="border p-1 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-3 py-1"
          >
            {editingId ? "Update" : "Create"} Category
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({});
              }}
              className="text-gray-500"
            >
              Cancel
            </button>
          )}
        </form>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, Tags, Plus, Trash2, ShieldAlert } from "lucide-react";

import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";

export default function AdminCategoriesPage() {
  const { data: session, isPending } = authClient.useSession();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const isAdmin = (session?.user as any)?.role === "admin";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && token) {
      fetchCategories();
    }
  }, [isAdmin, token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsCreating(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        showToast("Category created!", "success");
        setName("");
        setDescription("");
        fetchCategories();
      } else {
        throw new Error(data.error || "Failed to create category");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Category deleted", "success");
        fetchCategories();
      } else {
        throw new Error(data.error || "Failed to delete");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ShieldAlert className="h-16 w-16 text-danger mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 bg-background">
      <div className="flex flex-col gap-1 border-b border-default-100 dark:border-zinc-800 pb-6">
        <DynamicBreadcrumb />
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-2 flex items-center gap-3">
          <Tags className="h-8 w-8 text-primary" />
          Categories Management
        </h1>
        <p className="text-default-500 font-medium">Manage recipe taxonomy and platform categories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Create Category Form */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-default-50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-default-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Add Category
            </h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-default-600 uppercase tracking-wider mb-2 block">Name</label>
                <input 
                  type="text"
                  className="w-full bg-default-100 hover:bg-default-200 focus:bg-white dark:focus:bg-zinc-900 border-2 border-transparent focus:border-primary rounded-xl p-3 text-sm transition-all outline-none text-foreground"
                  placeholder="e.g. Dessert"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-default-600 uppercase tracking-wider mb-2 block">Description (Optional)</label>
                <textarea 
                  className="w-full bg-default-100 hover:bg-default-200 focus:bg-white dark:focus:bg-zinc-900 border-2 border-transparent focus:border-primary rounded-xl p-3 text-sm transition-all resize-y min-h-[100px] outline-none text-foreground"
                  placeholder="Short description of this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <button 
                type="submit"
                disabled={isCreating || !name.trim()}
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Category
              </button>
            </form>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-default-50 dark:bg-zinc-900/50 rounded-3xl border border-default-200 dark:border-zinc-800 flex flex-col items-center">
                <Tags className="h-12 w-12 text-default-300 mb-4" />
                <h3 className="text-lg font-bold text-foreground">No Categories</h3>
                <p className="text-default-500 mt-2">Create your first recipe category to get started.</p>
              </div>
            ) : (
              categories.map((cat, i) => (
                <div key={i} className="bg-default-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-default-200 dark:border-zinc-800 flex flex-col justify-between group">
                  <div>
                    <h4 className="text-lg font-bold text-foreground capitalize">{cat.name}</h4>
                    {cat.description && (
                      <p className="text-sm text-default-500 mt-1 line-clamp-2">{cat.description}</p>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between items-center border-t border-default-200 dark:border-zinc-800 pt-4">
                    <span className="text-xs font-medium text-default-400">ID: {cat._id.slice(-6)}</span>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-danger-500 hover:text-danger-600 bg-danger/10 hover:bg-danger/20 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`px-6 py-3 rounded-2xl shadow-xl font-medium text-sm flex items-center gap-2 border text-white ${toast.type === "success" ? "bg-zinc-900 border-emerald-500" : "bg-danger border-danger-600"}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

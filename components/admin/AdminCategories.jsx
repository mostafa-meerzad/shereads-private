"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/apiClient";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/category");
      return data.categories; // flat array: [{ id, name, parentId }]
    },
  });
}

export default function AdminCategories() {
  const qc = useQueryClient();
  const { data: categories = [], status } = useCategories();

  const [newName, setNewName] = useState("");
  const [addingSubFor, setAddingSubFor] = useState(null); // parent category id
  const [subName, setSubName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const topLevel = categories.filter((c) => c.parentId === null);
  const childrenOf = (parentId) =>
    categories.filter((c) => c.parentId === parentId);

  const createMutation = useMutation({
    mutationFn: async ({ name, parentId }) => {
      const { data } = await api.post("/category", {
        name,
        parentId: parentId ?? null,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("دسته‌بندی ایجاد شد");
      qc.invalidateQueries({ queryKey: ["categories"] });
      setNewName("");
      setAddingSubFor(null);
      setSubName("");
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "خطا در ایجاد دسته‌بندی"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      const { data } = await api.patch(`/category/${id}`, { name });
      return data;
    },
    onSuccess: () => {
      toast.success("نام بروزرسانی شد");
      qc.invalidateQueries({ queryKey: ["categories"] });
      setEditingId(null);
    },
    onError: (e) => toast.error(e?.response?.data?.error || "خطا در بروزرسانی"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/category/${id}`);
    },
    onSuccess: () => {
      toast.success("دسته‌بندی حذف شد");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "خطا در حذف دسته‌بندی"),
  });

  const confirmDelete = (cat) => {
    toast(
      (t) => (
        <div dir="rtl" className="p-2">
          <div className="text-sm">حذف «{cat.name}»؟</div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                deleteMutation.mutate(cat.id);
                toast.dismiss(t.id);
              }}
              className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white h-8 px-3 text-sm"
            >
              بله
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg border px-3 h-8 text-sm"
            >
              خیر
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  };

  const handleCreateTopLevel = () => {
    const name = newName.trim();
    if (!name) return;
    createMutation.mutate({ name, parentId: null });
  };

  const handleCreateSub = (parentId) => {
    const name = subName.trim();
    if (!name) return;
    createMutation.mutate({ name, parentId });
  };

  const handleUpdate = (id) => {
    const name = editName.trim();
    if (!name) return;
    updateMutation.mutate({ id, name });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Add top-level category */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="نام دسته‌بندی جدید..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="rounded-full max-w-xs"
          onKeyDown={(e) => e.key === "Enter" && handleCreateTopLevel()}
        />
        <Button
          onClick={handleCreateTopLevel}
          disabled={!newName.trim() || createMutation.isPending}
          className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          افزودن دسته‌بندی
        </Button>
      </div>

      {/* Category tree */}
      {status === "pending" ? (
        <div className="h-32 flex items-center justify-center">
          <Spinner className="size-8" />
        </div>
      ) : status === "error" ? (
        <div className="text-red-600 text-center">
          خطا در بارگذاری دسته‌بندی‌ها
        </div>
      ) : topLevel.length === 0 ? (
        <div className="text-slate-500 text-center py-8">
          هیچ دسته‌بندی‌ای وجود ندارد. اولین دسته‌بندی را بسازید.
        </div>
      ) : (
        <div className="space-y-3">
          {topLevel.map((cat) => {
            const children = childrenOf(cat.id);
            return (
              <div
                key={cat.id}
                className="border rounded-xl p-4 space-y-3 bg-gray-50"
              >
                {/* Parent category row */}
                <div className="flex items-center gap-2">
                  {editingId === cat.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="rounded-full max-w-xs"
                        autoFocus
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleUpdate(cat.id)
                        }
                      />
                      <Button
                        size="sm"
                        className="rounded-full bg-emerald-700 text-white"
                        onClick={() => handleUpdate(cat.id)}
                        disabled={updateMutation.isPending}
                      >
                        ذخیره
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setEditingId(null)}
                      >
                        لغو
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-emerald-800 flex-1 text-base">
                        {cat.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {children.length} زیرشاخه
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                        }}
                      >
                        ویرایش
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs"
                        onClick={() => confirmDelete(cat)}
                      >
                        حذف
                      </Button>
                    </>
                  )}
                </div>

                {/* Subcategory rows */}
                {children.length > 0 && (
                  <div className="space-y-2 pr-4 border-r-2 border-emerald-200">
                    {children.map((child) => (
                      <div key={child.id} className="flex items-center gap-2">
                        {editingId === child.id ? (
                          <>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="rounded-full max-w-xs"
                              autoFocus
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleUpdate(child.id)
                              }
                            />
                            <Button
                              size="sm"
                              className="rounded-full bg-emerald-700 text-white"
                              onClick={() => handleUpdate(child.id)}
                              disabled={updateMutation.isPending}
                            >
                              ذخیره
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => setEditingId(null)}
                            >
                              لغو
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-gray-700 flex-1">
                              {child.name}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs"
                              onClick={() => {
                                setEditingId(child.id);
                                setEditName(child.name);
                              }}
                            >
                              ویرایش
                            </Button>
                            <Button
                              size="sm"
                              className="rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs"
                              onClick={() => confirmDelete(child)}
                            >
                              حذف
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add subcategory */}
                {addingSubFor === cat.id ? (
                  <div className="flex gap-2 items-center pr-4">
                    <Input
                      placeholder="نام زیرشاخه..."
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      className="rounded-full max-w-xs"
                      autoFocus
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateSub(cat.id)
                      }
                    />
                    <Button
                      size="sm"
                      className="rounded-full bg-emerald-700 text-white"
                      onClick={() => handleCreateSub(cat.id)}
                      disabled={!subName.trim() || createMutation.isPending}
                    >
                      افزودن
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setAddingSubFor(null);
                        setSubName("");
                      }}
                    >
                      لغو
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingSubFor(cat.id);
                      setSubName("");
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-900 pr-4"
                  >
                    + افزودن زیرشاخه
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

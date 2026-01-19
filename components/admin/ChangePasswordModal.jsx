"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChangePasswordModal({ user, open, onOpenChange, onConfirm }) {
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    onConfirm(password);
    setPassword("");
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-label="تغییر رمز عبور"
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden relative p-6"
            dir="rtl"
          >
            <Dialog.Title className="text-lg font-bold mb-4">
              تغییر رمز عبور برای {user?.email}
            </Dialog.Title>
            
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 left-3 rounded-md p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 z-50 bg-gray-200"
            >
              <XIcon className="size-5" />
            </button>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">رمز عبور جدید:</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور جدید را وارد کنید"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleConfirm}
                  disabled={!password || password.length < 6}
                >
                  تایید و تغییر رمز
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  انصراف
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

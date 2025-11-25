"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import AllBooks from "@/components/pages/AllBooks";
import FavoriteBooks from "@/components/pages/FavoriteBooks";
import ReadingBooks from "@/components/pages/ReadingBooks";
import RecommendedBooks from "@/components/pages/RecommendedBooks";
import SidebarUi from "@/components/SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthClient } from "@/hooks/useAuthClient";
import { BookMarked, Component, Heart, Library } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import SettingsModal from "@/components/SettingsModal";

const tabs = [
  { key: "dashboard", label: "داشبورد", icon: Component },
  { key: "recommendations", label: "پیشنهادی", icon: Library },
  { key: "favorites", label: "موردعلاقه‌", icon: Heart },
  { key: "reading", label: "مطالعه", icon: BookMarked },
];


export default function Dashboard() {

  const [selected, setSelected] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const router = useRouter()
  const { user } = useAuthClient();



  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  return (
    <SidebarProvider>
      <section className="min-h-screen w-full flex flex-row-reverse bg-white text-slate-800">
        <SidebarUi
          tabs={tabs}
          selected={selected}
          onSelect={setSelected}
          isCollapsed={isCollapsed}
          onOpenSettings={() => setOpenSettings(true)}
        />
        <div className="flex-1 p-4 md:p-8 ">
          <header
            dir="rtl"
            className="flex items-center justify-start gap-5 mb-12"
          >
            <SidebarTrigger
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={"size-10 text-lg"}
            />

            <h1 className=" text-2xl md:text-3xl lg:text-4xl font-semibold text-emerald-800">
              به کتابخانه She Reads خوش آمدید!
            </h1>
          </header>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-white p-4 md:hidden shadow-lg"
              >
                <SidebarUi
                  selected={selected}
                  onSelect={(k) => {
                    setSelected(k);
                    setMobileOpen(false);
                  }}
                  onOpenSettings={() => {
                    setOpenSettings(true);
                    setMobileOpen(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <section>
            {selected === "reading" ? (
              <ReadingBooks />
            ) : selected === "favorites" ? (
              <FavoriteBooks />
            ) : selected === "recommendations" ? (
              <RecommendedBooks />
            ) : (
              <AllBooks />
            )}
          </section>

          {/*<PdfReader bookId={1} pdfUrl={"test.pdf"} userId={21}/>*/}
        </div>
      </section>
      <SettingsModal open={openSettings} onOpenChange={setOpenSettings} />
    </SidebarProvider>
  );
}

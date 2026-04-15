"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import AllBooks from "@/components/pages/AllBooks";
import MyBooks from "@/components/pages/MyBooks";
import FavoriteBooks from "@/components/pages/FavoriteBooks";
import RecommendedBooks from "@/components/pages/RecommendedBooks";
import SidebarUi from "@/components/SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { BookMarked, Component, Heart, Library, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import SettingsModal from "@/components/SettingsModal";

const tabs = [
  { key: "home", label: "کتاب‌ها ", icon: Component },
  { key: "mybooks", label: "کتاب‌های من", icon: UserCheck },
  { key: "recommendations", label: "پیشنهادی", icon: Library },
  { key: "favorites", label: "موردعلاقه‌", icon: Heart },
];


export default function Home() {

  const [selected, setSelected] = useState("mybooks");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const router = useRouter()
  const { user } = useRequireAuth();


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
        <div className="flex-1 h-screen p-4 md:p-8 ">
          <header
            dir="rtl"
            className="flex items-center justify-start gap-5 mb-12"
          >
            <SidebarTrigger
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={"size-10 text-lg"}
            />

            <h1 className=" text-center md:text-start text-2xl md:text-3xl lg:text-4xl font-semibold text-emerald-800">
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
                className="fixed inset-y-0 left-0 z-50 w-64 bg-white p-4 md:hidden shadow-lg "
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

          <section className={"h-[90%]  overflow-y-auto scrollbar-hide [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
            { selected === "favorites" ? (
              <FavoriteBooks />
            ) : selected === "recommendations" ? (
              <RecommendedBooks />
            ) : selected === "mybooks" ? (
              <MyBooks />
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

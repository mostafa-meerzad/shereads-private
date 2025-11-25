import logoWhiteShort from "@/assets/logo-white-short.svg";
import logoWhite from "@/assets/logo-white.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import { useAuthClient } from "@/hooks/useAuthClient";
import {
  LogOut,
  Settings
} from "lucide-react";
import Image from "next/image";

const SidebarUi = ({ tabs, selected, onSelect, isCollapsed, onOpenSettings }) => {
  const { logout } = useAuthClient();

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      className="bg-[#05653D] text-white p-1 fixed"
    >
      <SidebarHeader className="bg-[#05653D] flex justify-center items-center py-5 border-b">
        <div className="max-md:hidden">
          {!!isCollapsed ? (
            <Image
              width={40}
              height={40}
              src={logoWhiteShort}
              alt="logo"
              className="size-6 object-cover "
            />
          ) : (
            <Image
              width={200}
              height={80}
              src={logoWhite}
              alt="logo"
              className=" h-full object-contain"
            />
          )}
        </div>
        <div className="md:hidden">
          <Image
            width={200}
            height={80}
            src={logoWhite}
            alt="logo"
            className=" h-full object-contain"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#05653D] text-white pt-10">
        {tabs.map((t) => {
          const Icon = t.icon;

          return (
            <button
              key={t.key}
              onClick={() => onSelect(t.key)}
              className={`w-full text-right py-3 px-3 rounded-md mb-1 transition-colors flex items-center ${
                isCollapsed
                  ? "justify-center max-md:justify-end "
                  : "justify-end gap-4"
              } ${
                selected === t.key
                  ? "bg-gray-100 text-[#05653D]"
                  : "hover:bg-gray-200/30"
              }`}
            >
              <div className="max-md:hidden flex  justify-center gap-4">
                {!isCollapsed && (
                  <span className="text-sm transition-opacity duration-200">
                    {t.label}
                  </span>
                )}
                <Icon className="h-5 w-5 shrink-0 " />
              </div>

              <div className="md:hidden flex items-center justify-center gap-2 max-md:pr-3">
                <span className="text-sm transition-opacity duration-200">
                  {t.label}
                </span>

                <Icon className="h-5 w-5 shrink-0 " />
              </div>
            </button>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="bg-[#05653D] pb-10 text-white px-0">
        <div className="max-md:hidden">
          <div
            className={`cursor-pointer mb-3 flex items-center gap-4  hover:bg-gray-200/30 rounded-md  ${
              isCollapsed
                ? "p-2 items-center justify-center text-white "
                : "py-2 px-5 justify-end "
            } `}
            onClick={() => onOpenSettings && onOpenSettings()}
          >
            {!isCollapsed && <span>تنظیمات</span>}
            <Settings className="size-5" />
          </div>

          <button
            onClick={() => {
              console.log("logging out");
              logout();
            }}
            className={`w-full cursor-pointer mb-3 flex items-center gap-4  hover:bg-gray-200/30 rounded-md  ${
              isCollapsed
                ? "p-2 items-center justify-center text-white "
                : "py-2 px-5 justify-end "
            } `}
          >
            {!isCollapsed && <span>خروج</span>}
            <LogOut className="size-5" />
          </button>
        </div>
        <div className="md:hidden  ">
          <div
            className="cursor-pointer mb-3 flex items-center gap-4 justify-end  hover:bg-gray-200/30 rounded-md py-2 px-5 "
            onClick={() => onOpenSettings && onOpenSettings()}
          >
            {<span>تنظیمات</span>}
            <Settings className="size-5" />
          </div>

          <div
            onClick={() => {
              console.log("logging out");
              logout();
            }}
            className="cursor-pointer flex items-center gap-4 justify-end hover:bg-gray-200/30 rounded-md py-2 px-5 "
          >
            {<span>خروج</span>}
            <LogOut className="size-5" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarUi;

"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Command,
  BarChart2,
  Users,
  ChevronLeft,
  ChevronRight,
  LocateIcon,
  DollarSign,
} from "lucide-react";
import { useSos } from "@/components/context/SosContext";
import { useZerodha } from "@/components/context/ZerodhaContext";

const SidebarContext = createContext();

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { sos } = useSos();
  const {zerodha} = useZerodha();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  if (!user) {
    return null;
  }

  const baseMenuItems = [
    {
      path: "/com",
      name: "Command",
      icon: <Command size={20} />,
    },
    {
      path: "/user_data",
      name: "User Data",
      icon: <Users size={20} />,
    },
    {
      path: "/metrics",
      name: "Metrics",
      icon: <BarChart2 size={20} />,
    },
  ];
  
  // Conditionally add extra items
  const conditionalMenuItems = [
    ...(sos ? [
      {
        path: "/location",
        name: "Location",
        icon: <LocateIcon size={20} />,
      },
    ] : []),
    ...(zerodha ? [
      {
        path: "/zerodha",
        name: "Zerodha",
        icon: <DollarSign size={20} />,
      },
    ] : []),
  ];
  
  // Combine them into a single array
  const menuItems = [...baseMenuItems, ...conditionalMenuItems];

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      <div className="flex h-screen bg-black">
        <div
          className={`fixed top-0 left-0 h-screen transition-all duration-300 ${
            isCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="h-full bg-gradient-to-b from-blue-900 via-cyan-800 to-black flex flex-col">
            <div className="px-4 py-6 flex items-center justify-between">
              {!isCollapsed && (
                <h1 className="text-white text-xl font-bold">Dashboard</h1>
              )}
              <button
                onClick={toggleSidebar}
                className="text-white p-2 rounded-lg hover:bg-black/20"
              >
                {isCollapsed ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronLeft size={18} />
                )}
              </button>
            </div>

            <nav className="flex-1 px-2">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;

                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`flex items-center p-3 rounded-lg transition-all duration-200 
                          ${
                            isActive
                              ? "bg-cyan-500/30 text-white"
                              : "text-gray-300 hover:bg-cyan-500/20 hover:text-white"
                          }`}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          {!isCollapsed && (
                            <span className="ml-4">{item.name}</span>
                          )}
                        </div>
                        {isActive && !isCollapsed && (
                          <div className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-lg" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 text-xs text-gray-400">
              {!isCollapsed && <p>© 2025 Dashboard</p>}
            </div>
          </div>
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="relative min-h-screen">
            <div className="absolute top-8 right-7 z-50">
              <div className="relative group">
                <div className="absolute -inset-4 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-300"></div>
                <div
                  className="clerk-user-button-wrapper"
                  style={{ transform: "scale(1.5)" }}
                >
                  <UserButton afterSignOutUrl="/sign-in" />
                </div>
              </div>
            </div>

            <div>{children}</div>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

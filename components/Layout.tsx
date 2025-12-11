import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  LogOut,
  User,
  Briefcase,
  DollarSign,
  Home,
  Calendar,
  Menu,
  X,
} from "lucide-react";

import { storage } from "../utils/storage";
import type { User as UserType } from "../utils/types";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    setUser(currentUser);
  }, [router.pathname]);

  const handleLogout = () => {
    storage.removeCurrentUser();
    router.push("/");
  };

  if (!user) return <>{children}</>;

  const isAdmin = user.role === "admin";
  const isWorker = user.role === "worker";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* LEFT: BRAND */}
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              Cehpoint
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center space-x-4">
              {isWorker && (
                <>
                  <Link href="/dashboard" className="nav-btn">
                    <Home size={18} /> Dashboard
                  </Link>
                  <Link href="/tasks" className="nav-btn">
                    <Briefcase size={18} /> Tasks
                  </Link>
                  <Link href="/payments" className="nav-btn">
                    <DollarSign size={18} /> Payments
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link href="/admin" className="nav-btn">
                    <Home size={18} /> Dashboard
                  </Link>
                  <Link href="/admin/workers" className="nav-btn">
                    <User size={18} /> Workers
                  </Link>
                  <Link href="/admin/daily-work" className="nav-btn">
                    <Calendar size={18} /> Daily Work
                  </Link>
                  <Link href="/admin/tasks" className="nav-btn">
                    <Briefcase size={18} /> Tasks
                  </Link>
                </>
              )}

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* MOBILE HAMBURGER */}
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-2 animate-fade-in">
            {/* USER INFO — moved here, removed from top bar */}
            <div className="pb-3 border-b border-gray-200">
              <p className="text-lg font-semibold">{user.fullName}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>

            {/* WORKER MENU */}
            {isWorker && (
              <>
                <Link href="/dashboard" className="mobile-nav-btn">
                  <Home size={18} /> Dashboard
                </Link>
                <Link href="/tasks" className="mobile-nav-btn">
                  <Briefcase size={18} /> Tasks
                </Link>
                <Link href="/payments" className="mobile-nav-btn">
                  <DollarSign size={18} /> Payments
                </Link>
              </>
            )}

            {/* ADMIN MENU */}
            {isAdmin && (
              <>
                <Link href="/admin" className="mobile-nav-btn">
                  <Home size={18} /> Dashboard
                </Link>
                <Link href="/admin/workers" className="mobile-nav-btn">
                  <User size={18} /> Workers
                </Link>
                <Link href="/admin/daily-work" className="mobile-nav-btn">
                  <Calendar size={18} /> Daily Work
                </Link>
                <Link href="/admin/tasks" className="mobile-nav-btn">
                  <Briefcase size={18} /> Tasks
                </Link>
              </>
            )}

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="mobile-nav-btn text-red-600 bg-red-50 hover:bg-red-100"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
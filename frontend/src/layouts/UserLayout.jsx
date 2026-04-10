import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ChatWidget from "../components/chatbot/ChatWidget";
import { trackAPI } from "../api/track";

export default function UserLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";
  const isUserDashboardPage = location.pathname === "/user/dashboard";
  const isSearchPage = location.pathname === "/search" || location.pathname === "/user/search";
  const isSearchDetailPage = location.pathname === "/search/detail" || location.pathname === "/user/search/detail";
  const isUserFormPage = location.pathname === "/user/form";
  const isChatHistoryPage = location.pathname === "/chat/history";
  const isProfilePage = location.pathname === "/profile" || location.pathname === "/user/profile";

  useEffect(() => {
    trackAPI.pageView(location.pathname);
  }, [location.pathname]);

  if (
    isLandingPage ||
    isLoginPage ||
    isRegisterPage ||
    isUserDashboardPage ||
    isSearchPage ||
    isSearchDetailPage ||
    isUserFormPage ||
    isChatHistoryPage ||
    isProfilePage
  ) {
    return (
      <main style={{ minHeight: "75vh" }}>
        <Outlet />
      </main>
    );
  }

  return (
    <>
      <Header />

      <main style={{ minHeight: "75vh" }}>
        <Outlet />
      </main>

      {/* ✅ MINI CHAT – LUÔN TỒN TẠI */}
      <ChatWidget />

      <Footer />
    </>
  );
}

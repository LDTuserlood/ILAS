import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";

// ===== Layouts =====
import UserLayout from "./layouts/UserLayout";
import ModeratorLayout from "./layouts/ModeratorLayout";
import AdminLayout from "./layouts/AdminLayout";

// ===== Public Pages =====
import LandingPage from "./pages/public/LandingPage";
import AboutPage from "./pages/public/AboutPage";
import ProfilePage from "./pages/user/ProfilePage";

// ===== Auth Pages =====
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// ===== User Pages =====
import DashboardPage from "./pages/user/DashboardPage";
import UserSearch from "./pages/user/UserSearch";
import UserSearchDetail from "./pages/user/UserSearchDetail";
import FormPage from "./pages/user/FormPage";
import ChatHistoryPage from "./components/chatbot/ChatHistoryPage";


// ===== Moderator Pages =====
import DashboardModerator from "./pages/moderator/DashboardModerator";
import SimplifyPage from "./pages/moderator/SimplifyPage";
import FormPageModerator from "./pages/moderator/FormPage";
import FeedbackPage from "./pages/moderator/FeedbackPage";
import HelpCenterPage from "./pages/moderator/HelpCenterPage";

// ===== Admin Pages =====
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import ManageUsers from "./pages/admin/ManageUsers";
import CrawlLaws from "./pages/admin/CrawlLaws";
import Feedback from "./pages/admin/Feedback";
import Chatbot from "./pages/admin/Chatbot";
import Reports from "./pages/admin/Reports";
import Logs from "./pages/admin/Logs";
import Settings from "./pages/admin/Settings";

// ================= ROUTER =================
const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },

      {
        path: "profile",
        element: (
          <PrivateRoute allowedRoles={["USER", "MODERATOR", "MODERATOR"]}>
            <ProfilePage />
          </PrivateRoute>
        ),
      },

      // CHAT HISTORY (FULL PAGE – KHÔNG CHAT WIDGET)
      {
        path: "chat/history",
        element: (
          <PrivateRoute allowedRoles={["USER", "MODERATOR", "MODERATOR"]}>
            <ChatHistoryPage />
          </PrivateRoute>
        ),
      },

      // Public
      { path: "search", element: <UserSearch /> },
      { path: "search/detail", element: <UserSearchDetail /> },

      // User
      {
        path: "user",
        element: (
          <PrivateRoute allowedRoles={["USER"]}>
            <Outlet />
          </PrivateRoute>
        ),
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "search", element: <UserSearch /> },
          { path: "search/detail", element: <UserSearchDetail /> },
          { path: "form", element: <FormPage /> },
        ],
      },
    ],
  },

  // ===== Moderator =====
  {
    path: "/moderator",
    element: (
      // Cho phép cả EDITOR hoặc MODERATOR đi qua cho chắc ăn
      <PrivateRoute allowedRoles={["EDITOR", "MODERATOR"]}>
        <ModeratorLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardModerator /> },
      { path: "simplify", element: <SimplifyPage /> },
      { path: "forms", element: <FormPageModerator /> },
      { path: "feedback", element: <FeedbackPage /> },
      { path: "help", element: <HelpCenterPage /> },
    ],
  },

  // ===== Moderator alias =====
  {
    path: "/moderator",
    element: (
      <PrivateRoute allowedRoles={["MODERATOR", "MODERATOR"]}>
        <ModeratorLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardModerator /> },
      { path: "simplify", element: <SimplifyPage /> },
      { path: "forms", element: <FormPageModerator /> },
      { path: "feedback", element: <FeedbackPage /> },
      { path: "help", element: <HelpCenterPage /> },
    ],
  },

  // ===== Admin =====
  {
    path: "/admin",
    element: (
      <PrivateRoute allowedRoles={["ADMIN"]}>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardAdmin /> },
      { path: "manage-users", element: <ManageUsers /> },
      { path: "crawl-laws", element: <CrawlLaws /> },
      { path: "feedback", element: <Feedback /> },
      { path: "chatbot", element: <Chatbot /> },
      { path: "reports", element: <Reports /> },
      { path: "logs", element: <Logs /> },
      { path: "settings", element: <Settings /> },
    ],
  },

  // ===== 404 =====
  {
    path: "*",
    element: (
      <UserLayout>
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <h2>404 - Trang không tồn tại</h2>
          <p>Vui lòng kiểm tra lại đường dẫn.</p>
        </div>
      </UserLayout>
    ),
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;


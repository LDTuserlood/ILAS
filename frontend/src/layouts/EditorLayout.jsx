import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ChatWidget from "../components/chatbot/ChatWidget";
import "../styles/editor/EditorLayout.css";

export default function EditorLayout() {
  const location = useLocation();

  const isEditorWorkspace =
    location.pathname.startsWith("/editor/") ||
    location.pathname.startsWith("/moderator/");

  // =========================
  // HIDE CHAT WIDGET ON SOME ROUTES
  // =========================
  const hideWidgetPaths = ["/chat/history"];
  const showWidget = !hideWidgetPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  if (isEditorWorkspace) {
    return (
      <main style={{ minHeight: "75vh" }}>
        <Outlet />
      </main>
    );
  }

  return (
    <div className="editor-layout">
      <Header />

      <main className="editor-main">
        <div className="editor-content-wrapper">
          <Outlet />
        </div>
      </main>

      <Footer />

      {/* MINI CHAT WIDGET */}
      {showWidget && <ChatWidget />}
    </div>
  );
}

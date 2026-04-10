import React, { useState } from "react";
import { FiBell, FiSearch, FiSettings } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import EditorSidebar from "./EditorSidebar";
import "../../styles/editor/EditorWorkspace.css";

export default function EditorWorkspace({
  active,
  title,
  description,
  actions,
  children,
  searchPlaceholder = "Search insights...",
}) {
  const [searchText, setSearchText] = useState("");
  const { user } = useAuth();

  const displayName = user?.fullName || user?.username || "Editor";

  return (
    <div className="editor-workspace-page">
      <EditorSidebar active={active} />

      <main className="editor-workspace-main">
        <header className="editor-workspace-topbar">
          <div className="editor-workspace-search">
            <FiSearch aria-hidden="true" />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>

          <div className="editor-workspace-tools">
            <button type="button" className="editor-workspace-icon-btn" aria-label="Notifications">
              <FiBell />
            </button>
            <button type="button" className="editor-workspace-icon-btn" aria-label="Settings">
              <FiSettings />
            </button>

            <div className="editor-workspace-user-chip">
              <div>
                <div className="editor-workspace-user-name">{displayName}</div>
                <div className="editor-workspace-user-role">Editor</div>
              </div>
              <div className="editor-workspace-avatar">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <section className="editor-workspace-header">
          <div>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="editor-workspace-header-actions">{actions}</div> : null}
        </section>

        {children}
      </main>
    </div>
  );
}
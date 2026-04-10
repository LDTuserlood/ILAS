import React from "react";
import ModeratorSidebar from "./ModeratorSidebar";
import "../../styles/moderator/ModeratorWorkspace.css";

export default function ModeratorWorkspace({
  active,
  title,
  description,
  actions,
  children,
}) {
  return (
    <div className="moderator-workspace-page">
      <ModeratorSidebar active={active} />

      <main className="moderator-workspace-main">
        <section className="moderator-workspace-header">
          <div>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="moderator-workspace-header-actions">{actions}</div> : null}
        </section>

        {children}
      </main>
    </div>
  );
}

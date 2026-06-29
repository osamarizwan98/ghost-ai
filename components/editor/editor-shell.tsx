"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { ProjectDialogs } from "./project-dialogs"
import { useProjectActions } from "@/hooks/use-project-actions"
import { Button } from "@/components/ui/button"
import type { ProjectRow } from "@/lib/data/projects"

interface EditorShellProps {
  ownedProjects: ProjectRow[]
  sharedProjects: ProjectRow[]
}

export function EditorShell({ ownedProjects, sharedProjects }: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const actions = useProjectActions()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onNewProject={actions.openCreate}
        onRenameProject={actions.openRename}
        onDeleteProject={actions.openDelete}
      />

      <main className="flex-1 overflow-hidden pt-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <h1 className="text-2xl font-semibold text-text-primary">
            Create a project or open an existing one
          </h1>
          <p className="text-sm text-text-muted max-w-sm">
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
          <Button onClick={actions.openCreate}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>

      <ProjectDialogs {...actions} />
    </div>
  )
}

"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
import { ProjectDialogs } from "./project-dialogs"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import { Button } from "@/components/ui/button"

export function EditorShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dialogs = useProjectDialogs()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={dialogs.projects}
        onNewProject={dialogs.openCreate}
        onRenameProject={dialogs.openRename}
        onDeleteProject={dialogs.openDelete}
      />
      <main className="flex-1 overflow-hidden pt-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <h1 className="text-2xl font-semibold text-text-primary">
            Create a project or open an existing one
          </h1>
          <p className="text-sm text-text-muted max-w-sm">
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
          <Button onClick={dialogs.openCreate}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>
      <ProjectDialogs {...dialogs} />
    </div>
  )
}

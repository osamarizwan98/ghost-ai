"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { EditorNavbar } from "./editor-navbar"
import { ProjectSidebar } from "./project-sidebar"
<<<<<<< HEAD
import { CreateProjectDialog } from "./create-project-dialog"
import { RenameProjectDialog } from "./rename-project-dialog"
import { DeleteProjectDialog } from "./delete-project-dialog"
=======
import { ProjectDialogs } from "./project-dialogs"
>>>>>>> ea0c00df1e1c8ee0a7830619812806c815029748
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import { Button } from "@/components/ui/button"

export function EditorShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dialogs = useProjectDialogs()

  const {
    dialog,
    form,
    loading,
    openCreate,
    openRename,
    openDelete,
    close,
    setName,
  } = useProjectDialogs()

  function handleCreate() {
    // mock: no persistence yet
    close()
  }

  function handleRename() {
    // mock: no persistence yet
    close()
  }

  function handleDelete() {
    // mock: no persistence yet
    close()
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
<<<<<<< HEAD
        onCreateProject={openCreate}
        onRenameProject={openRename}
        onDeleteProject={openDelete}
      />

      <main className="flex-1 overflow-hidden pt-12 flex flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-semibold text-text-primary">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-text-muted">
          Start a new architecture workspace, or choose a project from the sidebar.
        </p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </main>

      <CreateProjectDialog
        open={dialog.open === "create"}
        name={form.name}
        loading={loading}
        onNameChange={setName}
        onConfirm={handleCreate}
        onClose={close}
      />

      <RenameProjectDialog
        open={dialog.open === "rename"}
        currentName={dialog.targetProject?.name ?? ""}
        name={form.name}
        loading={loading}
        onNameChange={setName}
        onConfirm={handleRename}
        onClose={close}
      />

      <DeleteProjectDialog
        open={dialog.open === "delete"}
        projectName={dialog.targetProject?.name ?? ""}
        loading={loading}
        onConfirm={handleDelete}
        onClose={close}
      />
=======
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
>>>>>>> ea0c00df1e1c8ee0a7830619812806c815029748
    </div>
  )
}

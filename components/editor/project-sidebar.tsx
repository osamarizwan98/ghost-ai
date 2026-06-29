"use client"

<<<<<<< HEAD
import { X, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"

interface Project {
  id: string
  name: string
  owned: boolean
}

const MY_PROJECTS: Project[] = [
  { id: "1", name: "E-Commerce Platform", owned: true },
  { id: "2", name: "Real-time Chat App", owned: true },
]

const SHARED_PROJECTS: Project[] = [
  { id: "3", name: "Team Monolith", owned: false },
]

interface ProjectItemProps {
  project: Project
  onRename: (project: Project) => void
  onDelete: (project: Project) => void
}

function ProjectItem({ project, onRename, onDelete }: ProjectItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="relative group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-subtle cursor-pointer">
      <span className="flex-1 text-sm text-text-primary truncate">{project.name}</span>

      {project.owned && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((prev) => !prev)
            }}
            aria-label="Project actions"
          >
            <MoreHorizontal className="h-4 w-4 text-text-secondary" />
          </Button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-7 z-20 w-36 rounded-xl bg-elevated border border-border-default shadow-lg py-1 flex flex-col">
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-subtle w-full text-left"
                  onClick={() => {
                    setMenuOpen(false)
                    onRename(project)
                  }}
                >
                  <Pencil className="h-4 w-4 text-text-muted" />
                  Rename
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-subtle w-full text-left"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(project)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
=======
import { X, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Project } from "@/hooks/use-project-dialogs"
>>>>>>> ea0c00df1e1c8ee0a7830619812806c815029748

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
<<<<<<< HEAD
  onCreateProject: () => void
  onRenameProject: (project: { id: string; name: string }) => void
  onDeleteProject: (project: { id: string; name: string }) => void
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  return (
=======
  projects: Project[]
  onNewProject: () => void
  onRenameProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
}

function ProjectItem({
  project,
  onRename,
  onDelete,
}: {
  project: Project
  onRename?: () => void
  onDelete?: () => void
}) {
  return (
    <div className="group flex items-center justify-between gap-1 px-2 py-1.5 rounded-xl hover:bg-elevated cursor-pointer">
      <span className="text-sm text-text-primary truncate flex-1 min-w-0">
        {project.name}
      </span>
      {project.owned && (
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Rename project"
            onClick={(e) => { e.stopPropagation(); onRename?.() }}
          >
            <Pencil className="h-3.5 w-3.5 text-text-muted" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            aria-label="Delete project"
            onClick={(e) => { e.stopPropagation(); onDelete?.() }}
          >
            <Trash2 className="h-3.5 w-3.5 text-text-muted" />
          </Button>
        </div>
      )}
    </div>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onNewProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  const owned = projects.filter((p) => p.owned)
  const shared = projects.filter((p) => !p.owned)

  return (
>>>>>>> ea0c00df1e1c8ee0a7830619812806c815029748
    <>
      {/* Mobile backdrop scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
<<<<<<< HEAD
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 flex flex-col bg-surface border-r border-border-default transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-border-default shrink-0">
          <span className="text-sm font-semibold text-text-primary">Projects</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 text-text-secondary" />
          </Button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden px-3 pt-3">
          <Tabs defaultValue="my-projects" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="w-full shrink-0">
              <TabsTrigger value="my-projects" className="flex-1">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-projects" className="flex-1 overflow-y-auto mt-2">
              {MY_PROJECTS.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-text-muted">No projects yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {MY_PROJECTS.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onRename={onRenameProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="shared" className="flex-1 overflow-y-auto mt-2">
              {SHARED_PROJECTS.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-text-muted">No shared projects.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {SHARED_PROJECTS.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onRename={onRenameProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="px-3 pb-4 pt-2 shrink-0">
          <Button className="w-full" variant="secondary" onClick={onCreateProject}>
=======
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 flex flex-col bg-surface border-r border-border-default transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-border-default shrink-0">
          <span className="text-sm font-semibold text-text-primary">Projects</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 text-text-secondary" />
          </Button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden px-3 pt-3">
          <Tabs defaultValue="my-projects" className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="w-full shrink-0">
              <TabsTrigger value="my-projects" className="flex-1">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="my-projects"
              className="flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              {owned.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-text-muted">No projects yet.</p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-0.5 py-1">
                    {owned.map((project) => (
                      <ProjectItem
                        key={project.id}
                        project={project}
                        onRename={() => onRenameProject(project)}
                        onDelete={() => onDeleteProject(project)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent
              value="shared"
              className="flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              {shared.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-text-muted">No shared projects.</p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-0.5 py-1">
                    {shared.map((project) => (
                      <ProjectItem key={project.id} project={project} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="px-3 pb-4 pt-2 shrink-0">
          <Button className="w-full" variant="secondary" onClick={onNewProject}>
>>>>>>> ea0c00df1e1c8ee0a7830619812806c815029748
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}

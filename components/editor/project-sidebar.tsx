"use client"

import Link from "next/link"
import { X, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ProjectRow } from "@/lib/data/projects"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  ownedProjects: ProjectRow[]
  sharedProjects: ProjectRow[]
  onNewProject: () => void
  onRenameProject: (project: ProjectRow) => void
  onDeleteProject: (project: ProjectRow) => void
}

function ProjectItem({
  project,
  onRename,
  onDelete,
}: {
  project: ProjectRow
  onRename?: () => void
  onDelete?: () => void
}) {
  return (
    <div className="group flex items-center justify-between gap-1 px-2 py-1.5 rounded-xl hover:bg-elevated cursor-pointer">
      <Link
        href={`/editor/${project.id}`}
        className="text-sm text-text-primary truncate flex-1 min-w-0"
      >
        {project.name}
      </Link>
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
  ownedProjects,
  sharedProjects,
  onNewProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  return (
    <>
      {/* Mobile backdrop scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
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
              {ownedProjects.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-text-muted">No projects yet.</p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-0.5 py-1">
                    {ownedProjects.map((project) => (
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
              {sharedProjects.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-text-muted">No shared projects.</p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-0.5 py-1">
                    {sharedProjects.map((project) => (
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
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}

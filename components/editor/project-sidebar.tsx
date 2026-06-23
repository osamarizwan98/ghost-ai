"use client"

import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
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
          <TabsList className="w-full">
            <TabsTrigger value="my-projects" className="flex-1">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="flex-1 flex items-center justify-center">
            <p className="text-sm text-text-muted">No projects yet.</p>
          </TabsContent>

          <TabsContent value="shared" className="flex-1 flex items-center justify-center">
            <p className="text-sm text-text-muted">No shared projects.</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="px-3 pb-4 pt-2 shrink-0">
        <Button className="w-full" variant="secondary">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}

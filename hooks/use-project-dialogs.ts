"use client"

import { useState } from "react"

export interface Project {
  id: string
  name: string
  slug: string
  owned: boolean
}

type DialogType = "create" | "rename" | "delete" | null

interface DialogState {
  type: DialogType
  project: Project | null
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const MOCK_PROJECTS: Project[] = [
  { id: "1", name: "E-commerce Platform", slug: "e-commerce-platform", owned: true },
  { id: "2", name: "Chat Application", slug: "chat-application", owned: true },
  { id: "3", name: "Auth Service", slug: "auth-service", owned: false },
]

export function useProjectDialogs() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS)
  const [dialog, setDialog] = useState<DialogState>({ type: null, project: null })
  const [formName, setFormName] = useState("")
  const [loading] = useState(false)

  const openCreate = () => {
    setFormName("")
    setDialog({ type: "create", project: null })
  }

  const openRename = (project: Project) => {
    setFormName(project.name)
    setDialog({ type: "rename", project })
  }

  const openDelete = (project: Project) => {
    setDialog({ type: "delete", project })
  }

  const close = () => {
    setDialog({ type: null, project: null })
    setFormName("")
  }

  const submitCreate = () => {
    const trimmed = formName.trim()
    if (!trimmed) return
    setProjects((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: trimmed, slug: toSlug(trimmed), owned: true },
    ])
    close()
  }

  const submitRename = () => {
    const trimmed = formName.trim()
    if (!trimmed || !dialog.project) return
    setProjects((prev) =>
      prev.map((p) =>
        p.id === dialog.project!.id
          ? { ...p, name: trimmed, slug: toSlug(trimmed) }
          : p
      )
    )
    close()
  }

  const submitDelete = () => {
    if (!dialog.project) return
    setProjects((prev) => prev.filter((p) => p.id !== dialog.project!.id))
    close()
  }

  return {
    projects,
    dialog,
    formName,
    setFormName,
    loading,
    openCreate,
    openRename,
    openDelete,
    close,
    submitCreate,
    submitRename,
    submitDelete,
    slug: toSlug(formName),
  }
}

export type UseProjectDialogsReturn = ReturnType<typeof useProjectDialogs>

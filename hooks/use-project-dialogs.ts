"use client"

<<<<<<< HEAD
import { useState, useCallback } from "react"

export type DialogType = "create" | "rename" | "delete" | null

interface DialogState {
  open: DialogType
  targetProject: { id: string; name: string } | null
}

interface FormState {
  name: string
}

export function useProjectDialogs() {
  const [dialog, setDialog] = useState<DialogState>({ open: null, targetProject: null })
  const [form, setForm] = useState<FormState>({ name: "" })
  const [loading, setLoading] = useState(false)

  const openCreate = useCallback(() => {
    setForm({ name: "" })
    setDialog({ open: "create", targetProject: null })
  }, [])

  const openRename = useCallback((project: { id: string; name: string }) => {
    setForm({ name: project.name })
    setDialog({ open: "rename", targetProject: project })
  }, [])

  const openDelete = useCallback((project: { id: string; name: string }) => {
    setDialog({ open: "delete", targetProject: project })
  }, [])

  const close = useCallback(() => {
    setDialog({ open: null, targetProject: null })
    setForm({ name: "" })
    setLoading(false)
  }, [])

  const setName = useCallback((name: string) => {
    setForm((prev) => ({ ...prev, name }))
  }, [])

  return {
    dialog,
    form,
    loading,
    setLoading,
=======
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
>>>>>>> ea0c00df1e1c8ee0a7830619812806c815029748
    openCreate,
    openRename,
    openDelete,
    close,
<<<<<<< HEAD
    setName,
  }
}
=======
    submitCreate,
    submitRename,
    submitDelete,
    slug: toSlug(formName),
  }
}

export type UseProjectDialogsReturn = ReturnType<typeof useProjectDialogs>
>>>>>>> ea0c00df1e1c8ee0a7830619812806c815029748

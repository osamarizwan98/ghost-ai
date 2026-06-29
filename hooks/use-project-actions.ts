"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ProjectRow } from "@/lib/data/projects"

type DialogType = "create" | "rename" | "delete" | null

interface DialogState {
  type: DialogType
  project: ProjectRow | null
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function shortSuffix(): string {
  return Math.random().toString(36).slice(2, 7)
}

export function useProjectActions(activeProjectId?: string) {
  const router = useRouter()
  const [dialog, setDialog] = useState<DialogState>({ type: null, project: null })
  const [formName, setFormName] = useState("")
  const [loading, setLoading] = useState(false)

  const openCreate = () => {
    setFormName("")
    setDialog({ type: "create", project: null })
  }

  const openRename = (project: ProjectRow) => {
    setFormName(project.name)
    setDialog({ type: "rename", project })
  }

  const openDelete = (project: ProjectRow) => {
    setDialog({ type: "delete", project })
  }

  const close = () => {
    setDialog({ type: null, project: null })
    setFormName("")
  }

  const submitCreate = async () => {
    const trimmed = formName.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      const roomId = `${toSlug(trimmed)}-${shortSuffix()}`
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, roomId }),
      })
      if (!res.ok) throw new Error("Failed to create project")
      const project = await res.json() as { id: string }
      close()
      router.push(`/editor/${project.id}`)
    } finally {
      setLoading(false)
    }
  }

  const submitRename = async () => {
    const trimmed = formName.trim()
    if (!trimmed || !dialog.project) return
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) throw new Error("Failed to rename project")
      close()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const submitDelete = async () => {
    if (!dialog.project) return
    const targetId = dialog.project.id
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${targetId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete project")
      close()
      if (activeProjectId === targetId) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return {
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

export type UseProjectActionsReturn = ReturnType<typeof useProjectActions>

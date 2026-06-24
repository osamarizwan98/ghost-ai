"use client"

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
    openCreate,
    openRename,
    openDelete,
    close,
    setName,
  }
}

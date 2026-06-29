"use client"

import { useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { UseProjectActionsReturn } from "@/hooks/use-project-actions"

export function ProjectDialogs({
  dialog,
  formName,
  setFormName,
  loading,
  close,
  submitCreate,
  submitRename,
  submitDelete,
  slug,
}: UseProjectActionsReturn) {
  const renameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (dialog.type === "rename") {
      // Radix Dialog manages initial focus; schedule after open animation
      const id = setTimeout(() => renameRef.current?.focus(), 50)
      return () => clearTimeout(id)
    }
  }, [dialog.type])

  return (
    <>
      {/* Create Project */}
      <Dialog open={dialog.type === "create"} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Name your new architecture workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Project name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") submitCreate() }}
            />
            {formName.trim() && (
              <p className="text-xs text-text-muted">
                Slug:{" "}
                <span className="font-mono text-text-secondary">{slug}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={submitCreate} disabled={!formName.trim() || loading}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project */}
      <Dialog open={dialog.type === "rename"} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Renaming &ldquo;{dialog.project?.name}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <Input
            ref={renameRef}
            placeholder="Project name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitRename() }}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={submitRename} disabled={!formName.trim() || loading}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project */}
      <Dialog open={dialog.type === "delete"} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{dialog.project?.name}&rdquo;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitDelete} disabled={loading}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

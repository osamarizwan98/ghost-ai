"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteProjectDialogProps {
  open: boolean
  projectName: string
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}

export function DeleteProjectDialog({
  open,
  projectName,
  loading,
  onConfirm,
  onClose,
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="bg-elevated border-border-default rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Delete Project</DialogTitle>
          <DialogDescription className="text-text-muted">
            Are you sure you want to delete &ldquo;{projectName}&rdquo;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting…" : "Delete Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

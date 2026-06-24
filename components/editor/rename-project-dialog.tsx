"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface RenameProjectDialogProps {
  open: boolean
  currentName: string
  name: string
  loading: boolean
  onNameChange: (value: string) => void
  onConfirm: () => void
  onClose: () => void
}

export function RenameProjectDialog({
  open,
  currentName,
  name,
  loading,
  onNameChange,
  onConfirm,
  onClose,
}: RenameProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="bg-elevated border-border-default rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Rename Project</DialogTitle>
          <DialogDescription className="text-text-muted">
            Renaming &ldquo;{currentName}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Input
            placeholder="Project name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onConfirm() }}
            autoFocus
            className="bg-subtle border-border-default text-text-primary placeholder:text-text-muted"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!name.trim() || loading}>
            {loading ? "Renaming…" : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

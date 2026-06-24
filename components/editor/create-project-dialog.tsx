"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

interface CreateProjectDialogProps {
  open: boolean
  name: string
  loading: boolean
  onNameChange: (value: string) => void
  onConfirm: () => void
  onClose: () => void
}

export function CreateProjectDialog({
  open,
  name,
  loading,
  onNameChange,
  onConfirm,
  onClose,
}: CreateProjectDialogProps) {
  const slug = toSlug(name)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="bg-elevated border-border-default rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary">New Project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Project name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onConfirm() }}
              autoFocus
              className="bg-subtle border-border-default text-text-primary placeholder:text-text-muted"
            />
            <p className="text-xs text-text-muted px-1">
              Slug:{" "}
              <span className="text-text-secondary font-mono">
                {slug || "your-project-name"}
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!name.trim() || loading}>
            {loading ? "Creating…" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

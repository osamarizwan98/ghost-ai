import { getEditorProjects } from "@/lib/data/projects"
import { EditorShell } from "@/components/editor/editor-shell"

export default async function EditorPage() {
  const { owned, shared } = await getEditorProjects()
  return <EditorShell ownedProjects={owned} sharedProjects={shared} />
}

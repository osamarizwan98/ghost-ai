import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export interface ProjectRow {
  id: string
  name: string
  owned: boolean
}

export async function getEditorProjects(): Promise<{ owned: ProjectRow[]; shared: ProjectRow[] }> {
  const { userId } = await auth()
  if (!userId) return { owned: [], shared: [] }

  const [owned, collaborations] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    prisma.projectCollaborator.findMany({
      where: { email: userId },
      orderBy: { createdAt: "desc" },
      select: { project: { select: { id: true, name: true } } },
    }),
  ])

  return {
    owned: owned.map((p) => ({ ...p, owned: true })),
    shared: collaborations.map((c) => ({ ...c.project, owned: false })),
  }
}

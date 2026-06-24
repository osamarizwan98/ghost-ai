import { SignUp } from "@clerk/nextjs";
import { Bot, Share2, FileText } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex font-sans">
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 bg-surface border-r border-border-default">
        <div className="flex items-center gap-2.5 px-10 pt-10">
          <div className="h-7 w-7 rounded-lg bg-accent-primary shrink-0" />
          <span className="text-sm font-semibold text-text-primary tracking-tight">
            Ghost AI
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-10">
          <h1 className="text-4xl font-bold text-text-primary leading-tight tracking-tight max-w-xs">
            Design systems at the speed of thought.
          </h1>
          <p className="mt-4 text-text-secondary text-sm leading-relaxed max-w-sm">
            Describe your architecture in plain English. Ghost AI maps it to a shared
            canvas your whole team can refine in real time.
          </p>

          <ul className="mt-10 space-y-6">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-xl bg-elevated flex items-center justify-center shrink-0 border border-border-default">
                  <Icon className="h-4 w-4 text-accent-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{title}</p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="px-10 pb-10 text-xs text-text-faint">
          © 2026 Ghost AI. All rights reserved.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 bg-base">
        <SignUp />
      </div>
    </main>
  );
}

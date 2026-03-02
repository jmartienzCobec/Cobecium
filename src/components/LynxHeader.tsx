import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type ActivePage = "procurement" | "system-prompts";

interface LynxHeaderProps {
  subtitle: string;
  activePage: ActivePage;
}

export function LynxHeader({ subtitle, activePage }: LynxHeaderProps) {
  const navButtonClasses = (isActive: boolean) =>
    `border-2 font-semibold uppercase rounded-none transition-colors ${
      isActive
        ? "bg-accent text-accent-foreground border-accent"
        : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <header className="relative border-b-4 border-primary px-6 py-5">
      <div className="max-w-6xl mx-auto flex items-center justify-end gap-6">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-3xl font-extrabold text-foreground uppercase tracking-tight">
            Lynx
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest mt-0.5">
            {subtitle}
          </p>
        </div>
        <nav className="flex gap-3" aria-label="Primary">
          <Link to="/">
            <Button
              variant="outline"
              className={navButtonClasses(activePage === "procurement")}
            >
              Procurement links
            </Button>
          </Link>
          <Link to="/system-prompts">
            <Button
              variant="outline"
              className={navButtonClasses(activePage === "system-prompts")}
            >
              System prompts
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}


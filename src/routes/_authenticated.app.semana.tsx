import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/semana")({
  component: SemanaPage,
});

function SemanaPage() {
  return (
    <div className="text-center py-20 max-w-md mx-auto">
      <CalendarDays className="h-12 w-12 text-primary mx-auto" />
      <h1 className="mt-4 font-display text-2xl font-bold text-secondary">Mi semana</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        El planificador semanal con sugerencias personalizadas llega muy pronto. 🌸
      </p>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ShoppingBasket, Calendar } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-secondary">Desayuno Fit</h1>
          <Link to="/login">
            <Button variant="ghost">Iniciar sesión</Button>
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/30 px-4 py-1.5 text-sm font-medium text-secondary">
            <Sparkles className="h-4 w-4" />
            Recetas pensadas para mujeres reales
          </span>
          <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold text-secondary leading-tight">
            Empieza tu día con un desayuno que <span className="text-primary">te cuide</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Recetas saludables, ricas y prácticas para bajar de peso sin pasar hambre. Plan
            personalizado, lista de compras automática y nuevas recetas cada mes.
          </p>
          <div className="mt-10">
            <Button size="lg" className="text-base px-8">Quiero empezar</Button>
            <p className="mt-3 text-sm text-muted-foreground">
              ¿Ya compraste? <Link to="/login" className="text-primary font-medium hover:underline">Acceder</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard icon={<Heart />} title="Recetas que enamoran" desc="Más de 20 recetas dulces y saladas, todas pensadas para ayudarte a bajar de peso." />
          <FeatureCard icon={<Calendar />} title="Mi semana lista" desc="Te armamos un plan de 7 días según tus gustos y preferencias." />
          <FeatureCard icon={<ShoppingBasket />} title="Lista de compras" desc="Generada automáticamente para que vayas al mercado sin pensar." />
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Desayuno Fit
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-secondary">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

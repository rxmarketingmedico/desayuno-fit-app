import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Heart,
  ShoppingBasket,
  Calendar,
  Smartphone,
  ChefHat,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import { PricingCard } from "@/components/landing/PricingCard";
import logo from "@/assets/logo.png";

const HERO_IMG =
  "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=1400&q=80";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Desayuno Fit — Recetas saludables para bajar de peso sin pasar hambre" },
      {
        name: "description",
        content:
          "Más de 200 recetas de desayuno ricas y saludables, plan semanal personalizado y lista de compras automática. Pensado para mujeres reales.",
      },
      { property: "og:title", content: "Desayuno Fit — Empieza tu día cuidándote" },
      {
        property: "og:description",
        content:
          "Recetas de desayuno saludables, plan semanal y lista de compras. Bajar de peso sin pasar hambre, con sabor.",
      },
      { property: "og:image", content: HERO_IMG },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: HERO_IMG },
    ],
  }),
  component: LandingPage,
});

function scrollToPlanes() {
  document.getElementById("planes")?.scrollIntoView({ behavior: "smooth" });
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2" aria-label="Desayuno Fit">
            <img src={logo} alt="Desayuno Fit" className="h-12 w-12 md:h-14 md:w-14 object-contain" />
            <span className="sr-only">Desayuno Fit</span>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Ya compré, acceder
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/30 px-4 py-1.5 text-sm font-medium text-secondary">
              <Sparkles className="h-4 w-4" />
              Recetas pensadas para mujeres reales
            </span>
            <h1 className="mt-6 font-display text-4xl md:text-6xl font-bold text-secondary leading-[1.1]">
              Empieza tu día con un desayuno que{" "}
              <span className="text-primary">te cuide</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Recetas saludables, ricas y fáciles para bajar de peso sin pasar hambre.
              Plan personalizado, lista de compras automática y nuevas recetas cada mes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="text-base px-8" onClick={scrollToPlanes}>
                Empieza hoy
              </Button>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-base px-8 w-full sm:w-auto">
                  Ya compré, acceder
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              ✓ Acceso inmediato &nbsp; ✓ Garantía 7 días &nbsp; ✓ Desde el celular
            </p>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
              <img
                src={HERO_IMG}
                alt="Desayuno saludable con frutas, avena y café"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary">
            Todo lo que necesitas para arrancar
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sin complicarte. Sin recetas raras. Sin pasar hambre.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={ChefHat}
            title="+200 recetas reales"
            desc="Dulces y saladas, todas pensadas para ayudarte a bajar de peso disfrutando."
          />
          <FeatureCard
            icon={Calendar}
            title="Tu semana planificada"
            desc="Te armamos un plan de 7 días según tus gustos y lo que tienes en casa."
          />
          <FeatureCard
            icon={ShoppingBasket}
            title="Lista de compras lista"
            desc="Generada automáticamente. Vas al mercado sin pensar y sin desperdiciar."
          />
          <FeatureCard
            icon={Smartphone}
            title="Desde tu celular"
            desc="Cocina con la receta abierta en el teléfono. Funciona en cualquier dispositivo."
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="planes" className="bg-accent/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary">
              Elige tu plan
            </h2>
            <p className="mt-4 text-muted-foreground">
              Mismo contenido en todos los planes. Mientras más tiempo, mayor el ahorro.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-5xl mx-auto md:items-stretch">
            <PricingCard
              plan="mensual"
              title="Mensual"
              price="USD 9"
              period="mes"
              description="Ideal para probar"
              features={[
                "Acceso a todas las recetas",
                "Plan semanal personalizado",
                "Lista de compras automática",
                "Nuevas recetas cada mes",
              ]}
            />
            <PricingCard
              plan="semestral"
              title="Semestral"
              price="USD 29"
              period="6 meses"
              description="Ahorras casi un 50%"
              badge="Más popular"
              highlighted
              features={[
                "Todo lo del plan Mensual",
                "6 meses de acceso completo",
                "Soporte prioritario",
                "Sale a USD 4,80 al mes",
              ]}
            />
            <PricingCard
              plan="anual"
              title="Anual"
              price="USD 47"
              period="año"
              description="Mejor valor"
              badge="Mejor valor"
              features={[
                "Todo lo del plan Semestral",
                "12 meses de acceso completo",
                "Bonus: e-book de meriendas fit",
                "Sale a USD 3,90 al mes",
              ]}
            />
          </div>
          <p className="text-center mt-8 text-sm text-muted-foreground">
            Pago único por el período elegido. Sin renovación automática.
          </p>
        </div>
      </section>

      {/* Testimonios */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary">
            Mujeres como tú ya empezaron
          </h2>
          <p className="mt-4 text-muted-foreground">
            Más de 1.200 desayunos preparados este mes.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <TestimonialCard
            name="Carolina M."
            city="Bogotá, Colombia"
            text="Bajé 4 kilos en dos meses sin sentir que estaba a dieta. Las recetas son riquísimas y rápidas, perfectas para los días de oficina."
          />
          <TestimonialCard
            name="Valentina R."
            city="Ciudad de México"
            text="Lo que más me gusta es la lista de compras. Antes desperdiciaba mucha comida, ahora compro justo lo necesario."
          />
          <TestimonialCard
            name="Andrea P."
            city="Lima, Perú"
            text="Me encantan los smoothies y las tostadas saladas. Mi esposo también las come y ni se da cuenta de que son saludables."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-accent/20 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary">
              Preguntas frecuentes
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            <AccordionItem value="1">
              <AccordionTrigger className="text-base font-semibold text-secondary">
                ¿Cómo accedo después de comprar?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Al completar tu pago en Hotmart, te llegará un correo con tu acceso.
                Solo entras a la página, inicias sesión y ya estás dentro.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger className="text-base font-semibold text-secondary">
                ¿Las recetas son difíciles de preparar?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Para nada. La mayoría se hace en menos de 15 minutos con ingredientes
                que consigues en cualquier supermercado de Latinoamérica.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionTrigger className="text-base font-semibold text-secondary">
                ¿Sirve si soy vegetariana o tengo alguna restricción?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Sí. En el onboarding nos cuentas tus preferencias (vegetariana, sin
                lactosa, sin gluten, etc.) y filtramos las recetas para ti.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="4">
              <AccordionTrigger className="text-base font-semibold text-secondary">
                ¿Qué pasa si no me convence?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Tienes 7 días de garantía. Si en una semana no es lo que esperabas,
                te devolvemos tu dinero sin preguntas.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 md:py-20 text-center">
        <Heart className="h-10 w-10 text-primary mx-auto" />
        <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold text-secondary">
          Tu próximo desayuno puede cambiar todo
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Empieza hoy y siente la diferencia desde la primera semana.
        </p>
        <Button size="lg" className="mt-8 text-base px-8" onClick={scrollToPlanes}>
          Ver planes
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Desayuno Fit. Hecho con cariño en Latinoamérica.</p>
          <Link to="/login" className="text-primary hover:underline font-medium">
            Ya compré, acceder →
          </Link>
        </div>
      </footer>
    </div>
  );
}

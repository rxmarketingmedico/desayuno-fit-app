import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Smartphone,
  CalendarDays,
  ShoppingBasket,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  CreditCard,
  Monitor,
  RefreshCw,
  Star,
} from "lucide-react";
import { openHotmart, type PlanKey } from "@/config/hotmart";
import { toast } from "sonner";
import logo from "@/assets/logo.webp";
import sofiaImg from "@/assets/sofia-herrera.webp";
import heroAppMockup from "@/assets/hero-app-mockup.jpg";
import testimonioCamila from "@/assets/testimonio-camila.jpg";
import testimonioValentina from "@/assets/testimonio-valentina.jpg";
import testimonioMariana from "@/assets/testimonio-mariana.jpg";
import testimonioSofia from "@/assets/testimonio-sofia.jpg";
import testimonioPaula from "@/assets/testimonio-paula.jpg";
import testimonioAndrea from "@/assets/testimonio-andrea.jpg";

const TESTIMONIOS = [
  {
    img: testimonioCamila,
    name: "Camila R.",
    city: "Ciudad de México, MX",
    loss: "−9 kg en 4 meses",
    text: "Antes desayunaba pan con café y a las 10 ya tenía hambre. Con las recetas del app aprendí a armar desayunos con proteína que me dejan llena hasta el almuerzo. Bajé 9 kilos sin pasar hambre, sin contar calorías obsesivamente. Lo mejor: mi marido también come y le encanta.",
  },
  {
    img: testimonioValentina,
    name: "Valentina M.",
    city: "Guadalajara, MX",
    loss: "−14 kg en 6 meses",
    text: "Probé mil dietas y siempre las dejaba porque me aburría. Esto es distinto — son recetas ricas que de verdad quieres comer. El planificador semanal me cambió la vida: domingo armo la lista de compras, voy al súper, y toda la semana ya está resuelta. Bajé 14 kilos y no los he recuperado.",
  },
  {
    img: testimonioMariana,
    name: "Mariana S.",
    city: "Bogotá, CO",
    loss: "−7 kg en 3 meses",
    text: "Tengo 45 años y pensé que ya no podía bajar de peso. Las recetas son tan fáciles que las hago hasta cuando llego cansada del trabajo. Me siento con más energía, dormí mejor, y la celulitis bajó mucho. Mis hijas también empezaron a desayunar bien por imitarme.",
  },
  {
    img: testimonioSofia,
    name: "Sofía L.",
    city: "Buenos Aires, AR",
    loss: "−6 kg en 2 meses",
    text: "Trabajo desde casa y comía cualquier cosa. Ahora abro el app, elijo un desayuno de 10 minutos y listo. Bajé 6 kilos en 2 meses y los smoothies me salvan cuando no tengo tiempo. La lista de compras automática es genial — ya no llego al súper a improvisar.",
  },
  {
    img: testimonioPaula,
    name: "Paula G.",
    city: "Santiago, CL",
    loss: "−11 kg en 5 meses",
    text: "A los 42 sentía que mi cuerpo ya no respondía. Las recetas antiinflamatorias me desinflamaron muchísimo — la panza se redujo en semanas. Bajé 11 kilos comiendo rico, sin sufrir. Mi nutri me preguntó qué estaba haciendo porque mis exámenes mejoraron todos.",
  },
  {
    img: testimonioAndrea,
    name: "Andrea T.",
    city: "Lima, PE",
    loss: "−8 kg en 3 meses",
    text: "Soy mamá de 2 niños y nunca tenía tiempo de pensar qué desayunar. Ahora con el menú semanal ya está todo planeado. Bajé 8 kilos en 3 meses, recuperé mi cintura después del segundo embarazo, y lo mejor es que mis hijos también prueban las recetas conmigo.",
  },
];

const HERO_IMG = heroAppMockup;

const RECIPE_PREVIEW = [
  { img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80", badge: "Alta proteína", badgeColor: "primary", name: "Tostada de aguacate y huevo pochado", meta: "10 min · 285 cal" },
  { img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80", badge: "Sin harina", badgeColor: "secondary", name: "Panqueques de avena y banana", meta: "12 min · 310 cal" },
  { img: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=600&q=80", badge: "Antioxidante", badgeColor: "secondary", name: "Smoothie bowl de frutos rojos", meta: "8 min · 290 cal" },
  { img: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80", badge: "Alta proteína", badgeColor: "primary", name: "Huevos revueltos con espinaca", meta: "7 min · 245 cal" },
  { img: "https://images.unsplash.com/photo-1542691457-cbe4df041eb2?auto=format&fit=crop&w=600&q=80", badge: "Vegano", badgeColor: "secondary", name: "Chia pudding de vainilla", meta: "5 min · 220 cal" },
  { img: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80", badge: "Sin azúcar", badgeColor: "secondary", name: "Tostada francesa de plátano", meta: "12 min · 300 cal" },
  { img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80", badge: "Alta proteína", badgeColor: "primary", name: "Smoothie proteico de cacao", meta: "5 min · 275 cal" },
  { img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80", badge: "Alta proteína", badgeColor: "primary", name: "Bowl de yogur griego con granola", meta: "5 min · 320 cal" },
  { img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80", badge: "Sin gluten", badgeColor: "secondary", name: "Tacos de claras y frijoles negros", meta: "15 min · 350 cal" },
];

const PAINS = [
  "Quieres comer sano pero no sabes qué hacer además de huevo con pan.",
  "Empiezas la dieta, te aburres a los 3 días y vuelves a lo mismo de siempre.",
  "Te despiertas sin tiempo, saltas el desayuno y a las 10 estás atacando cualquier cosa.",
  "Crees que las recetas fit necesitan 20 ingredientes caros que ni están en el súper.",
  "Ya compraste PDFs de recetas que se quedaron guardados y nunca usaste.",
  "Quieres bajar de peso sin pasar hambre ni comer lo mismo todos los días.",
];

const SOLUTION_CHECKS = [
  ["Recetas de hasta", "350 calorías"],
  ["Con sabor real,", "no comida aburrida"],
  ["Con", "proteínas y vitaminas esenciales"],
  ["Listas en", "15 minutos o menos"],
  ["Solo ingredientes", "del súper de tu barrio"],
  ["Solo necesitas", "licuadora y sartén"],
  ["Paso a paso claro —", "hasta si nunca cocinaste"],
];

const BONUSES = [
  { n: "01", title: "200 postres sin azúcar", desc: "Dulces para matar el antojo sin salirte de la línea — postre cada día sin culpa.", old: "USD 9" },
  { n: "02", title: "60 recetas de lunch fit", desc: "Almuerzo y cena resueltos para toda la semana — para quienes llevan marmita y no quieren repetir.", old: "USD 5" },
  { n: "03", title: "60 jugos detox", desc: "Desinflamación en la mañana, energía todo el día — recetas rápidas para batir y tomar.", old: "USD 9" },
  { n: "04", title: "30 recetas antiinflamatorias", desc: "Almuerzo y cena que ayudan a desinflamar, reducir celulitis y acabar con esa sensación de pesadez.", old: "USD 6" },
  { n: "05", title: "20 panes sin gluten", desc: "Panes caseros, ligeros y sin harina blanca — para quien ama el pan pero no quiere inflamarse.", old: "USD 6" },
];

const FAQS = [
  { q: "¿Las recetas tienen sabor de verdad?", a: 'Sí. Ninguna es la típica "ensalada triste". Están hechas para que te guste comerlas todos los días — con sabor real, no comida de dieta aburrida.' },
  { q: "¿Son recetas realmente saludables?", a: "Sí. Todas fueron creadas y verificadas por nuestra nutricionista. Cada una tiene la información nutricional completa (calorías, proteína, carbohidratos, grasas y fibra) para que sepas exactamente lo que estás comiendo." },
  { q: "¿Es fácil de hacer? No sé cocinar casi nada.", a: "Perfecto entonces. El paso a paso es tan claro que sirve incluso si nunca prendiste una sartén. Las recetas están escritas para personas reales, no para chefs." },
  { q: "¿Qué equipos necesito?", a: "Sartén y licuadora. Nada más. Nada de airfryer, procesador industrial o aparatos caros que nadie tiene en casa." },
  { q: "¿Los ingredientes son difíciles de conseguir?", a: "No. Todas las recetas usan ingredientes que encuentras en cualquier supermercado de tu barrio — sin importar si estás en México, Colombia, Argentina o Chile." },
  { q: "¿Cómo accedo después que compro?", a: "En menos de 2 minutos recibes un email con tu usuario y contraseña. Entras desde cualquier navegador, o instalas el app en tu celular como si fuera una app normal. Es tuyo para siempre mientras tengas el plan activo." },
  { q: "¿Puedo cancelar?", a: "Sí, cuando quieras, en 1 clic. Sin preguntas, sin llamadas, sin vueltas. La suscripción se cancela de inmediato y no se renueva." },
  { q: "¿Y si no me gusta?", a: "Tienes 7 días para probar. Si no te encanta, me mandas un email y te devuelvo cada centavo — sin preguntas. Y te quedas con los bonos de todas formas." },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Desayuno Fit — +200 Recetas de Desayuno Saludable | App para Bajar de Peso" },
      {
        name: "description",
        content:
          "Más de 200 recetas de desayuno fit creadas por nutricionista. Listas en 10 minutos, con ingredientes del súper. Planificador semanal y lista de compras automática.",
      },
      { property: "og:title", content: "Desayuno Fit — +200 Recetas de Desayuno Saludable" },
      {
        property: "og:description",
        content:
          "El app que arma tu desayuno fit todos los días. +200 recetas, planificador semanal y lista de compras automática.",
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

function buyPlan(plan: PlanKey) {
  openHotmart(plan, () =>
    toast.info("Próximamente disponible", {
      description: "Estamos terminando de configurar el checkout.",
    }),
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Promo bar */}
      <div className="bg-secondary text-secondary-foreground text-center text-xs sm:text-sm py-2.5 px-4 font-medium">
        <Sparkles className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5 text-accent" />
        <strong className="text-accent">OFERTA LIMITADA</strong>
        <span className="opacity-90"> — Acceso al app por menos de un café al mes</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2" aria-label="Desayuno Fit">
            <img src={logo} alt="Desayuno Fit" width="56" height="56" className="h-12 w-12 md:h-14 md:w-14 object-contain" />
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm">Ya compré, acceder</Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="px-4 pt-12 pb-16 md:pt-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
            <Sparkles className="h-3 w-3" /> App creado por nutricionista
          </span>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mt-5 leading-tight">
            App con 200 recetas de desayuno. Para hacer en menos de 10 minutos y bajar de peso sin aburrirte.
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Con ingredientes del súper de tu barrio, planificador semanal y lista de compras automática. Tu desayuno resuelto cada mañana, sin pensar dos veces.
          </p>

          <div className="mt-8 max-w-md mx-auto">
            <img
              src={HERO_IMG}
              alt="App Desayuno Fit abierto en un celular mostrando recetas de desayuno saludable"
              width="1024"
              height="1024"
              className="w-full h-auto drop-shadow-2xl"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          <Button size="lg" onClick={scrollToPlanes} className="mt-8 text-base px-8 py-6 rounded-full shadow-lg shadow-primary/30">
            🍳 Quiero empezar hoy →
          </Button>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="text-accent flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</span>
              +37.000 mujeres
            </span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-secondary" /> Garantía de 7 días</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-secondary" /> Acceso inmediato</span>
          </div>
        </div>
      </section>

      {/* DOR */}
      <section className="bg-card py-16 md:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <SectionTitle>Si te identificas con al menos 3 de estos, este app es para ti:</SectionTitle>
          <ul className="mt-10 space-y-3">
            {PAINS.map((p, i) => (
              <li key={i} className="flex items-start gap-3 bg-background rounded-xl px-4 py-3.5 border border-border">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/15 text-primary flex-shrink-0 mt-0.5">
                  <X className="h-3.5 w-3.5" />
                </span>
                <span className="text-[15px] text-foreground/90">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="bg-background py-16 md:py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <SectionTitle>La solución no es otra dieta. Es tener el menú listo.</SectionTitle>
          <p className="mt-6 text-muted-foreground text-[17px] leading-relaxed">
            Más de <strong className="text-foreground">200 recetas de desayuno</strong> creadas por nutricionista. Todas listas en{" "}
            <strong className="text-foreground">máximo 15 minutos</strong>, con ingredientes que encuentras en cualquier súper de tu barrio.
          </p>
          <p className="mt-3 text-muted-foreground text-[17px] leading-relaxed">
            Abres el app en tu celular, eliges qué desayunar, y en 10 minutos tienes algo delicioso y saludable en la mesa.{" "}
            <strong className="text-foreground">Un menú rotativo de 6 meses sin repetir nada.</strong>
          </p>

          <ul className="mt-10 grid sm:grid-cols-2 gap-3 text-left">
            {SOLUTION_CHECKS.map(([a, b], i) => (
              <li key={i} className="flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex-shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-[15px]">
                  {a} <strong>{b}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DIFERENCIAL */}
      <section className="bg-card py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <SectionTitle>No es un PDF. Es un app de verdad.</SectionTitle>
          <p className="mt-5 text-muted-foreground text-[17px]">
            Mientras otros te venden un PDF que se pierde en tu celular, nosotras te damos algo que usas{" "}
            <strong className="text-foreground">todas las semanas</strong>:
          </p>

          <div className="mt-10 grid md:grid-cols-3 gap-5 text-left">
            <DiffCard
              icon={<Smartphone className="h-6 w-6" />}
              title="Recetario siempre contigo"
              desc="Abre el app desde cualquier lugar. Filtra por tiempo, calorías o ingrediente. Guarda tus favoritas. Marca las que ya hiciste."
            />
            <DiffCard
              icon={<CalendarDays className="h-6 w-6" />}
              title="Planificador semanal"
              desc="El app arma tu semana de desayunos en 1 clic. 7 recetas variadas, sin repetir, pensadas para que no te aburras."
            />
            <DiffCard
              icon={<ShoppingBasket className="h-6 w-6" />}
              title="Lista de compras automática"
              desc="Genera tu lista del súper con los ingredientes de toda la semana — ya sumados y organizados. Compártela por WhatsApp."
            />
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL — DEPOIMENTOS */}
      <section className="bg-background py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
              <Star className="h-3 w-3 fill-current" /> +37.000 mujeres ya probaron
            </span>
            <SectionTitle>
              <span className="block mt-4">Lo que dicen las que ya bajaron de peso con Desayuno Fit</span>
            </SectionTitle>
            <p className="mt-5 text-muted-foreground text-[17px]">
              Mujeres reales, resultados reales. Sin filtros, sin promesas mágicas — solo desayunos que funcionan.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIOS.map((t, i) => (
              <article
                key={i}
                className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted relative">
                  <img
                    src={t.img}
                    alt={`${t.name}, ${t.city}`}
                    width={768}
                    height={960}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    {t.loss}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex gap-0.5 text-accent">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 text-[14px] text-foreground/85 leading-relaxed flex-1">
                    "{t.text}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="font-display text-secondary text-[15px] font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              ¿Lista para sumarte a las +37.000 mujeres que ya transformaron su mañana?
            </p>
            <Button
              size="lg"
              onClick={scrollToPlanes}
              className="rounded-full px-8 shadow-lg shadow-primary/25"
            >
              🍳 Quiero mis resultados también →
            </Button>
          </div>
        </div>
      </section>

      {/* PRÉVIA RECEITAS */}
      <section className="bg-card py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <SectionTitle>✦ Prévia del app de recetas</SectionTitle>
            <p className="mt-5 text-muted-foreground text-[17px]">
              Algunas de las +200 recetas que vas a tener. Todo con gramaje, tiempo de preparación y calorías calculadas.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {RECIPE_PREVIEW.map((r, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={r.img} alt={r.name} loading="lazy" decoding="async" width="600" height="450" className="w-full h-full object-cover" />
                </div>
                <div className="p-3.5 md:p-4">
                  <span className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    r.badgeColor === "primary" ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"
                  }`}>
                    {r.badge}
                  </span>
                  <h3 className="font-display text-sm md:text-base text-secondary mt-2 leading-tight">{r.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.meta}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button size="lg" onClick={scrollToPlanes} className="rounded-full px-8">
              🔓 Desbloquear todas las recetas →
            </Button>
          </div>
        </div>
      </section>

      {/* AUTORIDADE */}
      <section className="bg-background py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <SectionTitle>✦ Creado por nutricionista</SectionTitle>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            {/* Foto */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/15 to-secondary/10 rounded-[2rem] blur-2xl" aria-hidden />
              <div className="relative aspect-square rounded-[2rem] overflow-hidden ring-1 ring-border shadow-xl">
                <img
                  src={sofiaImg}
                  alt="Sofía Herrera, nutricionista creadora de Desayuno Fit"
                  width="800"
                  height="800"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* Texto */}
            <div className="text-left">
              <h3 className="font-display text-3xl md:text-4xl text-secondary leading-tight">
                Sofía Herrera,<br />
                <span className="text-primary">la nutri que simplifica el desayuno.</span>
              </h3>
              <p className="text-sm font-semibold text-muted-foreground mt-3 uppercase tracking-wide">
                Nutricionista — Especialista en Alimentación Funcional
              </p>

              <p className="mt-6 text-[16px] text-foreground/80 leading-relaxed">
                Especialista en alimentación funcional, Sofía creó esta app de recetas después de escuchar la misma pregunta una y otra vez en consulta:
              </p>

              <blockquote className="mt-4 italic text-[18px] text-secondary border-l-4 border-primary pl-5">
                "pero nutri, ¿qué desayuno que no sea pan con huevo?"
              </blockquote>

              <p className="mt-5 text-[16px] text-foreground/80 leading-relaxed">
                Son más de <strong className="text-secondary">200 recetas</strong> que probó una por una — todas con sabor real, ingredientes simples y el equilibrio nutricional que tu cuerpo necesita para empezar el día <strong className="text-secondary">sin picos de glucosa</strong> y <strong className="text-secondary">sin hambre a media mañana</strong>.
              </p>

              <div className="mt-8 flex flex-wrap gap-8">
                <Stat n="200+" label="Recetas probadas" />
                <Stat n="15'" label="Tiempo máx." />
                <Stat n="350" label="Cal. máximas" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planes" className="bg-background py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <SectionTitle>Elige tu plan</SectionTitle>
            <p className="mt-5 text-muted-foreground text-[17px]">
              Todos los planes incluyen acceso completo al app, +200 recetas, planificador semanal, lista de compras automática y garantía de 7 días.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            <PlanCard
              name="Plan Mensual"
              price="4,90"
              period="por mes · cancelas cuando quieras"
              features={["+200 recetas de desayuno fit", "Planificador semanal", "Lista de compras automática", "Filtros por preferencia dietética", "Acceso desde cualquier dispositivo"]}
              ctaLabel="Empezar ahora →"
              onClick={() => buyPlan("mensual")}
            />
            <PlanCard
              popular
              name="Plan Semestral"
              priceOld="USD 29,40"
              price="9,90"
              period="por 6 meses · equivale a USD 1,65/mes"
              savings="Ahorras USD 19,50"
              badge="⭐ MÁS POPULAR"
              features={["+200 recetas de desayuno fit", "Planificador semanal", "Lista de compras automática", "Filtros por preferencia dietética", "Acceso desde cualquier dispositivo"]}
              ctaLabel="Empezar ahora →"
              onClick={() => buyPlan("semestral")}
            />
            <PlanCard
              name="Plan Anual"
              priceOld="USD 58,80"
              price="14,90"
              period="por 12 meses · equivale a USD 1,24/mes"
              savings="Ahorras USD 43,90 + 5 bonos gratis"
              badge="🔥 MEJOR VALOR"
              badgeAccent
              features={["+200 recetas de desayuno fit", "Planificador semanal", "Lista de compras automática", "Filtros por preferencia dietética", "Acceso desde cualquier dispositivo", "+ 5 bonos exclusivos"]}
              ctaLabel="Empezar ahora →"
              onClick={() => buyPlan("anual")}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Lock className="h-4 w-4" /> Pago 100% seguro</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> Acceso inmediato</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Garantía 7 días</span>
          </div>
        </div>
      </section>

      {/* BÔNUS */}
      <section className="bg-card py-16 md:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <SectionTitle>✦ Solo por tiempo limitado</SectionTitle>
            <p className="mt-5 text-muted-foreground text-[17px]">
              Más 5 bonos de regalo — valor total <strong className="text-foreground">USD 47</strong>. Hoy, junto con el plan anual, los llevas gratis:
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {BONUSES.map((b) => (
              <div key={b.n} className="flex items-center gap-4 bg-background rounded-xl px-4 py-4 border border-border">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {b.n}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-[17px] text-secondary">{b.title}</h4>
                  <p className="text-[13px] text-muted-foreground">{b.desc}</p>
                </div>
                <div className="hidden sm:block text-right flex-shrink-0">
                  <span className="block text-xs line-through text-muted-foreground/60">{b.old}</span>
                  <span className="block text-sm font-bold text-secondary">Gratis</span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 bg-primary/10 border border-primary/40 rounded-xl px-4 py-4">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                <ShoppingBasket className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-display text-[17px] text-primary">Bonus extra — Lista de compras inteligente</h4>
                <p className="text-[13px] text-muted-foreground">Menú de 7 días con lista del súper lista — llega a casa y empieza a cocinar.</p>
              </div>
              <span className="hidden sm:block text-sm font-bold text-primary">Exclusivo</span>
            </div>
          </div>

          <div className="mt-5 bg-background border border-border rounded-xl px-5 py-4 flex items-center justify-between text-[15px]">
            <span>Valor total de los bonos:</span>
            <span>
              <s className="text-muted-foreground/60">USD 47</s>{" "}
              <strong className="text-secondary">→ Gratis en el Plan Anual</strong>
            </span>
          </div>
        </div>
      </section>

      {/* RESUMO OFERTA */}
      <section className="bg-background py-16 md:py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <SectionTitle>Oferta de la semana</SectionTitle>
          <p className="mt-5 text-muted-foreground text-[17px]">
            +200 Recetas de Desayuno Fit — Todo esto por menos de un café al mes.
          </p>

          <div className="mt-10 bg-card rounded-3xl p-6 md:p-8 text-left border border-border shadow-sm">
            <Row label="📱 App +200 Recetas Desayuno Fit" right={<s className="text-muted-foreground/60">USD 58,80/año</s>} bold />
            <Row label="🎁 Bono 01 — 200 Postres sin azúcar" right={<span className="text-secondary font-semibold">Gratis</span>} small />
            <Row label="🎁 Bono 02 — 60 Recetas Lunch Fit" right={<span className="text-secondary font-semibold">Gratis</span>} small />
            <Row label="🎁 Bono 03 — 60 Jugos Detox" right={<span className="text-secondary font-semibold">Gratis</span>} small />
            <Row label="🎁 Bono 04 — 30 Antiinflamatorias" right={<span className="text-secondary font-semibold">Gratis</span>} small />
            <Row label="🎁 Bono 05 — 20 Panes sin gluten" right={<span className="text-secondary font-semibold">Gratis</span>} small />
            <div className="border-t-2 border-border mt-4 pt-4 flex justify-between items-end">
              <span className="font-display text-lg text-secondary">Plan Anual</span>
              <div className="text-right">
                <div className="text-xs line-through text-muted-foreground/60">USD 105,80</div>
                <div className="font-display text-3xl font-bold text-primary leading-none">USD 14,90</div>
                <div className="text-xs text-muted-foreground mt-1">USD 1,24/mes</div>
              </div>
            </div>
          </div>

          <Button size="lg" className="w-full mt-8 text-base py-6 rounded-full shadow-lg shadow-primary/25" onClick={scrollToPlanes}>
            🍳 Quiero las recetas ahora →
          </Button>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Pago seguro</span>
            <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> Acceso inmediato</span>
            <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Garantía 7 días</span>
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="bg-card py-16 md:py-20 px-4">
        <div className="max-w-xl mx-auto bg-background border-2 border-border rounded-3xl p-8 md:p-10 text-center shadow-lg">
          <div className="h-20 w-20 rounded-full bg-secondary text-secondary-foreground flex flex-col items-center justify-center mx-auto">
            <span className="font-display text-3xl font-bold leading-none">7</span>
            <span className="text-[10px] uppercase tracking-widest opacity-80">días</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-secondary mt-6">
            7 días de garantía. Riesgo cero.
          </h2>
          <p className="mt-4 text-muted-foreground text-[16px] leading-relaxed">
            Usa el app por 7 días completos. Prueba las recetas, arma tu semana, explora los bonos.
          </p>
          <p className="mt-3 text-muted-foreground text-[16px] leading-relaxed">
            Si al cabo de una semana no te encanta, me mandas un email y te devuelvo cada centavo.{" "}
            <strong className="text-secondary">Y te quedas con acceso a todo lo que descargaste.</strong>
          </p>
          <p className="mt-4 text-primary font-semibold">El riesgo es 100% mío.</p>
        </div>
      </section>

      {/* COMO RECEBER */}
      <section className="bg-background py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <SectionTitle>✦ Así recibes tu acceso</SectionTitle>
            <p className="mt-5 text-muted-foreground text-[17px]">
              En la hora de la compra, todo queda en tu mano.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-4">
            <DeliveryCard icon={<CreditCard className="h-6 w-6" />} title="Pagas seguro" desc="Tarjeta, Mercado Pago o PayPal" />
            <DeliveryCard icon={<Mail className="h-6 w-6" />} title="Email inmediato" desc="Acceso en menos de 2 minutos" />
            <DeliveryCard icon={<Smartphone className="h-6 w-6" />} title="Celular" desc="Abre las recetas mientras cocinas" />
            <DeliveryCard icon={<Monitor className="h-6 w-6" />} title="Computadora" desc="Míralo en pantalla grande también" />
            <DeliveryCard icon={<RefreshCw className="h-6 w-6" />} title="¿Lo perdiste?" desc="Manda mensaje y te enviamos todo de nuevo" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card py-16 md:py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <SectionTitle>Preguntas honestas, respuestas directas.</SectionTitle>
          </div>
          <Accordion type="single" collapsible className="mt-10 space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-background border border-border rounded-xl px-5 data-[state=open]:shadow-sm">
                <AccordionTrigger className="font-display text-secondary text-left text-[16px] hover:no-underline py-4">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-muted-foreground leading-relaxed pb-4">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-secondary text-secondary-foreground py-16 md:py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-4xl leading-tight">
            Puedes seguir improvisando huevo con pan. O tener +200 recetas en tu celular hoy.
          </h2>
          <p className="mt-5 text-secondary-foreground/75 text-[17px]">
            Por menos de lo que te cuesta un café de Starbucks al mes, resuelves tu desayuno de los próximos 12 meses — sin sufrir, sin aburrirte, sin complicarte.
          </p>
          <Button size="lg" onClick={scrollToPlanes} className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground text-base px-10 py-6 rounded-full shadow-xl shadow-primary/30">
            🍳 Quiero mi acceso ahora →
          </Button>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-secondary-foreground/60">
            <span className="flex items-center gap-1.5"><Lock className="h-4 w-4" /> Pago 100% seguro</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> Acceso inmediato</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4" /> Garantía de 7 días</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-foreground text-background/60 text-center py-8 px-4 text-xs leading-loose">
        <p>© {new Date().getFullYear()} Desayuno Fit. Todos los derechos reservados.</p>
        <p>Esta página no es afiliada a Facebook, Instagram, Meta o cualquier plataforma de anuncios.</p>
        <p>Los resultados pueden variar de persona a persona.</p>
        <p className="mt-3">
          <Link to="/login" className="text-primary hover:underline font-medium">
            Ya compré, acceder →
          </Link>
        </p>
      </footer>
    </div>
  );
}

/* ----------------- Subcomponents ----------------- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-secondary leading-tight">
      {children}
    </h2>
  );
}

function DiffCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">{icon}</div>
      <h3 className="font-display text-lg text-secondary mt-4">{title}</h3>
      <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="text-center">
      <span className="block font-display text-2xl font-bold text-primary leading-none">{n}</span>
      <span className="block text-[11px] text-muted-foreground uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

function PlanCard({
  name, price, priceOld, period, savings, badge, badgeAccent, popular, features, ctaLabel, onClick,
}: {
  name: string; price: string; priceOld?: string; period: string; savings?: string;
  badge?: string; badgeAccent?: boolean; popular?: boolean;
  features: string[]; ctaLabel: string; onClick: () => void;
}) {
  return (
    <div className={`relative bg-card rounded-2xl p-7 border-2 transition-all hover:shadow-lg ${
      popular ? "border-primary shadow-lg shadow-primary/15" : "border-border hover:border-primary/40"
    }`}>
      {badge && (
        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap ${
          badgeAccent ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
        }`}>
          {badge}
        </span>
      )}
      <h3 className="font-display text-lg text-secondary text-center">{name}</h3>
      {priceOld && <p className="mt-3 text-center text-sm text-muted-foreground/60 line-through">{priceOld}</p>}
      <div className={`text-center font-display font-bold text-primary leading-none ${priceOld ? "mt-1" : "mt-3"}`}>
        <span className="text-base align-top mr-0.5">USD</span>
        <span className="text-4xl">{price}</span>
      </div>
      <p className="mt-2 text-xs text-center text-muted-foreground">{period}</p>
      {savings && (
        <p className="mt-3 text-center">
          <span className="inline-block text-[11px] font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
            {savings}
          </span>
        </p>
      )}
      <ul className="mt-5 space-y-2 text-sm text-foreground/85">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
            <span dangerouslySetInnerHTML={{ __html: f.replace(/\+ (.+)/, "+ <strong>$1</strong>") }} />
          </li>
        ))}
      </ul>
      <Button
        onClick={onClick}
        className={`w-full mt-6 rounded-xl py-5 ${popular ? "" : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"}`}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}

function DeliveryCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border text-center shadow-sm">
      <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mx-auto">{icon}</div>
      <h4 className="font-display text-[15px] text-secondary mt-3">{title}</h4>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}

function Row({ label, right, bold, small }: { label: string; right: React.ReactNode; bold?: boolean; small?: boolean }) {
  return (
    <div className={`flex justify-between items-center ${small ? "text-sm text-muted-foreground" : ""} ${bold ? "pb-3 mb-2 border-b border-border" : "py-1"}`}>
      <span>{label}</span>
      <span>{right}</span>
    </div>
  );
}

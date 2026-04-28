import {
  CalendarDays,
  Sparkles,
  Clock,
  Flame,
  ShoppingBasket,
  Check,
  ChevronLeft,
  Loader2,
} from "lucide-react";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const RECIPES = [
  { name: "Avena cremosa con frutos rojos", kcal: 320, time: 8, hue: 18 },
  { name: "Tortitas proteicas de plátano", kcal: 290, time: 10, hue: 35 },
  { name: "Bowl tropical de chía y mango", kcal: 280, time: 7, hue: 50 },
  { name: "Tostadas de aguacate y huevo", kcal: 340, time: 9, hue: 130 },
  { name: "Yogur griego con granola casera", kcal: 260, time: 5, hue: 25 },
  { name: "Smoothie verde energizante", kcal: 240, time: 6, hue: 95 },
  { name: "Pan integral con ricotta y miel", kcal: 310, time: 8, hue: 40 },
];

const SHOPPING = [
  "Avena en hojuelas",
  "Frutos rojos congelados",
  "Plátano maduro",
  "Huevos",
  "Aguacate Hass",
  "Yogur griego natural",
  "Pan integral",
  "Espinaca fresca",
];

export function WeekPlanMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      {/* Glow de fundo */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, color-mix(in oklab, var(--primary) 50%, transparent), transparent 70%)",
        }}
      />

      {/* Frame do celular */}
      <div className="phone-float relative rounded-[2.2rem] bg-secondary p-2.5 shadow-2xl shadow-secondary/40 ring-1 ring-black/10">
        {/* Notch */}
        <div className="absolute left-1/2 top-2.5 -translate-x-1/2 h-5 w-24 rounded-b-2xl bg-secondary z-20" />

        {/* Tela */}
        <div className="relative overflow-hidden rounded-[1.7rem] bg-background aspect-[9/19]">
          {/* Status bar (sempre visível) */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-2.5 pb-1 text-[10px] text-foreground/70 font-medium">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
              <span className="h-2 w-3 rounded-sm border border-foreground/60" />
            </span>
          </div>

          {/* ===== SCENE 1 — HOME / botão gerar ===== */}
          <div className="phone-scene scene-1 absolute inset-0 pt-7 px-4">
            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">
              Inicio
            </p>
            <h4 className="font-display text-[18px] text-secondary leading-tight mt-0.5">
              Hola, Sofía 👋
            </h4>
            <p className="text-[11px] text-muted-foreground mt-1">
              ¿Lista para tu semana?
            </p>

            <div className="mt-4 rounded-2xl bg-card border border-border p-3">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                Plan semanal
              </div>
              <p className="font-display text-[14px] text-secondary mt-1 leading-snug">
                Genera tus 7 desayunos en 1 clic
              </p>

              {/* Botão com cursor que clica */}
              <div className="relative mt-3">
                <div className="phone-cta relative flex items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold py-2 shadow-lg shadow-primary/40">
                  <Sparkles className="h-3 w-3" />
                  Generar mi plan
                </div>
                <div className="phone-cursor absolute right-6 top-1/2 -translate-y-1/2 text-primary-foreground">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 drop-shadow" fill="currentColor">
                    <path d="M3 2l7 18 2.5-7L20 10z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-card border border-border p-2.5">
                <p className="text-[9px] uppercase text-muted-foreground tracking-wide">Recetas</p>
                <p className="font-display text-[14px] text-secondary mt-0.5">+200</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-2.5">
                <p className="text-[9px] uppercase text-muted-foreground tracking-wide">Tiempo</p>
                <p className="font-display text-[14px] text-secondary mt-0.5">10 min</p>
              </div>
            </div>
          </div>

          {/* ===== SCENE 2 — LOADING ===== */}
          <div className="phone-scene scene-2 absolute inset-0 pt-7 px-4 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
              <Loader2 className="relative h-10 w-10 text-primary animate-spin" />
            </div>
            <p className="font-display text-[14px] text-secondary mt-4">
              Armando tu semana…
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Sin repetir · Balanceado
            </p>
          </div>

          {/* ===== SCENE 3 — PLANO SEMANAL ===== */}
          <div className="phone-scene scene-3 absolute inset-0 pt-7 px-4">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <ChevronLeft className="h-3 w-3" />
              Inicio
            </div>
            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mt-1">
              Mi semana
            </p>
            <h4 className="font-display text-[16px] text-secondary leading-tight mt-0.5">
              Plan semanal
            </h4>
            <div className="mt-1 flex items-center gap-1.5 text-[9.5px] text-muted-foreground">
              <CalendarDays className="h-2.5 w-2.5" />
              7 desayunos · sin repetir
            </div>

            {/* Tabs dos dias */}
            <div className="mt-2 flex gap-1">
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className={`day-pill flex-1 text-center text-[9.5px] font-semibold py-1 rounded-md ${
                    i === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground/70 border border-border"
                  }`}
                  style={{ animationDelay: `${4.4 + i * 0.07}s` }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Lista de receitas */}
            <div className="mt-2 space-y-1.5">
              {RECIPES.map((r, i) => (
                <div
                  key={r.name}
                  className="recipe-row flex items-center gap-2 bg-card border border-border rounded-xl p-1.5"
                  style={{ animationDelay: `${4.7 + i * 0.13}s` }}
                >
                  <div
                    className="h-8 w-8 rounded-lg flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, hsl(${r.hue} 75% 78%), hsl(${
                        r.hue + 20
                      } 65% 60%))`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-semibold text-secondary leading-tight truncate">
                      {r.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[9px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {r.time} min
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Flame className="h-2.5 w-2.5" />
                        {r.kcal} kcal
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* ===== SCENE 4 — LISTA DE COMPRAS ===== */}
          <div className="phone-scene scene-4 absolute inset-0 pt-7 px-4">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <ChevronLeft className="h-3 w-3" />
              Mi semana
            </div>
            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mt-1">
              Auto-generada
            </p>
            <h4 className="font-display text-[16px] text-secondary leading-tight mt-0.5 flex items-center gap-1.5">
              <ShoppingBasket className="h-4 w-4 text-primary" />
              Lista del súper
            </h4>

            <div className="mt-3 space-y-1.5">
              {SHOPPING.map((item, i) => (
                <div
                  key={item}
                  className="shop-row flex items-center gap-2 bg-card border border-border rounded-lg px-2.5 py-1.5"
                  style={{ animationDelay: `${9.5 + i * 0.1}s` }}
                >
                  <div className="h-4 w-4 rounded border border-primary flex items-center justify-center bg-primary">
                    <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
                  </div>
                  <span className="text-[11px] text-foreground/85">{item}</span>
                </div>
              ))}
            </div>

            <div className="phone-toast absolute bottom-4 left-4 right-4 rounded-full bg-secondary text-secondary-foreground text-[10.5px] font-semibold py-2 text-center shadow-lg flex items-center justify-center gap-1.5">
              <Check className="h-3 w-3 text-primary" />
              Compartido por WhatsApp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

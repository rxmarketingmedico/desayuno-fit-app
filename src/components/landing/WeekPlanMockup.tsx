import { CalendarDays, Sparkles, Clock, Flame } from "lucide-react";

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

      {/* Bolha "1 clic" flutuante */}
      <div className="phone-tap absolute -left-2 top-24 z-20 flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-semibold shadow-lg shadow-primary/40">
        <Sparkles className="h-3 w-3" />
        1 clic
      </div>

      {/* Frame do celular */}
      <div className="phone-float relative rounded-[2.2rem] bg-secondary p-2.5 shadow-2xl shadow-secondary/40 ring-1 ring-black/10">
        {/* Notch */}
        <div className="absolute left-1/2 top-2.5 -translate-x-1/2 h-5 w-24 rounded-b-2xl bg-secondary z-10" />

        {/* Tela */}
        <div className="relative overflow-hidden rounded-[1.7rem] bg-background aspect-[9/19]">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-2.5 pb-1 text-[10px] text-foreground/70 font-medium">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
              <span className="h-2 w-3 rounded-sm border border-foreground/60" />
            </span>
          </div>

          {/* Header app */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">
              Mi semana
            </p>
            <h4 className="font-display text-[17px] text-secondary leading-tight mt-0.5">
              Plan semanal
            </h4>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>7 desayunos · sin repetir</span>
            </div>
          </div>

          {/* Tabs dos dias */}
          <div className="px-4">
            <div className="flex gap-1 overflow-hidden">
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className={`day-pill flex-1 text-center text-[10px] font-semibold py-1.5 rounded-md ${
                    i === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground/70 border border-border"
                  }`}
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Lista de receitas */}
          <div className="px-4 mt-3 space-y-2">
            {RECIPES.map((r, i) => (
              <div
                key={r.name}
                className="recipe-row flex items-center gap-2.5 bg-card border border-border rounded-xl p-2"
                style={{ animationDelay: `${0.4 + i * 0.18}s` }}
              >
                <div
                  className="h-10 w-10 rounded-lg flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, hsl(${r.hue} 75% 78%), hsl(${
                      r.hue + 20
                    } 65% 60%))`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-secondary leading-tight truncate">
                    {r.name}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[9.5px] text-muted-foreground">
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

          {/* Fade inferior */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      {/* Bolha "Lista lista" flutuante */}
      <div className="phone-tap-2 absolute -right-3 bottom-28 z-20 flex items-center gap-1.5 rounded-full bg-card border border-primary/30 px-3 py-1.5 text-[11px] font-semibold text-secondary shadow-lg">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Lista lista
      </div>
    </div>
  );
}

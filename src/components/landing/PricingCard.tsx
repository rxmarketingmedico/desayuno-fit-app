import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { openHotmart, type PlanKey } from "@/config/hotmart";
import { toast } from "sonner";

interface PricingCardProps {
  plan: PlanKey;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
}

export function PricingCard({
  plan,
  title,
  price,
  period,
  description,
  features,
  badge,
  highlighted,
}: PricingCardProps) {
  const handleClick = () => {
    openHotmart(plan, () =>
      toast.info("Próximamente disponible", {
        description: "Estamos terminando de configurar el checkout. ¡Vuelve pronto!",
      }),
    );
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl p-8 border-2 flex flex-col",
        highlighted
          ? "bg-card border-primary shadow-lg md:scale-105"
          : "bg-card border-border shadow-sm",
      )}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
          {badge}
        </span>
      )}
      <h3 className="font-display text-xl font-semibold text-secondary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold text-secondary">{price}</span>
        <span className="text-sm text-muted-foreground">/{period}</span>
      </div>
      <ul className="mt-6 space-y-3 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <span className="text-foreground">{f}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={handleClick}
        size="lg"
        variant={highlighted ? "default" : "outline"}
        className="mt-8 w-full"
      >
        Quiero este plan
      </Button>
    </div>
  );
}

import { Star } from "lucide-react";

export function TestimonialCard({
  name,
  city,
  text,
}: {
  name: string;
  city: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-6 border border-border shadow-sm">
      <div className="flex gap-1 text-primary">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-sm text-foreground leading-relaxed italic">"{text}"</p>
      <div className="mt-4 pt-4 border-t border-border">
        <p className="font-semibold text-secondary text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{city}</p>
      </div>
    </div>
  );
}

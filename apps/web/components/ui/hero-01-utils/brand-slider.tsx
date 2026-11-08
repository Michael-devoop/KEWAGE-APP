import { Marquee } from "./marquee";

export type BrandItem = {
  name: string;
};

type BrandSliderProps = {
  items: BrandItem[];
  caption: string;
};

export default function BrandSlider({ items, caption }: BrandSliderProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <p className="text-center text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {caption}
      </p>
      <div className="relative mt-5 overflow-hidden">
        <Marquee pauseOnHover className="[--duration:40s] [--gap:0.75rem]">
          {items.map((item) => (
            <span
              key={item.name}
              className="rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              {item.name}
            </span>
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}

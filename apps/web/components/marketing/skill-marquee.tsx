import {
  Blocks,
  Car,
  Droplets,
  Flame,
  Grid3x3,
  Hammer,
  Home,
  Leaf,
  Paintbrush,
  Plug,
  Sparkles,
  Truck,
  Wind,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SKILLS } from "@skillconnect/domain";

const icons: Record<string, LucideIcon> = {
  "general-handyman": Wrench,
  plumbing: Droplets,
  electrical: Zap,
  carpentry: Hammer,
  painting: Paintbrush,
  tiling: Grid3x3,
  masonry: Blocks,
  roofing: Home,
  hvac: Wind,
  "appliance-repair": Plug,
  cleaning: Sparkles,
  moving: Truck,
  gardening: Leaf,
  "auto-repair": Car,
  welding: Flame,
};

function SkillChip({ name, Icon }: { name: string; Icon: LucideIcon }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm font-medium shadow-soft">
      <Icon className="size-4 text-primary" aria-hidden />
      {name}
    </span>
  );
}

export function SkillMarquee() {
  const list = SKILLS.map((skill) => ({
    name: skill.name,
    Icon: icons[skill.id] ?? Wrench,
  }));

  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3 pr-3">
            {list.map(({ name, Icon }) => (
              <li key={name}>
                <SkillChip name={name} Icon={Icon} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

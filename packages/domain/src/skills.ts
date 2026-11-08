import type { Skill } from "./types";

export const SKILLS: Skill[] = [
  { id: "general-handyman", name: "General handyman" },
  { id: "plumbing", name: "Plumbing" },
  { id: "electrical", name: "Electrical" },
  { id: "carpentry", name: "Carpentry" },
  { id: "painting", name: "Painting" },
  { id: "tiling", name: "Tiling" },
  { id: "masonry", name: "Masonry" },
  { id: "roofing", name: "Roofing" },
  { id: "hvac", name: "HVAC" },
  { id: "appliance-repair", name: "Appliance repair" },
  { id: "cleaning", name: "Cleaning" },
  { id: "moving", name: "Moving" },
  { id: "gardening", name: "Gardening" },
  { id: "auto-repair", name: "Auto repair" },
  { id: "welding", name: "Welding" },
];

export const skillName = (id: string): string =>
  SKILLS.find((skill) => skill.id === id)?.name ?? id;

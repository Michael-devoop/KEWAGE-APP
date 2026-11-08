import BrandSlider, { type BrandItem } from "./brand-slider";
import Header, { type NavigationSection } from "./header";
import { HeroSection, type HeroSectionProps } from "./hero";

export type AgencyHeroSectionProps = HeroSectionProps & {
  navigationData: NavigationSection[];
  cta: { label: string; href: string };
  signedIn?: boolean;
  signInLabel: string;
  signOutLabel: string;
  brandItems: BrandItem[];
  brandCaption: string;
};

export default function AgencyHeroSection({
  navigationData,
  cta,
  signedIn,
  signInLabel,
  signOutLabel,
  brandItems,
  brandCaption,
  ...hero
}: AgencyHeroSectionProps) {
  return (
    <div className="relative">
      <Header
        navigationData={navigationData}
        cta={cta}
        signedIn={signedIn}
        signInLabel={signInLabel}
        signOutLabel={signOutLabel}
      />
      <HeroSection {...hero} />
      <BrandSlider items={brandItems} caption={brandCaption} />
    </div>
  );
}

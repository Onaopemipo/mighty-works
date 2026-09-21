import "./home-v2.css";
import "./home-v3-integration.css";

import { AboutMightyWorks } from "@/components/home-v2/about-mighty-works";
import { CompactRegistration } from "@/components/home-v2/compact-registration";
import { ExperienceGrid } from "@/components/home-v2/experience";
import { HeroV2 } from "@/components/home-v2/hero";
import { LiveBillboard } from "@/components/live/live-billboard";
import { Navbar } from "@/components/home-v2/navbar";
import { ScheduleV2 } from "@/components/home-v2/schedule";
import { SiteFooter } from "@/components/home-v2/site-footer";

export default function Home() {
  return (
    <main className="homev2">
      <Navbar />
      <HeroV2 />
      <AboutMightyWorks />
      <ExperienceGrid />
      <LiveBillboard
        id="nations"
        showHeader={false}
      />
      <ScheduleV2 />
      <CompactRegistration />
      <SiteFooter />
    </main>
  );
}

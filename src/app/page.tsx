import { Experience } from "@/components/home/experience";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { LiveNations } from "@/components/home/live-nations";
import { SchedulePreview } from "@/components/home/schedule-preview";
import { Scripture } from "@/components/home/scripture";

export default function Home() {
  return (
    <main>
      <Hero />
      <Experience />
      <Scripture />
      <LiveNations />
      <SchedulePreview />
      <FinalCta />
    </main>
  );
}

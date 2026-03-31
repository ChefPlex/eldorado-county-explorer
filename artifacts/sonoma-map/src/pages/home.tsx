import { useState } from "react";
import { MapComponent } from "@/components/Map";
import { Sidebar } from "@/components/Sidebar";
import { SonomaChef } from "@/components/SonomaChef";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<"all" | "winery" | "restaurant">("all");

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background font-sans">
      <Sidebar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      <div className="flex-1 relative h-full">
        <MapComponent activeFilter={activeFilter} />
        <SonomaChef />
      </div>
    </div>
  );
}

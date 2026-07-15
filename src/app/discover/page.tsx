import { AppHeader } from "@/components/AppHeader";
import { DiscoverView } from "@/components/discover/DiscoverView";

export const metadata = { title: "Discover" };

export default function DiscoverPage() {
  return (
    <>
      <AppHeader />
      <DiscoverView />
    </>
  );
}

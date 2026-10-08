import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import { UserMenu } from "./user-menu";

export async function AppHeader() {
  return (
    <header className="sticky bg-linear-to-r from-sidebar to-background/60 backdrop-blur-md top-0 z-10 flex py-3 border-b rounded-br-3xl px-4">
      <div className="flex w-full items-center gap-1 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-bold">Dashboard</h1>
      </div>
      <div className="flex gap-2">
        <ModeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AiButton } from "./ai-button";
import { AiChat } from "./ai-chat";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

const SUGGESTIONS = [
  "Summarize this page",
  "What can you help me with?",
  "Explain this in simple terms",
];

export function AiSidepanel() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <AiButton />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md overflow-hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="border-b bg-linear-to-b from-muted/50 to-transparent p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-4xl">
              <Logo className="text-primary-foreground" />
            </div>
            <div className="grid gap-0.5 text-left">
              <SheetTitle className="text-base">CBC AI</SheetTitle>
              <SheetDescription className="text-xs">
                Your assistant, always one click away.
              </SheetDescription>
            </div>
            <SheetClose data-slot="sheet-close" asChild>
              <Button
                variant="ghost"
                className="absolute top-4 right-4 bg-secondary"
                size="icon-lg"
              >
                <XIcon />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        <AiChat />
      </SheetContent>
    </Sheet>
  );
}

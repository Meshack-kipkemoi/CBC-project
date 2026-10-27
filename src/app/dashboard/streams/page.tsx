import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getStreamsAccess } from "@/lib/streams/queries";
import { StreamsView } from "@/sections/streams/stream-view";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Streams",
};

export default async function StreamsPage() {
  const supabase = await createClient();
  if (!(await getStreamsAccess(supabase))) notFound();

  return <StreamsView />;
}

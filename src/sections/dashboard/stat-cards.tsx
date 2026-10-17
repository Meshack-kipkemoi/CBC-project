import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const cards = [
  {
    title: "Total Learners",
    value: "62.3%",
    description: "Term 1, 2025",
  },
  {
    title: "Overall School Average",
    value: "62.3%",
    description: "Term 1, 2025",
  },
  {
    title: "Syllabus Progress",
    value: "62.3%",
    description: "Term 1, 2025",
  },
  {
    title: "Classes Below Expectations",
    value: "3",
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 smd:grid-cols-2 lg:grid-cols-4 justify-between gap-3">
      {cards.map((card, index) => (
        <Card key={index} className="relative flex-1 gap-0 py-0 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-[calc(0.5*var(--radius))] bg-linear-to-r from-primary via-indigo-400 to-emerald-500" />
          <CardHeader className="px-6 pt-6 pb-0">
            <CardTitle className="text-sm text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex items-center gap-4 px-6 pt-2 pb-0">
            <span className="text-2xl font-bold tracking-tight">
              {card.value}
            </span>
          </CardContent>

          <CardFooter className="px-6 pt-2 pb-4">
            {card.description && (
              <CardDescription className="text-xs">
                {card.description}
              </CardDescription>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

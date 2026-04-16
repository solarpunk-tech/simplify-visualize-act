import { archiveRecords } from "@/lib/ubik-data";
import { SectionHeading, Surface } from "@/components/ubik-primitives";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Archive() {
  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <SectionHeading
          eyebrow="History"
          title="Archive holds prior work without changing the shell."
        />

        <Surface className="gap-0 overflow-hidden">
          <CardHeader className="border-b border-border/70">
            <p className="section-label">Archive index</p>
            <CardTitle>Historical records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 py-4">
            {archiveRecords.map((record) => (
              <div
                key={record.id}
                className="grid gap-3 rounded-xl border border-border/70 bg-background px-4 py-4 text-sm md:grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr]"
              >
                <span className="font-medium text-foreground">{record.title}</span>
                <span className="text-muted-foreground">{record.type}</span>
                <span className="text-muted-foreground">{record.updatedAt}</span>
                <span className="text-muted-foreground">{record.owner}</span>
              </div>
            ))}
          </CardContent>
        </Surface>
      </div>
    </div>
  );
}

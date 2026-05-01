import { CompassRoseIcon } from "@phosphor-icons/react";

import { SectionHeading, StatusPill, Surface } from "@/components/ubik-primitives";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { intelligenceRecords } from "@/lib/ubik-data";

export default function Intelligence() {
  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-[62rem] space-y-8">
        <SectionHeading
          eyebrow="Monitoring"
          title="Intelligence keeps research, watchlists, and saved reports readable."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {intelligenceRecords.map((record) => (
            <Surface key={record.id} className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <div className="flex items-center justify-between gap-3">
                  <StatusPill tone="default">{record.source}</StatusPill>
                  <CompassRoseIcon className="h-4 w-4 text-foreground" />
                </div>
                <CardTitle className="mt-4 text-2xl font-semibold tracking-tight">{record.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 py-4">
                <p className="text-sm leading-7 text-foreground/86">{record.summary}</p>
                <p className="section-label">{record.freshness}</p>
              </CardContent>
            </Surface>
          ))}
        </div>
      </div>
    </div>
  );
}

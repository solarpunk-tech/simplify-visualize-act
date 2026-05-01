import { SectionHeading, Surface } from "@/components/ubik-primitives";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsSections } from "@/lib/ubik-data";

export default function Settings() {
  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeading
          eyebrow="Workspace Preferences"
          title="Settings expose environment, connectors, and operator defaults clearly."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {settingsSections.map((section) => (
            <Surface key={section.id} className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <CardTitle className="text-lg font-semibold tracking-tight">{section.title}</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">{section.description}</p>
              </CardHeader>
              <CardContent className="space-y-3 py-4">
                {section.values.map((value) => (
                  <div key={value.label} className="surface-well rounded-xl p-3">
                    <p className="section-label">{value.label}</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{value.value}</p>
                  </div>
                ))}
              </CardContent>
            </Surface>
          ))}
        </div>
      </div>
    </div>
  );
}

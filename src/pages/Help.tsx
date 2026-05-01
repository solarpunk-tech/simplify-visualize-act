import { SectionHeading, SmallButton, Surface } from "@/components/ubik-primitives";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { helpResources } from "@/lib/ubik-data";

export default function Help() {
  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <SectionHeading
          eyebrow="Support"
          title="Help keeps operator guidance close to the product."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {helpResources.map((resource) => (
            <Surface key={resource.id} className="gap-0 overflow-hidden">
              <CardHeader className="border-b border-border/70">
                <CardTitle className="text-lg font-semibold tracking-tight">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-sm leading-6 text-muted-foreground">{resource.description}</p>
              </CardContent>
              <CardFooter>
                <SmallButton>{resource.action}</SmallButton>
              </CardFooter>
            </Surface>
          ))}
        </div>
      </div>
    </div>
  );
}

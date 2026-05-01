import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { marketingSectionInner } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";

export default function SiteContact() {
  return (
    <div className="space-y-8">
      <section className={cn("space-y-4 border border-border/60 bg-card py-10 md:py-14", marketingSectionInner)}>
        <p className="section-label">Contact</p>
        <h1 className="font-heading text-4xl tracking-tight">Let&apos;s design your rollout</h1>
        <p className="max-w-3xl text-muted-foreground">
          Share your current process and we will map a practical implementation path using this exact UI system.
        </p>
      </section>

      <div className={cn("grid gap-4 md:grid-cols-3", marketingSectionInner)}>
        <Card className="surface-card rounded-none border-border/70 md:col-span-2">
          <CardHeader>
            <CardTitle>Request a walkthrough</CardTitle>
            <CardDescription>We usually reply within one business day.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input placeholder="Full name" />
                <Input type="email" placeholder="Work email" />
              </div>
              <Input placeholder="Company" />
              <Textarea placeholder="Tell us what you are building" rows={5} />
              <Button type="button">Submit request</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="surface-well rounded-none border-border/70">
          <CardHeader>
            <CardTitle>Other ways to connect</CardTitle>
            <CardDescription>Choose what is easiest for your team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>hello@simplifyvisualizeact.com</p>
            <p>+1 (555) 281-1034</p>
            <p>Mon-Fri, 9am-6pm PT</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
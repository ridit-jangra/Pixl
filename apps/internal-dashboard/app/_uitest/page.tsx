import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UITest() {
  return (
    <div className="dark min-h-screen bg-background text-foreground p-10 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">shadcn UI check</h1>
      <div className="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      <div className="flex gap-3 items-center flex-wrap">
        <Input placeholder="Search…" className="max-w-xs" />
        <Badge>Approved</Badge>
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="destructive">Banned</Badge>
        <Badge variant="outline">L4</Badge>
      </div>
      <div className="grid grid-cols-3 gap-4 max-w-3xl">
        <Card>
          <CardHeader><CardTitle>Players</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">107</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">9</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-muted-foreground">Bans</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">0</CardContent>
        </Card>
      </div>
    </div>
  );
}

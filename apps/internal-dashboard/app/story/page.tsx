import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/guard";
import { listStoryNodes, type StoryNodeRow } from "@/lib/db";
import {
  addStoryNode,
  updateStoryNode,
  toggleStoryNode,
  deleteStoryNode,
} from "@/app/actions";
import { PendingButton } from "@/app/_components/PendingButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

const KINDS = ["chapter", "operation", "prologue"];
const selectCls =
  "w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs";

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Label className={`block font-normal ${className}`}>
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground mt-1">{hint}</span>}
    </Label>
  );
}

function NodeFields({ n }: { n?: StoryNodeRow }) {
  const kind = n?.kind ?? "chapter";
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="Kind">
          <select name="kind" defaultValue={kind} className={selectCls}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Seal" hint="badge glyph">
          <Input name="seal" defaultValue={n?.seal} maxLength={8} placeholder="I" className="text-sm" />
        </Field>
        <Field label="Tag">
          <Input name="tag" defaultValue={n?.tag} maxLength={40} placeholder="CHAPTER I" className="text-sm" />
        </Field>
        <Field label="Duration">
          <Input name="duration" defaultValue={n?.duration} maxLength={40} placeholder="3 WEEKS" className="text-sm" />
        </Field>
      </div>

      <Field label="Title">
        <Input name="title" defaultValue={n?.title} required maxLength={120} placeholder="Rise of Pixl" className="text-sm" />
      </Field>

      <Field label="Body">
        <Textarea name="body" defaultValue={n?.body} rows={3} placeholder="What happens in this chapter…" className="text-sm" />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Quote" hint="operations only , the italic teaser line">
          <Input name="quote" defaultValue={n?.quote} maxLength={300} placeholder="The Capital is standing…" className="text-sm" />
        </Field>
        <Field label="Outcome" hint="operations only , supports <b> for bold">
          <Input name="outcome" defaultValue={n?.outcome} maxLength={400} placeholder="The Great Forge is restored." className="text-sm" />
        </Field>
      </div>

      <Field label="Sort position" className="sm:w-40">
        <Input name="position" type="number" defaultValue={n?.position ?? 0} className="text-sm" />
      </Field>
    </div>
  );
}

export default async function StoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const access = await requireAdmin();
  if (!access.isSuper) redirect("/");
  const { error, saved } = await searchParams;
  const nodes = await listStoryNodes();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Story</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          The season timeline players see at <span className="font-mono">/timeline</span> , chapters,
          operations and the prologue, in order. Edits go live on the page.
        </p>
      </div>

      {saved && (
        <Alert>
          <AlertDescription className="font-medium text-emerald-600 dark:text-emerald-400">
            Saved.
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="font-medium text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-5 md:p-6 gap-0">
        <div className="text-base font-semibold mb-5">Add a node</div>
        <form action={addStoryNode} className="space-y-5">
          <NodeFields />
          <PendingButton className="bg-brand text-white border-transparent" pendingText="Adding…">
            Add node
          </PendingButton>
        </form>
      </Card>

      <div className="space-y-4">
        {nodes.map((n) => (
          <Card key={n.id} className={`p-5 md:p-6 gap-0 ${n.active ? "" : "opacity-60"}`}>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge variant="secondary">{n.kind}</Badge>
              {n.tag && <Badge variant="outline">{n.tag}</Badge>}
              <span className="font-bold">{n.title}</span>
              {!n.active && <Badge variant="secondary">hidden</Badge>}
            </div>
            <form action={updateStoryNode} className="space-y-5">
              <input type="hidden" name="id" value={n.id} />
              <NodeFields n={n} />
              <div className="flex items-center gap-2 pt-1">
                <PendingButton variant="outline" size="sm" pendingText="Saving…">
                  Save changes
                </PendingButton>
              </div>
            </form>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <form action={toggleStoryNode}>
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="active" value={n.active ? "0" : "1"} />
                <Button variant="outline" size="sm">{n.active ? "Hide" : "Show"}</Button>
              </form>
              <form action={deleteStoryNode}>
                <input type="hidden" name="id" value={n.id} />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600"
                >
                  Delete
                </Button>
              </form>
            </div>
          </Card>
        ))}
        {nodes.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground text-sm">
            No story nodes yet. Add the prologue and your first chapter above.
          </Card>
        )}
      </div>
    </div>
  );
}

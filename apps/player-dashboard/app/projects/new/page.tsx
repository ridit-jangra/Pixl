"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, send } from "@/app/utils/server-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

interface HackatimeProject {
  name: string;
  seconds: number;
}

function hours(seconds: number) {
  return (seconds / 3600).toFixed(1) + "h";
}

export default function NewProject() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [hackatimeProjects, setHackatimeProjects] = useState<string[]>([]);
  const [htOptions, setHtOptions] = useState<HackatimeProject[]>([]);
  const [htLoading, setHtLoading] = useState(true);
  const [usedAi, setUsedAi] = useState(false);
  const [aiNotes, setAiNotes] = useState("");

  useEffect(() => {
    async function load() {
      setHtLoading(true);
      try {
        const d = (await api("/hackatime/stats")) as {
          stats: { connected: boolean; projects: HackatimeProject[] };
        };
        if (d.stats?.connected) setHtOptions(d.stats.projects || []);
      } catch {}
      setHtLoading(false);
    }
    load();
  }, []);

  async function handleCreate() {
    setSaving(true);
    const r = await send("POST", "/projects", {
      name: name.trim(),
      description: description.trim(),
      repoUrl: repoUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      imageUrl: "",
      level: 1,
      usedAi,
      aiNotes: usedAi ? aiNotes.trim() : "",
      hackatimeProjects,
    });
    setSaving(false);
    if (r.ok && r.project?.id) {
      router.push(`/projects/${r.project.id}`);
    } else if (r.error === "name_required") {
      setStep(0);
    } else {
      alert(r.error || "Failed to create project.");
    }
  }

  function canAdvance() {
    switch (step) {
      case 0:
        return name.trim().length > 0;
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  }

  const STEPS = [
    { title: "Name your project", subtitle: "What are you building?" },
    { title: "Describe it", subtitle: "Tell us what it does (Markdown supported)" },
    { title: "Link Hackatime projects", subtitle: "Connect your coding time for proof of hours" },
    {
      title: "Links (optional)",
      subtitle: "Add a GitHub repo and demo link — you can add these later",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-xl mx-auto">
      <button
        onClick={() => router.push("/projects")}
        className="text-sm text-muted-foreground hover:text-foreground inline-block"
      >
        ← ALL PROJECTS
      </button>

      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          New Project
        </h1>
        <p className="text-muted-foreground mt-1">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-orange" : "bg-border"
            }`}
          />
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-heading font-bold">
              {STEPS[step].title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {STEPS[step].subtitle}
            </p>
          </div>

          {step === 0 && (
            <div className="space-y-2">
              <Label>PROJECT NAME *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder="e.g. My Awesome Game"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim())
                    setStep(1);
                }}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Label>DESCRIPTION</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="What it is, what it does… Markdown supported (**bold**, # headings, - lists, etc.)"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length} / 2000
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label>HACKATIME PROJECTS</Label>
              {htLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading your Hackatime projects…
                </p>
              ) : htOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No Hackatime projects found. You can link them later from the
                  project page.
                </p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {htOptions
                    .sort((a, b) => b.seconds - a.seconds)
                    .map((h) => {
                      const checked = hackatimeProjects.includes(h.name);
                      return (
                        <label
                          key={h.name}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                            checked
                              ? "border-orange bg-orange/5"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(c) => {
                              if (c) setHackatimeProjects([...hackatimeProjects, h.name]);
                              else
                                setHackatimeProjects(
                                  hackatimeProjects.filter((n) => n !== h.name),
                                );
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{h.name}</p>
                          </div>
                          <span className="text-xs text-cyan shrink-0">
                            {hours(h.seconds)}
                          </span>
                        </label>
                      );
                    })}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Pick projects that track your coding time for this project.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>GITHUB REPO (optional)</Label>
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  maxLength={500}
                  placeholder="https://github.com/you/project"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>DEMO / PLAYABLE LINK (optional)</Label>
                <Input
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  maxLength={500}
                  placeholder="https://…"
                />
              </div>
              <div className="space-y-3 rounded-lg border p-4">
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={usedAi}
                    onCheckedChange={(c) => setUsedAi(c === true)}
                  />
                  <div>
                    <span className="font-medium">
                      I used AI on this project
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Only you and reviewers see this.
                    </p>
                  </div>
                </label>
                {usedAi && (
                  <div className="space-y-2 pl-7">
                    <Label>WHAT DID YOU USE AI FOR? *</Label>
                    <Textarea
                      value={aiNotes}
                      onChange={(e) => setAiNotes(e.target.value)}
                      maxLength={500}
                      rows={2}
                      placeholder="Which parts, which tools, how much…"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            {step > 0 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                <CaretLeftIcon className="size-4" />
                BACK
              </Button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()}>
                NEXT
                <CaretRightIcon className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={saving || !name.trim()}>
                {saving ? "CREATING…" : "CREATE PROJECT"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

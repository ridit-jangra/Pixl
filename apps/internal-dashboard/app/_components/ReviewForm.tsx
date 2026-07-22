"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { reviewProject } from "@/app/actions";
import { initDeductions, clearDeductions, subscribeDeductions, totalDeductedMinutes } from "@/app/_components/deflateStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function VerdictButtons({ secondPass }: { secondPass: boolean }) {
  const { pending } = useFormStatus();
  const [clicked, setClicked] = useState("");
  const approveLabel = secondPass ? "Approve & credit pixels" : "Approve";
  return (
    <>
      <Button
        name="verdict"
        value="approved"
        disabled={pending}
        onClick={() => setClicked("approved")}
        className="bg-emerald-600 text-white hover:bg-emerald-700"
      >
        {pending && clicked === "approved" ? "Approving…" : approveLabel}
      </Button>
      <Button
        name="verdict"
        value="needs_changes"
        disabled={pending}
        onClick={() => setClicked("needs_changes")}
        className="bg-red-600 text-white hover:bg-red-700"
      >
        {pending && clicked === "needs_changes" ? "Sending back…" : "Request changes"}
      </Button>
    </>
  );
}

export interface BountyOption {
  id: number;
  name: string;
  reward: number;
  description: string;
}

export function ReviewForm({
  projectId,
  repoUrl,
  demoUrl,
  claimedHours,
  defaultHours,
  secondPass = false,
  bounties = [],
}: {
  projectId: number;
  repoUrl: string | null;
  demoUrl: string | null;
  claimedHours: number;
  defaultHours?: number;
  secondPass?: boolean;
  bounties?: BountyOption[];
}) {
  const repoOpened = useRef<HTMLInputElement>(null);
  const demoOpened = useRef<HTMLInputElement>(null);
  const repoSeconds = useRef<HTMLInputElement>(null);
  const demoSeconds = useRef<HTMLInputElement>(null);
  const totalSeconds = useRef<HTMLInputElement>(null);
  const away = useRef<{ kind: "repo" | "demo"; at: number } | null>(null);
  const openedAt = useRef(Date.now());
  const [auditLen, setAuditLen] = useState(0);
  const AUDIT_MIN = 150;

  const baseHours = defaultHours ?? claimedHours;
  const [hours, setHours] = useState(baseHours);
  const [deducted, setDeducted] = useState(0);
  useEffect(() => {
    const update = () => {
      const mins = totalDeductedMinutes();
      setDeducted(mins);
      setHours(Math.max(0, Math.round((baseHours - mins / 60) * 10) / 10));
    };
    const unsub = subscribeDeductions(update);
    // Load any saved draft for this project, then sync once.
    initDeductions(String(projectId));
    update();
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    openedAt.current = Date.now();
    const settle = () => {
      const a = away.current;
      if (!a || document.visibilityState !== "visible") return;
      away.current = null;
      const el = a.kind === "repo" ? repoSeconds.current : demoSeconds.current;
      if (el)
        el.value = String(
          Math.round(Number(el.value || 0) + (Date.now() - a.at) / 1000),
        );
    };
    window.addEventListener("focus", settle);
    document.addEventListener("visibilitychange", settle);
    return () => {
      window.removeEventListener("focus", settle);
      document.removeEventListener("visibilitychange", settle);
    };
  }, []);

  const markOpen = (kind: "repo" | "demo") => {
    const el = kind === "repo" ? repoOpened.current : demoOpened.current;
    if (el) el.value = "1";
    away.current = { kind, at: Date.now() };
  };

  return (
    <form
      action={reviewProject}
      onSubmit={() => {
        if (totalSeconds.current)
          totalSeconds.current.value = String(
            Math.round((Date.now() - openedAt.current) / 1000),
          );
        // Verdict submitted , the saved draft has served its purpose.
        clearDeductions();
      }}
      className="mt-4 flex flex-col gap-2"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="repoOpened" defaultValue="0" ref={repoOpened} />
      <input type="hidden" name="demoOpened" defaultValue="0" ref={demoOpened} />
      <input type="hidden" name="repoSeconds" defaultValue="0" ref={repoSeconds} />
      <input type="hidden" name="demoSeconds" defaultValue="0" ref={demoSeconds} />
      <input type="hidden" name="totalSeconds" defaultValue="0" ref={totalSeconds} />
      <div className="flex flex-wrap gap-2 items-center text-sm font-bold">
        {repoUrl && (
          <Button asChild variant="secondary">
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => markOpen("repo")}
            >
              Repo
            </a>
          </Button>
        )}
        {demoUrl && (
          <Button asChild variant="secondary">
            <a
              href={demoUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => markOpen("demo")}
            >
              Demo
            </a>
          </Button>
        )}
        <Label className="flex items-center gap-2 ml-auto font-normal text-muted-foreground">
          Hours to credit (decrease only)
          {deducted > 0 && (
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium" title="Deflated from commits / journals">
              −{Math.floor(deducted / 60) > 0 ? `${Math.floor(deducted / 60)}h ` : ""}
              {deducted % 60}m
            </span>
          )}
          <Input
            name="approvedHours"
            type="number"
            step="0.1"
            min="0"
            max={claimedHours}
            value={hours}
            onChange={(e) => setHours(Math.min(claimedHours, Math.max(0, Number(e.target.value) || 0)))}
            className="w-24 text-sm"
          />
        </Label>
      </div>
      {bounties.length > 0 && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/[0.06] p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-1.5">
            Bounty board , tick what this project meets (paid on final approval)
          </div>
          {bounties.map((b) => (
            <Label key={b.id} className="flex items-start gap-2 text-sm py-0.5 font-normal">
              <Checkbox name="bountyIds" value={String(b.id)} className="mt-0.5" />
              <span>
                {b.name} <span className="font-semibold">+{b.reward} px</span>
                {b.description && <span className="text-muted-foreground"> , {b.description}</span>}
              </span>
            </Label>
          ))}
        </div>
      )}
      <div className="relative">
        <Textarea
          name="auditNote"
          required
          minLength={AUDIT_MIN}
          onChange={(e) => setAuditLen(e.target.value.trim().length)}
          placeholder="Internal audit note , never shown to the player, admins only. What did you check, what did the commits look like, anything sus? Min 150 characters."
          className="w-full text-sm"
          rows={3}
        />
        <span
          className={`pointer-events-none absolute bottom-1.5 right-2 text-[10px] tabular-nums ${
            auditLen >= AUDIT_MIN ? "text-emerald-500" : "text-muted-foreground"
          }`}
        >
          {auditLen}/{AUDIT_MIN}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 items-start">
        <Textarea
          name="note"
          required
          placeholder="Feedback for the player (required)"
          className="flex-1 min-w-64 text-sm"
          rows={2}
        />
        <VerdictButtons secondPass={secondPass} />
      </div>
    </form>
  );
}

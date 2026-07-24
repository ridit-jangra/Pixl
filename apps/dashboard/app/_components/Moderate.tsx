"use client";

import { useFormStatus } from "react-dom";
import { banPlayer, liftBan, sendNotification, warnPlayer } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SubmitBtn({
  children,
  className,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" className={className} disabled={pending || disabled}>
      {pending ? "..." : children}
    </Button>
  );
}

export function WarnForm({ userId, compact = false }: { userId: string; compact?: boolean }) {
  return (
    <form action={warnPlayer} className="flex gap-2 items-center">
      <input type="hidden" name="userId" value={userId} />
      {!compact && (
        <Input
          name="message"
          placeholder="Custom warning (optional)"
          className="text-sm flex-1"
        />
      )}
      <SubmitBtn className="bg-tang text-white hover:bg-tang/90">Warn</SubmitBtn>
    </form>
  );
}

export function BanForm({
  userId,
  compact = false,
  isBanned = false,
}: {
  userId: string;
  compact?: boolean;
  isBanned?: boolean;
}) {
  return (
    <form action={banPlayer} className="flex gap-2 items-center flex-wrap">
      <input type="hidden" name="userId" value={userId} />
      <Input
        name="reason"
        placeholder="Reason"
        maxLength={1000}
        className={compact ? "text-sm w-32" : "text-sm flex-1 min-w-32"}
        required
        disabled={isBanned}
      />
      <Select name="hours" defaultValue="24" disabled={isBanned}>
        <SelectTrigger size="sm" className="text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 hour</SelectItem>
          <SelectItem value="24">1 day</SelectItem>
          <SelectItem value="168">7 days</SelectItem>
          <SelectItem value="720">30 days</SelectItem>
          <SelectItem value="0">Permanent</SelectItem>
        </SelectContent>
      </Select>
      <SubmitBtn className="bg-brand text-white hover:bg-brand/90" disabled={isBanned}>
        {isBanned ? "Already banned" : "Ban"}
      </SubmitBtn>
    </form>
  );
}

export function NotifyForm({ userId }: { userId: string }) {
  return (
    <form action={sendNotification} className="flex gap-2 items-center flex-wrap">
      <input type="hidden" name="userId" value={userId} />
      <Input
        name="title"
        placeholder="Title"
        maxLength={100}
        className="text-sm w-40"
        required
      />
      <Input
        name="body"
        placeholder="Message"
        maxLength={500}
        className="text-sm flex-1 min-w-40"
        required
      />
      <SubmitBtn className="bg-mint text-ink hover:bg-mint/90">Notify</SubmitBtn>
    </form>
  );
}

export function LiftBanForm({ userId }: { userId: string }) {
  return (
    <form action={liftBan}>
      <input type="hidden" name="userId" value={userId} />
      <SubmitBtn className="bg-mint text-ink hover:bg-mint/90">Lift ban</SubmitBtn>
    </form>
  );
}

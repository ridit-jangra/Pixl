import { Spinner } from "@/app/_components/Loading";

// Root fallback: covers every route segment that doesn't define its own
// loading.tsx, so navigation always shows instant feedback.
export default function Loading() {
  return <Spinner />;
}

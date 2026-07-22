import { publicStats, publicGallery } from "@/lib/db";
import { GrowthChart } from "@/app/_components/GrowthChart";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pixl , live stats",
  description: "Ships, hours and pixels from the Pixl YSWS, live.",
};

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5 gap-0 text-center">
      <div className="text-3xl font-semibold tabular-nums leading-tight">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </Card>
  );
}

export default async function StatsPage() {
  const [stats, gallery] = await Promise.all([publicStats(30), publicGallery(12)]);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <div className="text-center">
          <a href="https://pixl.rsvp" className="inline-block">
            <span className="text-4xl font-bold tracking-tight text-brand">PIXL</span>
          </a>
          <h1 className="text-xl font-semibold mt-2">Live stats</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Teenagers building games, getting paid in pixels.{" "}
            <a href="https://pixl.rsvp" className="text-brand hover:underline">
              Join in →
            </a>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Tile label="players" value={stats.players.toLocaleString("en-US")} />
          <Tile label="projects approved" value={stats.approvedProjects.toLocaleString("en-US")} />
          <Tile label="in review right now" value={stats.inReview.toLocaleString("en-US")} />
          <Tile label="hours of making" value={stats.totalHours.toLocaleString("en-US")} />
          <Tile
            label="pixels in circulation"
            value={stats.pixelsCirculating.toLocaleString("en-US")}
          />
          <Tile label="reviews done" value={stats.reviews.toLocaleString("en-US")} />
        </div>

        <Card className="p-5">
          <GrowthChart
            title="Ships per day (last 30 days)"
            series="projects"
            kind="daily"
            points={stats.shipsSeries}
          />
        </Card>

        {gallery.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Fresh off the press</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((p) => (
                <a
                  key={p.id}
                  href={p.demo_url || "https://pixl.rsvp"}
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:-translate-y-0.5 transition-transform"
                >
                  <Card className="overflow-hidden py-0 gap-0 h-full">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_url}
                        alt=""
                        className="w-full h-36 object-cover border-b border-border"
                      />
                    ) : (
                      <div className="w-full h-36 grid place-items-center bg-muted border-b border-border text-3xl">
                        🎮
                      </div>
                    )}
                    <CardContent className="p-3">
                      <div className="font-semibold truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        by {p.owner}
                        {p.approved_hours != null ? ` · ${p.approved_hours}h` : ""}
                      </div>
                      {p.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</div>
                      )}
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground pb-6">
          Updated live ·{" "}
          <a href="https://pixl.rsvp" className="hover:text-brand">
            pixl.rsvp
          </a>
        </div>
      </div>
    </div>
  );
}

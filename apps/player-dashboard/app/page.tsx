"use client";

import { useEffect, useState } from "react";
import { Project } from "./types";
import { api } from "./utils/server-utils";
import { StarBurst } from "@/components/ui/dot-matrix";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Wallet {
  ok: boolean;
  pixels: number;
  approvedHours: number;
  level: number;
  pxPerHour: number;
}

export default function Overview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const storedName = localStorage.getItem("pixl_name") || "Player";
      setName(storedName);
      const [projectsData, walletData] = await Promise.all([
        api("/projects"),
        api("/profile/wallet"),
      ]);
      setProjects(projectsData);
      setWallet(walletData);
      setLoading(false);
    }

    load();
  }, []);

  if (loading)
    return (
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
        <StarBurst size={60} color="#ec3750" />
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          Welcome back, {name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your Pixl overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green">{wallet?.level ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Pixels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange">
              {wallet?.pixels?.toLocaleString() ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Approved Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue">
              {wallet?.approvedHours?.toFixed(1) ?? 0}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Px / Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple">
              {wallet?.pxPerHour?.toFixed(1) ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cyan">
              {projects.length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

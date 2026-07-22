"use client";

import { useEffect, useState } from "react";
import { Project } from "../../types";
import { api } from "../../utils/server-utils";
import { Beacon } from "@/components/ui/dot-matrix";

export default function Leaderboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api("/projects");
      setProjects(data);
      setLoading(false);
    }

    load();
  }, []);

  if (loading)
    return (
      <div className="absolute top-1/2 left-[40%] -translate-x-1/2 -translate-y-1/2">
        <Beacon size={60} color="#338eda" />
      </div>
    );

  return <div></div>;
}

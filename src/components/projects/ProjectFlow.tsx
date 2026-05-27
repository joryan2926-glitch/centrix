"use client";

import { Background, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import type { ProjectTask } from "@/types/projects";

export function ProjectFlow({ tasks }: { tasks: ProjectTask[] }) {
  const nodes: Node[] = tasks.map((task, index) => ({
    id: task.id,
    position: { x: 80 + index * 250, y: index % 2 ? 220 : 80 },
    data: { label: <div className="min-w-[180px] rounded-[14px] border border-slate-200 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"><p className="font-bold text-slate-950">{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.assignee} - {task.status}</p></div> }
  }));
  const edges: Edge[] = tasks.filter((task) => task.dependencyId).map((task) => ({ id: `${task.dependencyId}-${task.id}`, source: task.dependencyId!, target: task.id, animated: true, style: { stroke: "#2563EB", strokeWidth: 2 } }));
  return <div className="h-[520px] overflow-hidden rounded-[18px] border border-slate-200 bg-white"><ReactFlow nodes={nodes} edges={edges} fitView><Background color="#cbd5e1" gap={24} /><Controls /></ReactFlow></div>;
}

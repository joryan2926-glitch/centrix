"use client";

import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { Bot, Bell, Clock, Filter, GitBranch, Play, Split } from "lucide-react";
import { blockLabels } from "@/services/workflows/calculations";
import type { WorkflowBlock, WorkflowConnection } from "@/types/workflows";

const iconMap = {
  trigger: Play,
  action: GitBranch,
  condition: Split,
  delay: Clock,
  ai: Bot,
  notification: Bell,
  filter: Filter
};

export function WorkflowCanvas({ blocks, connections }: { blocks: WorkflowBlock[]; connections: WorkflowConnection[] }) {
  const nodes: Node[] = blocks.map((block) => {
    const Icon = iconMap[block.type];
    return {
      id: block.id,
      position: { x: block.positionX, y: block.positionY },
      data: {
        label: (
          <div className="min-w-[190px] rounded-[16px] border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
            <div className="flex items-center gap-2 text-blue-700">
              <Icon size={16} />
              <span className="text-xs font-black uppercase tracking-[0.14em]">{blockLabels[block.type]}</span>
            </div>
            <p className="mt-2 font-bold text-slate-950">{block.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{block.description}</p>
          </div>
        )
      },
      type: "default"
    };
  });
  const edges: Edge[] = connections.map((connection) => ({
    id: connection.id,
    source: connection.sourceId,
    target: connection.targetId,
    label: connection.label,
    animated: true,
    style: { stroke: "#2563EB", strokeWidth: 2 }
  }));

  return (
    <div className="h-[560px] overflow-hidden rounded-[18px] border border-slate-200 bg-white">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#cbd5e1" gap={24} />
        <MiniMap nodeColor="#2563EB" pannable zoomable />
        <Controls />
      </ReactFlow>
    </div>
  );
}

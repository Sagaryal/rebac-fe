import React, { useEffect, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { API_URL } from "./constants";

// Dagre configuration
const nodeWidth = 200;
const nodeHeight = 60;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 100, ranksep: 150 }); // Increased spacing

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Assign colors based on node type
const getNodeColor = (type: string) => {
  switch (type) {
    case "resource":
      return "#6a0dad"; // Purple for resources
    case "role":
      return "#4ddbff"; // Light blue for roles
    case "permission":
      return "#33cc33"; // Green for permissions
    default:
      return "#cccccc"; // Default gray
  }
};

const GraphDisplay: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/permit-data`);
        const { nodes: rawNodes, edges: rawEdges } = response.data;

        // Map raw nodes to React Flow nodes
        const reactFlowNodes: Node[] = rawNodes.map((node) => ({
          id: node.id,
          data: { label: node.label },
          position: { x: 0, y: 0 }, // Position set by Dagre
          type: node.type,
          style: { backgroundColor: getNodeColor(node.type), color: "#fff" },
        }));

        // Map raw edges to React Flow edges
        const reactFlowEdges: Edge[] = rawEdges.map((edge) => ({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          animated: true,
          label: edge.label || "",
          style: { strokeWidth: 2 },
          markerEnd: {
            type: "arrowclosed",
            width: 20,
            height: 20,
            color: "#4ddbff",
          },
        }));

        // Apply Dagre layout
        const layoutedElements = getLayoutedElements(reactFlowNodes, reactFlowEdges);
        setNodes(layoutedElements.nodes);
        setEdges(layoutedElements.edges);
      } catch (error) {
        console.error("Error fetching graph data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[800px]">
        <ClipLoader color="#4ddbff" size={100} cssOverride={{borderWidth: 10}} />
      </div>
    );
  }

  return (
    <div style={{ height: "800px", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <MiniMap
          nodeColor={(node) => getNodeColor(node.type)}
        />
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default GraphDisplay;

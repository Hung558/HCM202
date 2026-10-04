import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ChevronDown, Maximize, Network, Quote } from "lucide-react";
import data from "./data.json";
import NavBar from "./NavBar";
import Knowledge from "./Knowledge";

const COL_GAP = 310;
const ROW_GAP = 92;

/* ---------- Duyệt cây dữ liệu ---------- */

function flatten(node, depth = 0, parent = null, out = []) {
  out.push({ node, depth, parent });
  (node.children || []).forEach((c) => flatten(c, depth + 1, node.id, out));
  return out;
}

const ALL = flatten(data.root);
const BY_ID = Object.fromEntries(ALL.map((x) => [x.node.id, x]));
const EXPANDABLE_IDS = ALL.filter((x) => x.node.children?.length).map((x) => x.node.id);

/* ---------- Tính vị trí node (trái → phải), chỉ tính các node đang hiện ---------- */

function buildGraph(expanded) {
  const nodes = [];
  const edges = [];
  let nextRow = 0;

  function place(node, depth) {
    const kids = expanded.has(node.id) ? node.children || [] : [];
    let y;
    if (kids.length === 0) {
      y = nextRow * ROW_GAP;
      nextRow += 1;
    } else {
      const ys = kids.map((k) => {
        const ky = place(k, depth + 1);
        edges.push({
          id: `${node.id}->${k.id}`,
          source: node.id,
          target: k.id,
          type: "smoothstep",
          style: { stroke: "var(--color-line-strong, #D9CFBF)", strokeWidth: 2 },
        });
        return ky;
      });
      y = (ys[0] + ys[ys.length - 1]) / 2;
    }
    nodes.push({
      id: node.id,
      type: "topic",
      position: { x: depth * COL_GAP, y },
      data: { depth, hasChildren: !!node.children?.length },
    });
    return y;
  }

  place(data.root, 0);
  return { nodes, edges };
}

/* ---------- Node tuỳ chỉnh ---------- */

const TopicNode = memo(function TopicNode({ id, data: d }) {
  const { depth, hasChildren, label, expanded, selected, visited, onToggle } = d;

  const tone =
    depth === 0
      ? "bg-primary text-on-dark border-primary"
      : depth === 1
        ? "bg-ink text-on-dark border-ink"
        : "bg-white text-ink border-line-strong";

  const ring = selected ? "outline outline-2 outline-offset-2 outline-amber" : "";
  const width = depth === 0 ? 250 : depth === 1 ? 230 : 240;

  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left ${tone} ${ring}`}
      style={{ width }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} isConnectable={false} />
      <span className="flex-1 text-[14px] font-bold leading-snug">{label}</span>
      {depth > 1 && visited && (
        <span className="size-2 shrink-0 rounded-full bg-success" aria-label="Đã xem" />
      )}
      {hasChildren && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
          aria-label={expanded ? "Thu gọn nhánh" : "Mở nhánh"}
          aria-expanded={expanded}
          className="nodrag grid size-7 shrink-0 place-items-center rounded-full bg-gold text-ink transition-transform hover:scale-105"
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
      )}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} isConnectable={false} />
    </div>
  );
});

const nodeTypes = { topic: TopicNode };

/* ---------- Bản đồ + panel chi tiết ---------- */

function MindmapInner() {
  const { fitView } = useReactFlow();
  const [expanded, setExpanded] = useState(() => new Set([data.root.id]));
  const [selectedId, setSelectedId] = useState(data.root.id);
  const [visited, setVisited] = useState(() => new Set([data.root.id]));

  const toggle = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const select = useCallback((id) => {
    setSelectedId(id);
    setVisited((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  // Mở cả chuỗi cha để một node con luôn hiện ra khi chọn từ panel
  const reveal = useCallback(
    (id) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        let p = BY_ID[id].parent;
        while (p) {
          next.add(p);
          p = BY_ID[p].parent;
        }
        return next;
      });
      select(id);
    },
    [select],
  );

  const graph = useMemo(() => buildGraph(expanded), [expanded]);

  const nodes = useMemo(
    () =>
      graph.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          label: BY_ID[n.id].node.short || BY_ID[n.id].node.label,
          expanded: expanded.has(n.id),
          selected: n.id === selectedId,
          visited: visited.has(n.id),
          onToggle: toggle,
        },
      })),
    [graph, expanded, selectedId, visited, toggle],
  );

  // Căn lại khung nhìn mỗi khi số node đang hiện thay đổi
  const layoutKey = graph.nodes.map((n) => n.id).join("|");
  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.15, maxZoom: 1, duration: 300 }), 30);
    return () => clearTimeout(t);
  }, [layoutKey, fitView]);

  const current = BY_ID[selectedId].node;
  const allOpen = EXPANDABLE_IDS.every((id) => expanded.has(id));
  const total = ALL.length;
  const percent = Math.round((visited.size / total) * 100);

  return (
    <div className="mx-auto max-w-[1180px] px-5 pt-10 pb-20">
      <p className="eyebrow">{data.eyebrow}</p>
      <h1 className="mt-2.5 text-[clamp(30px,4.6vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em]">
        {data.title}
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15.5px] leading-[1.65] text-ink-soft">{data.intro}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-dark"
          onClick={() => setExpanded(new Set(allOpen ? [data.root.id] : EXPANDABLE_IDS))}
        >
          <Network className="size-4" />
          {allOpen ? "Thu gọn tất cả" : "Mở tất cả"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => fitView({ padding: 0.15, maxZoom: 1, duration: 300 })}
        >
          <Maximize className="size-4" />
          Căn giữa sơ đồ
        </button>

        <div className="ml-auto flex min-w-[200px] items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-track">
            <motion.div
              className="h-full rounded-full bg-amber"
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[13px] font-semibold text-muted">
            Đã xem {visited.size}/{total} ý
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="card h-[460px] overflow-hidden lg:h-[600px]">
          <ReactFlow
            nodes={nodes}
            edges={graph.edges}
            nodeTypes={nodeTypes}
            onNodeClick={(_, n) => select(n.id)}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            preventScrolling={false}
            minZoom={0.4}
            maxZoom={1.4}
            proOptions={{ hideAttribution: true }}
          >
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        <aside className="card p-[22px] lg:h-[600px] lg:overflow-y-auto" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-[13px] font-semibold text-muted">
                {BY_ID[current.id].parent
                  ? BY_ID[BY_ID[current.id].parent].node.label
                  : "Ý trung tâm"}
              </p>
              <h2 className="mt-1.5 text-[22px] font-extrabold tracking-[-0.01em]">
                {current.label}
              </h2>
              <p className="mt-3 text-[15.5px] leading-[1.65] text-ink-soft">{current.detail}</p>

              {current.quote && (
                <p className="mt-4 rounded-2xl bg-cream px-5 py-4 font-serif italic leading-[1.6]">
                  <Quote className="mb-1.5 size-4 text-faint" aria-hidden="true" />
                  {current.quote}
                  <span className="mt-2 block text-[13px] not-italic text-muted">Hồ Chí Minh</span>
                </p>
              )}

              {current.children?.length > 0 && (
                <div className="mt-5">
                  <p className="text-[13px] font-semibold text-muted">Các ý nhánh</p>
                  <ul className="mt-2 grid gap-2">
                    {current.children.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => reveal(c.id)}
                          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-line-strong bg-white px-3.5 py-2 text-left text-[14px] font-semibold text-ink hover:bg-cream"
                        >
                          {c.label}
                          {visited.has(c.id) ? (
                            <span className="size-2 shrink-0 rounded-full bg-success" aria-label="Đã xem" />
                          ) : (
                            <ChevronRight className="size-4 shrink-0 text-faint" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

export default function Mindmap() {
  const [tab, setTab] = useState("mindmap"); // mặc định là Sơ đồ tư duy

  return (
    <>
      <NavBar activeTab={tab} onTabChange={setTab} />

      {tab === "mindmap" ? (
        <ReactFlowProvider>
          <MindmapInner />
        </ReactFlowProvider>
      ) : (
        <Knowledge />
      )}
    </>
  );
}
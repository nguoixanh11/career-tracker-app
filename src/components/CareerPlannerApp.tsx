"use client";
import React, { useState, useEffect } from "react";

/** ---------- Types ---------- */
type Task = {
  id: string;
  title: string;
  description?: string;
  start?: string; // ISO date (yyyy-mm-dd)
  end?: string;   // ISO date (yyyy-mm-dd)
  due?: string;   // optional
  status: "not_started" | "in_progress" | "done";
  effort: 1 | 2 | 3; // 1=low, 3=high
};

type Artifact = {
  id: string;
  title: string;
  link?: string;
  notes?: string;
};

type Plan = {
  name: string;
  subtitle?: string;
  description?: string;
  tasks: Task[];
  artifacts: Artifact[];
};

type Decision = {
  interestA: number; // 0..10
  tractionA: number; // 0..10
  marketPullA: number; // 0..10
  interestB: number; // 0..10
  tractionB: number; // 0..10
  marketPullB: number; // 0..10
  locationFlex: number; // 0..10 (overall)
  timeBudget: number; // 0..40 hours/wk
};

type AppState = {
  startISO: string; // yyyy-mm-dd
  planA: Plan;
  planB: Plan;
  decision: Decision;
};

/** ---------- Helpers ---------- */
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);
const formatDate = (d?: string) => (d ? new Date(d + "T00:00:00").toLocaleDateString() : "—");

// ---- Gantt helpers ----
const parseISODateLocal = (iso: string) => new Date(`${iso}T00:00:00`);
const addMonths = (d: Date, m: number) => {
  const n = new Date(d);
  n.setMonth(n.getMonth() + m);
  return n;
};
const monthDiff = (a: Date, b: Date) =>
  (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
// Deterministic month label to avoid hydration differences
const labelMonth = (d: Date) => {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
};

const toISODateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addMonthsISO = (iso: string, m: number) =>
  toISODateLocal(addMonths(parseISODateLocal(iso), m));

function initialState(): AppState {
  const s = todayISO();
  const q = (qnum: number) => ({
    start: addMonthsISO(s, (qnum - 1) * 3),
    end: addMonthsISO(s, (qnum - 1) * 3 + 2),
  });
  return {
    startISO: s,
    planA: {
      name: "Plan A — Strategy & BizOps",
      subtitle: "Operator track in product-led org",
      description:
        "Focus on strategic projects, product ops, and cross-functional execution. Build breadth and systems thinking.",
      tasks: [
        {
          id: uid(),
          title: "Map current product ops processes",
          description: "Shadow teams and document bottlenecks; deliver recommendations.",
          ...q(1),
          status: "not_started",
          effort: 2,
        },
        {
          id: uid(),
          title: "Stand up KPI dashboard (Looker/Metabase)",
          description: "Define north-star + input metrics and automate refresh.",
          ...q(1),
          status: "not_started",
          effort: 2,
        },
        {
          id: uid(),
          title: "Lead cross-functional OKR planning for H2",
          description: "Drive scope, alignment, and risk register across PM, Eng, GTM.",
          ...q(2),
          status: "not_started",
          effort: 3,
        },
        {
          id: uid(),
          title: "Run weekly exec metrics review",
          description: "Curate a crisp narrative; highlight deltas and actions.",
          ...q(2),
          status: "not_started",
          effort: 1,
        },
        {
          id: uid(),
          title: "Ship self-serve onboarding experiment with PM",
          description: "Define hypothesis, metrics, and runs; coordinate launch.",
          ...q(3),
          status: "not_started",
          effort: 3,
        },
        {
          id: uid(),
          title: "Create incident retro playbook",
          description: "Standardize RCA templates, scoring, and follow-ups.",
          ...q(3),
          status: "not_started",
          effort: 2,
        },
        {
          id: uid(),
          title: "Mentor ops analyst and propose hiring plan",
          description: "Define scope, ladder, and Q4 resourcing needs.",
          ...q(4),
          status: "not_started",
          effort: 1,
        },
        {
          id: uid(),
          title: "Present annual strategy readout to leadership",
          description: "Synthesize learnings, KPIs, and roadmap tradeoffs.",
          ...q(4),
          status: "not_started",
          effort: 2,
        },
      ],
      artifacts: [
        { id: uid(), title: "KPI dashboard", notes: "North-star + input metrics with automated refresh." },
        { id: uid(), title: "OKR plan deck", notes: "Alignment doc across PM, Eng, and GTM." },
        { id: uid(), title: "Onboarding experiment brief", notes: "Hypothesis, design, and success criteria." },
        { id: uid(), title: "Strategy readout", notes: "Annual narrative with risks and bets." },
      ],
    },
    planB: {
      name: "Plan B — Corp Dev / Strategic Finance",
      subtitle: "Transactions, FP&A, capital allocation",
      description:
        "Develop deal evaluation skills, financial modeling, and exec communication through structured finance roles.",
      tasks: [
        {
          id: uid(),
          title: "Refresh 3-statement model template",
          description: "Reusable, auditable, scenario-ready model with checks.",
          ...q(1),
          status: "not_started",
          effort: 3,
        },
        {
          id: uid(),
          title: "Build market map of target adjacencies",
          description: "Screen ~50 companies; score by fit, traction, and risks.",
          ...q(1),
          status: "not_started",
          effort: 2,
        },
        {
          id: uid(),
          title: "Evaluate two inbound opportunities",
          description: "Top-down + bottoms-up sizing; draft IC memos.",
          ...q(2),
          status: "not_started",
          effort: 3,
        },
        {
          id: uid(),
          title: "Stand up pipeline tracker & diligence checklist",
          description: "Stage definitions, owners, and artifact requirements.",
          ...q(2),
          status: "not_started",
          effort: 2,
        },
        {
          id: uid(),
          title: "Design capital allocation framework",
          description: "ROIC screen, hurdle rates, and payback thresholds.",
          ...q(3),
          status: "not_started",
          effort: 2,
        },
        {
          id: uid(),
          title: "Partner with Legal on NDA/LOI templates",
          description: "Standardize language to accelerate evaluation speed.",
          ...q(3),
          status: "not_started",
          effort: 1,
        },
        {
          id: uid(),
          title: "Lead diligence workstream for top target",
          description: "Own product, GTM, and finance tracks; assemble data room.",
          ...q(4),
          status: "not_started",
          effort: 3,
        },
        {
          id: uid(),
          title: "Integration & post-mortem playbook",
          description: "What worked, what didn’t, and day-1/30/90 plan.",
          ...q(4),
          status: "not_started",
          effort: 2,
        },
      ],
      artifacts: [
        { id: uid(), title: "3-statement model", notes: "Template with scenarios and error checks." },
        { id: uid(), title: "Market map", notes: "Segmented landscape with scoring rubric." },
        { id: uid(), title: "IC memo", notes: "Opportunity evaluation and recommendation." },
        { id: uid(), title: "Integration playbook", notes: "Day-1/30/90 plan and KPIs." },
      ],
    },
    decision: {
      interestA: 7,
      tractionA: 6,
      marketPullA: 6,
      interestB: 6,
      tractionB: 7,
      marketPullB: 7,
      locationFlex: 5,
      timeBudget: 30,
    },
  };
}

/** ---------- Persistence (Local Storage) ---------- */
const LS_KEY = "career-planner-state.v1";

function loadFromLS(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const s = window.localStorage.getItem(LS_KEY);
    return s ? (JSON.parse(s) as AppState) : null;
  } catch {
    return null;
  }
}

/** ---------- Small UI helpers (pure HTML) ---------- */
function Section({
  title,
  children,
  right,
}: {
  title: string;
  children?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="border rounded-lg bg-white">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        {right ? <div className="text-sm text-gray-600">{right}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label htmlFor={htmlFor} className="text-gray-700 mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

/** ---------- Main Component ---------- */
export default function CareerPlannerApp() {
  const [state, setState] = useState<AppState>(initialState);
  const [tab, setTab] = useState<"A" | "B">("A");
  const [hydrated, setHydrated] = useState(false);

  // mount: hydrate from localStorage
  useEffect(() => {
    setHydrated(true);
    const saved = loadFromLS();
    if (saved) setState(saved);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (typeof window !== "undefined" && "localStorage" in window) {
        window.localStorage.setItem(LS_KEY, JSON.stringify(state));
      }
    } catch (err) {
      console.warn("LocalStorage save failed; continuing without persistence", err);
    }
  }, [state, hydrated]);

  // Avoid SSR/CSR mismatch by rendering only after mount
  if (!hydrated) return null;

  // derived (plain constants, not hooks)
  const d = state.decision;
  const scoreA = clamp(Math.round((d.interestA + d.tractionA + d.marketPullA) / 3), 0, 10);
  const scoreB = clamp(Math.round((d.interestB + d.tractionB + d.marketPullB) / 3), 0, 10);
  const recommended = scoreA === scoreB ? "Tie — explore both" : scoreA > scoreB ? "Plan A" : "Plan B";

  // generic update
  const update = (patch: Partial<AppState>) => setState((s) => ({ ...s, ...patch }));

  const getPlan = (k: "A" | "B") => (k === "A" ? state.planA : state.planB);
  const setPlanByKey = (k: "A" | "B", p: Plan) =>
    update(k === "A" ? { planA: p } : { planB: p });

  const addTask = (k: "A" | "B") => {
    const title = (document.getElementById(`task-title-${k}`) as HTMLInputElement)?.value?.trim();
    if (!title) return;
    const start = (document.getElementById(`task-start-${k}`) as HTMLInputElement)?.value || undefined;
    const end = (document.getElementById(`task-end-${k}`) as HTMLInputElement)?.value || undefined;
    const effort = parseInt((document.getElementById(`task-effort-${k}`) as HTMLSelectElement)?.value || "2", 10) as 1 | 2 | 3;
    const description =
      (document.getElementById(`task-desc-${k}`) as HTMLTextAreaElement)?.value?.trim() || undefined;

    const plan = getPlan(k);
    const next: Plan = {
      ...plan,
      tasks: [
        ...plan.tasks,
        { id: uid(), title, description, start, end, status: "not_started", effort },
      ],
    };
    setPlanByKey(k, next);

    const titleEl = document.getElementById(`task-title-${k}`) as HTMLInputElement | null;
    const descEl = document.getElementById(`task-desc-${k}`) as HTMLTextAreaElement | null;
    const startEl = document.getElementById(`task-start-${k}`) as HTMLInputElement | null;
    const endEl = document.getElementById(`task-end-${k}`) as HTMLInputElement | null;
    const effEl = document.getElementById(`task-effort-${k}`) as HTMLSelectElement | null;
    if (titleEl) titleEl.value = "";
    if (descEl) descEl.value = "";
    if (startEl) startEl.value = "";
    if (endEl) endEl.value = "";
    if (effEl) effEl.value = "2";
  };
  const updateTask = (k: "A" | "B", id: string, patch: Partial<Task>) => {
    const plan = getPlan(k);
    setPlanByKey(k, {
      ...plan,
      tasks: plan.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  };

  const toggleTask = (k: "A" | "B", id: string) => {
    const plan = getPlan(k);
    setPlanByKey(k, {
      ...plan,
      tasks: plan.tasks.map((t) =>
        t.id === id ? { ...t, status: t.status === "done" ? "in_progress" : "done" } : t
      ),
    });
  };

  const removeTask = (k: "A" | "B", id: string) => {
    const plan = getPlan(k);
    setPlanByKey(k, { ...plan, tasks: plan.tasks.filter((t) => t.id !== id) });
  };


  const addArtifact = (k: "A" | "B") => {
    const title = (document.getElementById(`art-title-${k}`) as HTMLInputElement)?.value?.trim();
    if (!title) return;
    const link = (document.getElementById(`art-link-${k}`) as HTMLInputElement)?.value?.trim() || undefined;
    const notes = (document.getElementById(`art-notes-${k}`) as HTMLInputElement)?.value?.trim() || undefined;

    const plan = getPlan(k);
    setPlanByKey(k, {
      ...plan,
      artifacts: [...plan.artifacts, { id: uid(), title, link, notes }],
    });

    const titleEl = document.getElementById(`art-title-${k}`) as HTMLInputElement | null;
    const linkEl = document.getElementById(`art-link-${k}`) as HTMLInputElement | null;
    const notesEl = document.getElementById(`art-notes-${k}`) as HTMLInputElement | null;
    if (titleEl) titleEl.value = "";
    if (linkEl) linkEl.value = "";
    if (notesEl) notesEl.value = "";
  };

  const removeArtifact = (k: "A" | "B", id: string) => {
    const plan = getPlan(k);
    setPlanByKey(k, {
      ...plan,
      artifacts: plan.artifacts.filter((a) => a.id !== id),
    });
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-planner-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        setState(parsed);
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const resetAll = () => setState(initialState());

  // Gantt component
  function Gantt({
    startISO,
    tasks,
  }: {
    startISO: string;
    tasks: Task[];
  }) {
    const [months, setMonths] = useState<number>(12); // 12, 18, 24
    const startDate = parseISODateLocal(startISO);

    // Build header months
    const headerMonths = Array.from({ length: months }, (_, i) => addMonths(startDate, i));

    const bars = tasks.map((t) => {
      // Prefer explicit start/end
      if (t.start && t.end) {
        const ts = parseISODateLocal(t.start);
        const te = parseISODateLocal(t.end);
        let idx = monthDiff(startDate, ts);
        let span = Math.max(1, monthDiff(ts, te) + 1);
        if (idx < 0) { span = Math.max(0, span + idx); idx = 0; }
        if (idx > months) { span = 0; }
        if (idx + span > months) { span = Math.max(0, months - idx); }
        return { id: t.id, title: t.title, idx, span, done: t.status === "done", meta: "range" as const };
      }
      // Else, fall back to due month as a 1-month marker
      if (t.due) {
        const due = parseISODateLocal(t.due);
        let idx = monthDiff(startDate, due);
        let span = 1;
        if (idx < 0) { span = Math.max(0, span + idx); idx = 0; }
        if (idx > months) { span = 0; }
        if (idx + span > months) { span = Math.max(0, months - idx); }
        return { id: t.id, title: t.title, idx, span, done: t.status === "done", meta: "due" as const };
      }
      // No dates → no bar
      return { id: t.id, title: t.title, idx: 0, span: 0, done: t.status === "done", meta: "none" as const };
    });

    // Layout constants
    const leftColWidth = 280; // px (wider to fit long task titles)
    const trackHeight = 28;   // px

    return (
      <div className="space-y-3">
        {/* Controls */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Horizon:</span>
            <div className="flex gap-1">
              {[12, 18, 24].map((m) => (
                <button
                  key={m}
                  className={`px-2 py-1 border rounded ${months === m ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50"}`}
                  onClick={() => setMonths(m)}
                >
                  {m} mo
                </button>
              ))}
            </div>
          </div>
          <div className="text-gray-500">Start: {labelMonth(startDate)}</div>
        </div>

        {/* Header row */}
        <div
          className="grid text-xs font-medium text-gray-700"
          style={{ gridTemplateColumns: `minmax(${leftColWidth}px, ${leftColWidth}px) repeat(${months}, minmax(0, 1fr))` }}
        >
          <div className="px-2 py-1">Task</div>
          {headerMonths.map((d, i) => (
            <div key={i} className="px-1 py-1 text-center border-l">
              {labelMonth(d)}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {tasks.map((t) => {
            const bar = bars.find((b) => b.id === t.id)!;
            const leftPct = bar.span > 0 ? (bar.idx / months) * 100 : 0;
            const widthPct = bar.span > 0 ? (bar.span / months) * 100 : 0;

            return (
              <div
                key={t.id}
                className="grid items-center"
                style={{ gridTemplateColumns: `minmax(${leftColWidth}px, ${leftColWidth}px) repeat(${months}, minmax(0, 1fr))`, height: `${trackHeight}px` }}
              >
                {/* Title cell */}
                <div className="px-2 text-sm truncate">
                  <span className={`font-medium ${t.status === "done" ? "line-through text-gray-400" : "text-gray-800"}`}>{t.title}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {t.start && t.end ? `• ${formatDate(t.start)} → ${formatDate(t.end)}` : (t.due ? `• due ${formatDate(t.due)}` : null)}
                  </span>
                </div>

                {/* Timeline track */}
                <div className="relative h-full border-l border-t border-b rounded-r bg-gray-50 overflow-hidden" style={{ gridColumn: "2 / -1" }}>
                  {/* Bar */}
                  {widthPct > 0 && (
                    <div
                      className={`absolute top-1 bottom-1 rounded ${bar.done ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ left: `calc(${leftPct}% - 0px)`, width: `calc(${widthPct}% + 0px)` }}
                      title={`${t.title} • ${t.start && t.end ? `${formatDate(t.start)} → ${formatDate(t.end)}` : (t.due ? `Due ${formatDate(t.due)}` : "")}`}
                    />
                  )}
                  {/* Faint month separators */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        `repeating-linear-gradient(to right, rgba(0,0,0,0.07) 0 1px, transparent 1px calc(100%/${months}))`,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div className="text-sm text-gray-500 px-2 py-2 border rounded">No tasks yet.</div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          • Bars use start → end (if provided). If only a due date exists, they show as a 1-month marker. Green = done, Blue = active.
        </div>
      </div>
    );
  }

  // PlanPane component for each tab (pure HTML)
  function PlanPane({ k }: { k: "A" | "B" }) {
    const plan = getPlan(k);
    const [editingId, setEditingId] = useState<string | null>(null);

    // progress calc without hooks
    const totalEffort = plan.tasks.reduce((s, t) => s + (t.effort || 1), 0);
    const doneEffort = plan.tasks
      .filter((t) => t.status === "done")
      .reduce((s, t) => s + (t.effort || 1), 0);
    const pct = totalEffort ? Math.round((doneEffort / totalEffort) * 100) : 0;

    const onDragStart = (e: React.DragEvent, id: string) => {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    };
    const onDropTo = (e: React.DragEvent, status: Task["status"]) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      if (!id) return;
      updateTask(k, id, { status });
    };

    return (
      <div className="space-y-6">
        <Section
          title={`${k === "A" ? "Plan A" : "Plan B"} — Overview`}
          right={<span className="text-xs text-gray-500">Start: {formatDate(state.startISO)}</span>}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" htmlFor={`plan-name-${k}`}>
              <input
                id={`plan-name-${k}`}
                className="w-full border rounded px-3 py-2"
                value={plan.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPlanByKey(k, { ...plan, name: e.target.value })
                }
              />
            </Field>
            <Field label="Subtitle" htmlFor={`plan-sub-${k}`}>
              <input
                id={`plan-sub-${k}`}
                className="w-full border rounded px-3 py-2"
                value={plan.subtitle || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPlanByKey(k, { ...plan, subtitle: e.target.value })
                }
                placeholder="Short tagline"
              />
            </Field>
          </div>
          <Field label="Description" htmlFor={`plan-desc-${k}`}>
            <textarea
              id={`plan-desc-${k}`}
              className="w-full border rounded px-3 py-2 min-h-[90px]"
              value={plan.description || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setPlanByKey(k, { ...plan, description: e.target.value })
              }
              placeholder="What does success look like? What skills will you build?"
            />
          </Field>
        </Section>

        <Section title="Timeline (Gantt)">
          <Gantt startISO={state.startISO} tasks={plan.tasks} />
        </Section>

        {/* Tasks */}
        <Section
          title="Tasks"
          right={
            <div className="flex items-center gap-3 text-sm">
              <div className="w-40 h-2 bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-gray-900" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-gray-600">{pct}%</span>
              <span className="text-gray-500">
                {plan.tasks.filter((t) => t.status === "done").length}/{plan.tasks.length} done
              </span>
            </div>
          }
        >
          <div className="grid sm:grid-cols-5 gap-2 mb-3">
            <input id={`task-title-${k}`} className="sm:col-span-2 border rounded px-3 py-2" placeholder="Task title" />
            <input id={`task-start-${k}`} className="border rounded px-3 py-2" type="date" title="Start date" />
            <input id={`task-end-${k}`} className="border rounded px-3 py-2" type="date" title="End date" />
            <select id={`task-effort-${k}`} className="border rounded px-3 py-2" defaultValue="2" title="Effort (1=low, 3=high)">
              <option value="1">Effort 1</option>
              <option value="2">Effort 2</option>
              <option value="3">Effort 3</option>
            </select>
            <textarea id={`task-desc-${k}`} className="sm:col-span-4 border rounded px-3 py-2" placeholder="Optional description" />
            <button className="border rounded px-3 py-2 hover:bg-gray-50" onClick={() => addTask(k)}>Add</button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {(["not_started", "in_progress", "done"] as Task["status"][]).map((col) => {
              const label = col === "not_started" ? "Not Started" : col === "in_progress" ? "In Progress" : "Done";
              const items = plan.tasks.filter((t) => t.status === col);
              return (
                <div
                  key={col}
                  className="bg-gray-50 border rounded p-2 min-h-[260px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDropTo(e, col)}
                >
                  <div className="text-sm font-medium mb-2">{label} <span className="text-xs text-gray-500">({items.length})</span></div>
                  {items.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white border rounded p-2 mb-2 shadow-sm cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => onDragStart(e, t.id)}
                    >
                      {editingId === t.id ? (
                        <div className="w-full space-y-2">
                          <div className="grid sm:grid-cols-4 gap-2">
                            <input
                              id={`edit-title-${k}-${t.id}`}
                              className="sm:col-span-2 border rounded px-3 py-2"
                              defaultValue={t.title}
                              placeholder="Task title"
                            />
                            <input
                              id={`edit-start-${k}-${t.id}`}
                              className="border rounded px-3 py-2"
                              type="date"
                              defaultValue={t.start || ""}
                              title="Start"
                            />
                            <input
                              id={`edit-end-${k}-${t.id}`}
                              className="border rounded px-3 py-2"
                              type="date"
                              defaultValue={t.end || ""}
                              title="End"
                            />
                            <select
                              id={`edit-effort-${k}-${t.id}`}
                              className="border rounded px-3 py-2"
                              defaultValue={String(t.effort || 2)}
                              title="Effort"
                            >
                              <option value="1">Effort 1</option>
                              <option value="2">Effort 2</option>
                              <option value="3">Effort 3</option>
                            </select>
                            <textarea
                              id={`edit-desc-${k}-${t.id}`}
                              className="sm:col-span-4 border rounded px-3 py-2"
                              defaultValue={t.description || ""}
                              placeholder="Optional description"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="border rounded px-3 py-1.5 bg-gray-900 text-white"
                              onClick={() => {
                                const title = (document.getElementById(`edit-title-${k}-${t.id}`) as HTMLInputElement)?.value?.trim() || t.title;
                                const start = (document.getElementById(`edit-start-${k}-${t.id}`) as HTMLInputElement)?.value || undefined;
                                const end = (document.getElementById(`edit-end-${k}-${t.id}`) as HTMLInputElement)?.value || undefined;
                                const effort = parseInt((document.getElementById(`edit-effort-${k}-${t.id}`) as HTMLSelectElement)?.value || String(t.effort || 2), 10) as 1 | 2 | 3;
                                const description = (document.getElementById(`edit-desc-${k}-${t.id}`) as HTMLTextAreaElement)?.value?.trim() || undefined;
                                updateTask(k, t.id, { title, start, end, effort, description });
                                setEditingId(null);
                              }}
                            >
                              Save
                            </button>
                            <button className="border rounded px-3 py-1.5 hover:bg-gray-50" onClick={() => setEditingId(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium">{t.title}</div>
                              <div className="text-xs text-gray-600">
                                {t.start && t.end ? `${formatDate(t.start)} → ${formatDate(t.end)}` : "No dates"}
                                {typeof t.effort === "number" ? <span className="ml-2">• Effort {t.effort}/3</span> : null}
                              </div>
                              {t.description && <div className="text-sm text-gray-700 mt-1">{t.description}</div>}
                            </div>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button className="border rounded px-2 py-1 hover:bg-gray-50" onClick={() => setEditingId(t.id)}>
                              Edit
                            </button>
                            <button
                              className="border rounded px-2 py-1 text-red-600 hover:bg-red-50"
                              onClick={() => removeTask(k, t.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Artifacts */}
        <Section title="Artifacts (Proof of Work)">
          <div className="grid sm:grid-cols-4 gap-2 mb-3">
            <input id={`art-title-${k}`} className="sm:col-span-2 border rounded px-3 py-2" placeholder="Artifact title (e.g., Case study draft)" />
            <input id={`art-link-${k}`} className="sm:col-span-2 border rounded px-3 py-2" placeholder="Link (Drive, Notion, GitHub…)" />
            <input id={`art-notes-${k}`} className="sm:col-span-3 border rounded px-3 py-2" placeholder="Short note" />
            <button className="border rounded px-3 py-2 hover:bg-gray-50" onClick={() => addArtifact(k)}>Add</button>
          </div>

          <ul className="space-y-2">
            {plan.artifacts.map((a) => (
              <li key={a.id} className="border rounded p-2 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-gray-600">
                    {a.link ? (
                      <a href={a.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {a.link}
                      </a>
                    ) : (
                      <>No link</>
                    )}
                    {a.notes ? <span className="ml-2 text-gray-700">• {a.notes}</span> : null}
                  </div>
                </div>
                <button
                  className="border rounded px-2 py-1 text-red-600 hover:bg-red-50"
                  onClick={() => removeArtifact(k, a.id)}
                >
                  Remove
                </button>
              </li>
            ))}
            {plan.artifacts.length === 0 && (
              <li className="text-sm text-gray-500">No artifacts yet. Add something you can point to.</li>
            )}
          </ul>
        </Section>
      </div>
    );
  }

  /** ---------- Render ---------- */
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Career Planner</h1>
          <p className="text-sm text-gray-600">
            Lightweight tracker for plans, tasks, artifacts, and an evidence-based decision.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="startISO" className="text-sm text-gray-700">Start date</label>
            <input
              id="startISO"
              type="date"
              className="h-8 w-[180px] border rounded px-2"
              value={state.startISO}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update({ startISO: e.target.value })}
            />
          </div>

          <button
            className="border rounded px-3 py-2 hover:bg-gray-50"
            onClick={exportJSON}
            title="Download your current plan as JSON"
          >
            Export
          </button>

          <label className="relative inline-flex items-center">
            <span className="border rounded px-3 py-2 hover:bg-gray-50 cursor-pointer select-none">Import</span>
            <input
              type="file"
              accept="application/json"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files?.[0];
                if (f) importJSON(f);
              }}
            />
          </label>

          <button className="border rounded px-3 py-2 hover:bg-gray-50" onClick={resetAll}>Reset</button>
        </div>
      </div>

      {/* Tabs (pure HTML) */}
      <div role="tablist" aria-label="Plans" className="flex gap-2">
        <button
          role="tab"
          aria-selected={tab === "A"}
          className={`px-3 py-1.5 rounded border ${
            tab === "A" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-800 hover:bg-gray-50"
          }`}
          onClick={() => setTab("A")}
        >
          Plan A
        </button>
        <button
          role="tab"
          aria-selected={tab === "B"}
          className={`px-3 py-1.5 rounded border ${
            tab === "B" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-800 hover:bg-gray-50"
          }`}
          onClick={() => setTab("B")}
        >
          Plan B
        </button>
      </div>

      {/* Tab contents */}
      {tab === "A" && <PlanPane k="A" />}
      {tab === "B" && <PlanPane k="B" />}

      {/* Decision Assistant */}
      <Section title="Decision Assistant">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <div className="font-medium mb-1">Plan A</div>
            <Field label="Interest (0–10)" htmlFor="interestA">
              <input
                id="interestA"
                className="w-full border rounded px-3 py-2"
                type="number" min={0} max={10}
                value={state.decision.interestA}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update({ decision: { ...state.decision, interestA: clamp(parseInt(e.target.value || "0"), 0, 10) } })
                }
              />
            </Field>
            <Field label="Traction (0–10)" htmlFor="tractionA">
              <input
                id="tractionA"
                className="w-full border rounded px-3 py-2"
                type="number" min={0} max={10}
                value={state.decision.tractionA}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update({ decision: { ...state.decision, tractionA: clamp(parseInt(e.target.value || "0"), 0, 10) } })
                }
              />
            </Field>
            <Field label="Market Pull (0–10)" htmlFor="marketPullA">
              <input
                id="marketPullA"
                className="w-full border rounded px-3 py-2"
                type="number" min={0} max={10}
                value={state.decision.marketPullA}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update({ decision: { ...state.decision, marketPullA: clamp(parseInt(e.target.value || "0"), 0, 10) } })
                }
              />
            </Field>
            <div className="text-sm text-gray-700">Score A: <span className="font-semibold">{scoreA}/10</span></div>
          </div>

          <div>
            <div className="font-medium mb-1">Plan B</div>
            <Field label="Interest (0–10)" htmlFor="interestB">
              <input
                id="interestB"
                className="w-full border rounded px-3 py-2"
                type="number" min={0} max={10}
                value={state.decision.interestB}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update({ decision: { ...state.decision, interestB: clamp(parseInt(e.target.value || "0"), 0, 10) } })
                }
              />
            </Field>
            <Field label="Traction (0–10)" htmlFor="tractionB">
              <input
                id="tractionB"
                className="w-full border rounded px-3 py-2"
                type="number" min={0} max={10}
                value={state.decision.tractionB}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update({ decision: { ...state.decision, tractionB: clamp(parseInt(e.target.value || "0"), 0, 10) } })
                }
              />
            </Field>
            <Field label="Market Pull (0–10)" htmlFor="marketPullB">
              <input
                id="marketPullB"
                className="w-full border rounded px-3 py-2"
                type="number" min={0} max={10}
                value={state.decision.marketPullB}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update({ decision: { ...state.decision, marketPullB: clamp(parseInt(e.target.value || "0"), 0, 10) } })
                }
              />
            </Field>
            <div className="text-sm text-gray-700">Score B: <span className="font-semibold">{scoreB}/10</span></div>
          </div>

          <div>
            <div className="font-medium mb-1">Constraints</div>
            <Field label="Location Flexibility (0–10)" htmlFor="locationFlex">
              <input
                id="locationFlex"
                className="w-full border rounded px-3 py-2"
                type="number" min={0} max={10}
                value={state.decision.locationFlex}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update({ decision: { ...state.decision, locationFlex: clamp(parseInt(e.target.value || "0"), 0, 10) } })
                }
              />
            </Field>
            <Field label="Weekly Time Budget (hours)" htmlFor="timeBudget">
              <input
                id="timeBudget"
                className="w-full border rounded px-3 py-2"
                type="number" min={0} max={40}
                value={state.decision.timeBudget}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update({ decision: { ...state.decision, timeBudget: clamp(parseInt(e.target.value || "0"), 0, 40) } })
                }
              />
            </Field>

            <div className="mt-3 p-3 border rounded bg-gray-50">
              <div className="text-sm text-gray-700">
                Recommendation: <span className="font-semibold">{recommended}</span>
              </div>
              <div className="text-xs text-gray-600">
                Scores are averages of Interest, Traction, and Market Pull for each plan. Adjust and see how it changes.
              </div>
            </div>
          </div>
        </div>
      </Section>

      <footer className="text-xs text-gray-500 text-center">
        Data is stored locally in your browser (no server). Use Export/Import to back up or move devices.
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { TermManagePanel } from "@/components/term";
import { TopicSection } from "@/components/authoring/TopicSection";
import { cn } from "@/lib/utils";
import type { KelasClass, Term, Topic } from "@/types";

export interface TermSectionProps {
  classId: number;
  term: Term;
  topics: Topic[];
  classes: KelasClass[];
}

export function TermSection({ classId, term, topics, classes }: TermSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="overflow-hidden rounded-xl border-2 border-teal-200 bg-teal-50/30 dark:border-teal-900 dark:bg-teal-950/10">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <button type="button" onClick={() => setExpanded((value) => !value)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <ChevronDown size={18} className={cn("shrink-0 text-slate-400 transition-transform", expanded && "rotate-180")} />
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-slate-900 dark:text-white">{term.name}</h2>
            <p className="text-xs text-slate-500">Threshold {term.thresholdPercent}% · {topics.length} topic</p>
          </div>
        </button>
        <TermManagePanel classId={classId} term={term} />
      </div>
      {expanded ? (
        <div className="flex flex-col gap-3 border-t border-teal-200 p-4 dark:border-teal-900">
          {topics.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada topic dalam termin ini.</p>
          ) : (
            topics.map((topic) => <TopicSection key={topic.id} classId={classId} topic={topic} classes={classes} />)
          )}
        </div>
      ) : null}
    </section>
  );
}

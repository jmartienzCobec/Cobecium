"use client";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LynxHeader } from "@/components/LynxHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Plus,
  Filter,
  Bug,
  Lightbulb,
} from "lucide-react";

type SortMode = "trending" | "top" | "new";
type BoardFilter = "all" | "feature_request" | "bug_report";
type StatusFilter = string;

const STATUS_LABELS: Record<string, string> = {
  gathering_interest: "Gathering Interest",
  planned: "Planned",
  in_progress: "In Progress",
  complete: "Complete",
  closed: "Closed",
};

const STATUS_CLASSES: Record<string, string> = {
  gathering_interest: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40",
  planned: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40",
  in_progress: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40",
  complete: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/40",
  closed: "bg-muted text-muted-foreground border-muted-foreground/30",
};

function truncate(str: string, _maxLines = 2, maxLen = 180): string {
  const oneLine = str.replace(/\n/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  return oneLine.slice(0, maxLen).trim() + "…";
}

export function FeedbackPage() {
  const list = useQuery(api.feedback.list);
  const myFeedback = useQuery(api.feedback.listMyFeedback);
  const submitMutation = useMutation(api.feedback.submit);
  const voteMutation = useMutation(api.feedback.vote);

  const [sortMode, setSortMode] = useState<SortMode>("trending");
  const [search, setSearch] = useState("");
  const [boardFilter, setBoardFilter] = useState<BoardFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitDescription, setSubmitDescription] = useState("");
  const [submitBoard, setSubmitBoard] = useState<"feature_request" | "bug_report">("feature_request");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [onlyMyPosts, setOnlyMyPosts] = useState(false);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitTitle.trim() || !submitDescription.trim()) return;
    setSubmitting(true);
    try {
      await submitMutation({
        title: submitTitle.trim(),
        description: submitDescription.trim(),
        board: submitBoard,
      });
      setSubmitOpen(false);
      setSubmitTitle("");
      setSubmitDescription("");
      setSubmitBoard("feature_request");
      setSuccessMessage("Feedback submitted!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    if (!list) return [];
    let items = [...list];
    if (onlyMyPosts && myFeedback) {
      const myIds = new Set(myFeedback.map((f) => f._id));
      items = items.filter((i) => myIds.has(i._id));
    }
    if (boardFilter !== "all") {
      items = items.filter((i) => i.board === boardFilter);
    }
    if (statusFilter) {
      items = items.filter((i) => i.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.name && i.name.toLowerCase().includes(q))
      );
    }
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    if (sortMode === "top") {
      items.sort((a, b) => b.voteScore - a.voteScore);
    } else if (sortMode === "new") {
      items.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      items.sort((a, b) => {
        const ageA = (now - a.createdAt) / dayMs;
        const ageB = (now - b.createdAt) / dayMs;
        const hotA = (a.voteScore + a.commentCount * 0.5) / (1 + ageA * 0.1);
        const hotB = (b.voteScore + b.commentCount * 0.5) / (1 + ageB * 0.1);
        return hotB - hotA;
      });
    }
    return items;
  }, [list, onlyMyPosts, myFeedback, boardFilter, statusFilter, search, sortMode]);

  if (list === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none opacity-30 base-pattern" aria-hidden />
      <LynxHeader subtitle="Feedback & feature requests" activePage="feedback" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            {/* Guidelines banner — same card style as feedback entries for readability */}
            <Card className="border-2 border-accent/40 mb-6">
              <CardContent className="p-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-foreground mb-2">
                  Submission guidelines
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Feel free to submit feature requests and bug reports.</li>
                  <li>Search before posting — your feedback may already exist.</li>
                  <li>One request per submission; create separate posts for multiple ideas.</li>
                  <li>For bugs, select &quot;Bug Report&quot; as the board.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Sort tabs + search + filter + submit */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex rounded-none border-2 border-accent overflow-hidden">
                {(["trending", "top", "new"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSortMode(mode)}
                    className={`px-4 py-2 text-sm font-semibold uppercase ${
                      sortMode === mode
                        ? "bg-accent text-accent-foreground"
                        : "bg-background text-foreground hover:bg-accent/20"
                    }`}
                  >
                    {mode === "trending" ? "Trending" : mode === "top" ? "Top" : "New"}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs border-2 border-accent rounded-none"
              />
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="uppercase font-semibold rounded-none border-2 border-accent"
                  onClick={() => setFilterOpen((o) => !o)}
                  aria-expanded={filterOpen}
                >
                  <Filter className="w-4 h-4 mr-1" aria-hidden />
                  Filter
                </Button>
                {filterOpen && (
                  <div className="absolute left-0 top-full mt-1 z-20 border-2 border-accent bg-background p-3 shadow-lg min-w-[200px]">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Status
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setStatusFilter((s) => (s === value ? null : value))
                          }
                          className={`text-xs px-2 py-1 rounded border ${
                            statusFilter === value
                              ? "bg-accent text-accent-foreground border-accent"
                              : "border-muted-foreground/40 hover:bg-muted"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Board
                    </p>
                    <div className="flex gap-2">
                      {(["all", "feature_request", "bug_report"] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBoardFilter(b)}
                          className={`text-xs px-2 py-1 rounded border ${
                            boardFilter === b
                              ? "bg-accent text-accent-foreground border-accent"
                              : "border-muted-foreground/40 hover:bg-muted"
                          }`}
                        >
                          {b === "all" ? "All" : b === "feature_request" ? "Feature" : "Bug"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button
                className="ml-auto uppercase font-semibold rounded-none bg-accent text-accent-foreground hover:opacity-90 border-2 border-accent"
                onClick={() => setSubmitOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden />
                Submit new
              </Button>
            </div>

            {successMessage && (
              <p className="text-sm text-green-600 dark:text-green-400 mb-4" role="status">
                {successMessage}
              </p>
            )}

            {/* Feed cards */}
            {filteredAndSorted.length === 0 ? (
              <Card className="border-2 border-accent/40">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p className="uppercase font-semibold mb-2">No feedback yet</p>
                  <p className="text-sm mb-4">
                    Be the first to submit a feature request or bug report.
                  </p>
                  <Button
                    variant="outline"
                    className="uppercase font-semibold rounded-none border-accent"
                    onClick={() => setSubmitOpen(true)}
                  >
                    Submit feedback
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-4" aria-label="Feedback list">
                {filteredAndSorted.map((item) => (
                    <li key={item._id}>
                    <Link to={`/feedback/${item._id}`} className="block">
                      <Card className="border-2 border-accent/40 hover:border-accent/70 transition-colors">
                        <CardContent className="p-4 flex gap-4">
                          <div className="flex-1 min-w-0">
                            <span
                              className={`inline-block text-xs font-semibold uppercase px-2 py-0.5 rounded border mb-2 ${STATUS_CLASSES[item.status] ?? "bg-muted"}`}
                            >
                              {STATUS_LABELS[item.status] ?? item.status}
                            </span>
                            <h2 className="font-bold text-foreground text-lg mb-1">
                              {item.title}
                            </h2>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {truncate(item.description)}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {item.board === "bug_report" ? (
                                  <Bug className="w-3.5 h-3.5" aria-hidden />
                                ) : (
                                  <Lightbulb className="w-3.5 h-3.5" aria-hidden />
                                )}
                                {item.board === "feature_request"
                                  ? "Feature Request"
                                  : "Bug Report"}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" aria-hidden />
                                {item.commentCount}
                              </span>
                            </div>
                          </div>
                          <div
                            className="flex flex-col items-center justify-center shrink-0 gap-0"
                            onClick={(e) => e.preventDefault()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                voteMutation({
                                  feedbackId: item._id,
                                  value: item.myVote === 1 ? 0 : 1,
                                });
                              }}
                              className="p-1 rounded hover:bg-accent/20"
                              aria-label={item.myVote === 1 ? "Remove upvote" : "Upvote"}
                            >
                              <ChevronUp
                                className={`w-5 h-5 ${item.myVote === 1 ? "text-primary fill-primary" : "text-muted-foreground"}`}
                              />
                            </button>
                            <span className="text-sm font-semibold tabular-nums">
                              {item.voteScore}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                voteMutation({
                                  feedbackId: item._id,
                                  value: item.myVote === -1 ? 0 : -1,
                                });
                              }}
                              className="p-1 rounded hover:bg-accent/20"
                              aria-label={item.myVote === -1 ? "Remove downvote" : "Downvote"}
                            >
                              <ChevronDown
                                className={`w-5 h-5 ${item.myVote === -1 ? "text-destructive fill-destructive" : "text-muted-foreground"}`}
                              />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            <Card className="border-2 border-accent/40">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">
                  Your posts
                </h3>
                {myFeedback && myFeedback.length > 0 ? (
                  <>
                    <ul className="space-y-2 mb-3">
                      {myFeedback.slice(0, 5).map((f) => (
                        <li key={f._id}>
                          <Link
                            to={`/feedback/${f._id}`}
                            className="text-sm text-primary hover:underline block truncate"
                          >
                            {f.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setOnlyMyPosts((o) => !o)}
                      className="text-xs font-semibold uppercase text-primary hover:underline"
                    >
                      {onlyMyPosts ? "Show all" : "View all your activity"}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No posts yet.</p>
                )}
              </CardContent>
            </Card>
            <Card className="border-2 border-accent/40">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">
                  Boards
                </h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setBoardFilter("all")}
                    className={`block w-full text-left text-sm px-3 py-2 rounded border ${
                      boardFilter === "all"
                        ? "bg-accent/20 border-accent"
                        : "border-transparent hover:bg-muted"
                    }`}
                  >
                    View all posts
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoardFilter("feature_request")}
                    className={`block w-full text-left text-sm px-3 py-2 rounded border flex items-center gap-2 ${
                      boardFilter === "feature_request"
                        ? "bg-accent/20 border-accent"
                        : "border-transparent hover:bg-muted"
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" aria-hidden />
                    Feature Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoardFilter("bug_report")}
                    className={`block w-full text-left text-sm px-3 py-2 rounded border flex items-center gap-2 ${
                      boardFilter === "bug_report"
                        ? "bg-accent/20 border-accent"
                        : "border-transparent hover:bg-muted"
                    }`}
                  >
                    <Bug className="w-4 h-4" aria-hidden />
                    Bug Reports
                  </button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Submit modal */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="border-2 border-accent rounded-none max-w-lg">
          <DialogHeader>
            <DialogTitle className="uppercase">Submit feedback</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitHandler}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="feedback-title" className="uppercase text-xs font-semibold">
                  Title
                </Label>
                <Input
                  id="feedback-title"
                  value={submitTitle}
                  onChange={(e) => setSubmitTitle(e.target.value)}
                  placeholder="Short summary"
                  required
                  className="mt-1 border-2 border-accent rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="feedback-description" className="uppercase text-xs font-semibold">
                  Description
                </Label>
                <textarea
                  id="feedback-description"
                  value={submitDescription}
                  onChange={(e) => setSubmitDescription(e.target.value)}
                  placeholder="Full description…"
                  required
                  rows={4}
                  className="mt-1 w-full rounded border-2 border-accent bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <Label className="uppercase text-xs font-semibold block mb-2">Board</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmitBoard("feature_request")}
                    className={`flex items-center gap-2 px-4 py-2 rounded border-2 text-sm font-semibold ${
                      submitBoard === "feature_request"
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-muted-foreground/40 hover:bg-muted"
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" aria-hidden />
                    Feature Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmitBoard("bug_report")}
                    className={`flex items-center gap-2 px-4 py-2 rounded border-2 text-sm font-semibold ${
                      submitBoard === "bug_report"
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-muted-foreground/40 hover:bg-muted"
                    }`}
                  >
                    <Bug className="w-4 h-4" aria-hidden />
                    Bug Report
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmitOpen(false)}
                className="uppercase font-semibold rounded-none border-accent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !submitTitle.trim() || !submitDescription.trim()}
                className="uppercase font-semibold rounded-none bg-accent text-accent-foreground"
              >
                {submitting ? "Submitting…" : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

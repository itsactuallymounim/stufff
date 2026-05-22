import { Note } from "@/types/note";
import { Trash2, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAISearch } from "@/hooks/useAISearch";
import ReactMarkdown from "react-markdown";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onClick?: (note: Note) => void;
}

const sizeClasses = {
  small: "col-span-1 row-span-1",
  medium: "col-span-1 row-span-2 sm:col-span-2 sm:row-span-1",
  large: "col-span-1 row-span-2 sm:col-span-2 sm:row-span-2",
};

const NoteCard = ({ note, onDelete, onClick }: NoteCardProps) => {
  const [showSummary, setShowSummary] = useState(false);
  const { summarize, result, isLoading, error, clearResult } = useAISearch();

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSummary(true);
    const context = `Title: ${note.title}\nContent: ${note.content}`;
    await summarize("Summarize this note concisely.", context);
  };

  const handleCloseSummary = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSummary(false);
    clearResult();
  };

  return (
    <div
      onClick={() => onClick?.(note)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(note);
        }
      }}
      className={`
        ${sizeClasses[note.size]}
        group relative p-5 rounded-2xl
        cursor-pointer overflow-hidden
        card-shimmer glass-depth card-float
        animate-scale-in
      `}
      style={{ backgroundColor: note.color }}
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <button
          onClick={handleSummarize}
          disabled={isLoading}
          aria-label="Summarize with AI"
          className="p-2 rounded-full bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          aria-label="Delete note"
          className="p-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Note content */}
      <div className="h-full flex flex-col">
        <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">
          {note.title}
        </h3>
        <p className="text-muted-foreground text-sm flex-1 line-clamp-6 whitespace-pre-wrap">
          {note.content}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-3">
          {note.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Refined glass overlay */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-white/5" />

      {/* AI Summary panel */}
      {showSummary && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 rounded-2xl bg-card/95 backdrop-blur-lg border border-border p-4 overflow-y-auto animate-fade-up z-20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-accent text-xs font-medium">
              <Sparkles className="w-3 h-3" /> AI Summary
            </div>
            <button
              onClick={handleCloseSummary}
              className="text-xs text-muted-foreground hover:text-foreground"
              aria-label="Close summary"
            >
              Close
            </button>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" /> Summarizing…
            </div>
          ) : error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
              <ReactMarkdown>{result || ""}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteCard;

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Sparkles, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAISearch } from "@/hooks/useAISearch";
import ReactMarkdown from "react-markdown";

interface AISearchBarProps {
  notesContext?: string;
}

const AISearchBar = ({ notesContext }: AISearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, summarize, result, isLoading, error, clearResult } = useAISearch();

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isLoading) return;
    await search(query, notesContext);
  }, [query, search, notesContext, isLoading]);

  const handleSummarize = useCallback(async () => {
    if (!query.trim() || isLoading || !notesContext) return;
    await summarize(query, notesContext);
  }, [query, summarize, notesContext, isLoading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      } else if (e.key === "Escape") {
        setIsExpanded(false);
        clearResult();
      }
    },
    [handleSearch, clearResult]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    clearResult();
    inputRef.current?.focus();
  }, [clearResult]);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    setQuery("");
    clearResult();
  }, [clearResult]);

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsExpanded(true)}
        className="rounded-full hover:bg-accent/10 transition-all duration-300"
        aria-label="Open AI search"
      >
        <Sparkles className="h-5 w-5 text-accent" />
      </Button>
    );
  }

  return (
    <div className="animate-scale-in w-full max-w-md">
      <div className="relative">
        {/* Search input container */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-card/80 backdrop-blur-lg border border-border shadow-soft">
          <div className="flex-1 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground ml-2" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI anything..."
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              maxLength={500}
              aria-label="AI search query"
              disabled={isLoading}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-6 w-6 rounded-full"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
              className="rounded-xl text-xs px-3 hover:bg-accent/10 hover:text-accent"
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Search"}
            </Button>
            {notesContext && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSummarize}
                disabled={!query.trim() || isLoading}
                className="rounded-xl text-xs px-3 hover:bg-accent/10 hover:text-accent"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Summarize
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results panel */}
        {(result || error) && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-card/95 backdrop-blur-lg border border-border shadow-lg max-h-80 overflow-y-auto animate-fade-up z-50">
            {error ? (
              <p className="text-destructive text-sm">{error}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{result || ""}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISearchBar;

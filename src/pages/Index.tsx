import { useState } from "react";
import IOSPillButton from "@/components/IOSPillButton";
import BentoGrid from "@/components/BentoGrid";
import CreateNoteDialog from "@/components/CreateNoteDialog";
import { Note, noteColors } from "@/types/note";

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddNote = () => {
    setIsDialogOpen(true);
  };

  const handleCreateNote = (noteData: Omit<Note, "id" | "createdAt">) => {
    const newNote: Note = {
      ...noteData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const hasNotes = notes.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm text-muted-foreground">iOS 26</span>
              <h1 className="text-3xl font-semibold text-foreground">Notes</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          {!hasNotes ? (
            /* Hero section when no notes */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div
                className="mb-8 px-4 py-2 rounded-full glass text-sm font-medium text-muted-foreground animate-scale-in"
                style={{ animationDelay: "0.1s" }}
              >
                iOS 26 • Notes Reimagined
              </div>

              <h2
                className="text-5xl sm:text-7xl font-semibold tracking-tight text-foreground mb-6 opacity-0 animate-fade-up"
                style={{ animationDelay: "0.2s" }}
              >
                Capture
                <span className="block text-gradient">everything.</span>
              </h2>

              <p
                className="text-lg sm:text-xl text-muted-foreground max-w-md mb-8 opacity-0 animate-fade-up"
                style={{ animationDelay: "0.4s" }}
              >
                A beautifully minimal note-taking experience designed for the
                way you think.
              </p>

              <p
                className="text-sm text-muted-foreground/60 opacity-0 animate-fade-up"
                style={{ animationDelay: "0.6s" }}
              >
                Tap + to create your first note
              </p>
            </div>
          ) : (
            /* Bento grid when notes exist */
            <BentoGrid notes={notes} onDeleteNote={handleDeleteNote} />
          )}
        </div>
      </main>

      {/* Floating pill button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <IOSPillButton onAddClick={handleAddNote} />
      </div>

      {/* Create note dialog */}
      <CreateNoteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateNote={handleCreateNote}
      />

      {/* Bottom safe area indicator (iOS style) */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-foreground/20 z-40" />
    </div>
  );
};

export default Index;

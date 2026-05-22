import { Note } from "@/types/note";
import NoteCard from "./NoteCard";
import { FileText } from "lucide-react";

interface BentoGridProps {
  notes: Note[];
  onDeleteNote: (id: string) => void;
  onEditNote?: (note: Note) => void;
}

const BentoGrid = ({ notes, onDeleteNote, onEditNote }: BentoGridProps) => {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No notes yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Tap the + button to create your first note and start organizing your thoughts.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)]">
      {notes.map((note, index) => (
        <div
          key={note.id}
          className="animate-scale-in"
          style={{ animationDelay: `${index * 0.06}s`, animationFillMode: "both" }}
        >
          <NoteCard note={note} onDelete={onDeleteNote} onClick={onEditNote} />
        </div>
      ))}
    </div>
  );
};

export default BentoGrid;

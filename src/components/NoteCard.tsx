import { Note } from "@/types/note";
import { Trash2 } from "lucide-react";

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
}

const sizeClasses = {
  small: "col-span-1 row-span-1",
  medium: "col-span-1 row-span-2 sm:col-span-2 sm:row-span-1",
  large: "col-span-1 row-span-2 sm:col-span-2 sm:row-span-2",
};

const NoteCard = ({ note, onDelete }: NoteCardProps) => {
  return (
    <div
      className={`
        ${sizeClasses[note.size]}
        group relative p-5 rounded-2xl shadow-soft
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-lg
        animate-scale-in cursor-pointer
      `}
      style={{ backgroundColor: note.color }}
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        className="absolute top-3 right-3 p-2 rounded-full bg-destructive/10 text-destructive 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   hover:bg-destructive/20"
      >
        <Trash2 className="w-4 h-4" />
      </button>

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

      {/* Subtle glass overlay */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-white/20 to-transparent" />
    </div>
  );
};

export default NoteCard;

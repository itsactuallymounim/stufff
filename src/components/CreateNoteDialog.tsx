import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Note, noteColors } from "@/types/note";
import { Check } from "lucide-react";

interface CreateNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNote: (note: Omit<Note, "id" | "createdAt">) => void;
}

const CreateNoteDialog = ({
  open,
  onOpenChange,
  onCreateNote,
}: CreateNoteDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState(noteColors[0].value);
  const [size, setSize] = useState<Note["size"]>("small");

  const handleSubmit = () => {
    if (!title.trim()) return;

    onCreateNote({
      title: title.trim(),
      content: content.trim(),
      color,
      size,
    });

    // Reset form
    setTitle("");
    setContent("");
    setColor(noteColors[0].value);
    setSize("small");
    onOpenChange(false);
  };

  const sizes: { label: string; value: Note["size"] }[] = [
    { label: "S", value: "small" },
    { label: "M", value: "medium" },
    { label: "L", value: "large" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-0 shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Title */}
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 bg-secondary/50 focus-visible:ring-accent text-lg font-medium"
          />

          {/* Content */}
          <Textarea
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-0 bg-secondary/50 focus-visible:ring-accent min-h-[120px] resize-none"
          />

          {/* Color picker */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Color</p>
            <div className="flex gap-2">
              {noteColors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.value)}
                  className={`
                    w-8 h-8 rounded-full transition-all duration-200
                    flex items-center justify-center
                    ${color === c.value ? "ring-2 ring-accent ring-offset-2" : "hover:scale-110"}
                  `}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && (
                    <Check className="w-4 h-4 text-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size picker */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Size</p>
            <div className="flex gap-2">
              {sizes.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSize(s.value)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      size === s.value
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }
                  `}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Create Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteDialog;

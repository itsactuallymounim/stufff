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
import { Check, AlertCircle } from "lucide-react";
import { validateNoteInput } from "@/lib/validation";
import { toast } from "sonner";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearErrors = () => setErrors({});

  const handleSubmit = () => {
    clearErrors();

    // Validate all inputs using OWASP-compliant validation
    const validation = validateNoteInput({
      title,
      content,
      color,
      size,
    });

    if (validation.success === false) {
      toast.error(validation.error);
      // Try to determine which field the error is for
      if (validation.error.toLowerCase().includes("title")) {
        setErrors({ title: validation.error });
      } else if (validation.error.toLowerCase().includes("content")) {
        setErrors({ content: validation.error });
      } else if (validation.error.toLowerCase().includes("color")) {
        setErrors({ color: validation.error });
      } else if (validation.error.toLowerCase().includes("size")) {
        setErrors({ size: validation.error });
      }
      return;
    }

    // Use the sanitized data from validation
    onCreateNote({
      title: validation.data.title,
      content: validation.data.content,
      color: validation.data.color,
      size: validation.data.size,
    });

    // Reset form
    setTitle("");
    setContent("");
    setColor(noteColors[0].value);
    setSize("small");
    clearErrors();
    onOpenChange(false);
  };

  const sizes: { label: string; value: Note["size"] }[] = [
    { label: "S", value: "small" },
    { label: "M", value: "medium" },
    { label: "L", value: "large" },
  ];

  // Character count helpers
  const titleMaxLength = 200;
  const contentMaxLength = 10000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-0 shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) clearErrors();
              }}
              maxLength={titleMaxLength}
              className={`border-0 bg-secondary/50 focus-visible:ring-accent text-lg font-medium ${
                errors.title ? "ring-2 ring-destructive" : ""
              }`}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            <div className="flex justify-between items-center text-xs">
              {errors.title ? (
                <span id="title-error" className="text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </span>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground">
                {title.length}/{titleMaxLength}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1">
            <Textarea
              placeholder="Write your thoughts..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) clearErrors();
              }}
              maxLength={contentMaxLength}
              className={`border-0 bg-secondary/50 focus-visible:ring-accent min-h-[120px] resize-none ${
                errors.content ? "ring-2 ring-destructive" : ""
              }`}
              aria-invalid={!!errors.content}
              aria-describedby={errors.content ? "content-error" : undefined}
            />
            <div className="flex justify-between items-center text-xs">
              {errors.content ? (
                <span id="content-error" className="text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.content}
                </span>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground">
                {content.length}/{contentMaxLength}
              </span>
            </div>
          </div>

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
                  type="button"
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
                  type="button"
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
            type="button"
          >
            Create Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteDialog;

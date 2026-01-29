import IOSPillButton from "@/components/IOSPillButton";
import { toast } from "sonner";

const Index = () => {
  const handleAddNote = () => {
    toast.success("Create a new note", {
      description: "Ready to capture your thoughts",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        {/* App badge */}
        <div 
          className="mb-8 px-4 py-2 rounded-full glass text-sm font-medium text-muted-foreground animate-scale-in"
          style={{ animationDelay: "0.1s" }}
        >
          iOS 26 • Notes Reimagined
        </div>

        {/* Hero Title */}
        <h1 
          className="text-5xl sm:text-7xl font-semibold tracking-tight text-foreground mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Capture
          <span className="block text-gradient">everything.</span>
        </h1>

        {/* Subtitle */}
        <p 
          className="text-lg sm:text-xl text-muted-foreground max-w-md mb-16 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          A beautifully minimal note-taking experience designed for the way you think.
        </p>

        {/* iOS Pill Button */}
        <div 
          className="opacity-0 animate-scale-in"
          style={{ animationDelay: "0.6s" }}
        >
          <IOSPillButton onAddClick={handleAddNote} />
        </div>

        {/* Hint text */}
        <p 
          className="mt-8 text-sm text-muted-foreground/60 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.8s" }}
        >
          Tap + to create your first note
        </p>
      </div>

      {/* Bottom safe area indicator (iOS style) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-foreground/20" />
    </div>
  );
};

export default Index;

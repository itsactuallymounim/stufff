import { Plus } from "lucide-react";
import { useState } from "react";

interface IOSPillButtonProps {
  onAddClick?: () => void;
  profileImage?: string;
}

const IOSPillButton = ({ onAddClick, profileImage }: IOSPillButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-flex items-center gap-2 p-2 rounded-pill bg-primary shadow-soft animate-float"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Add Button */}
      <button
        onClick={onAddClick}
        className={`
          relative w-14 h-14 rounded-full bg-accent flex items-center justify-center
          transition-all duration-300 ease-out
          hover:scale-110 active:scale-95
        `}
      >
        <Plus 
          className={`
            w-7 h-7 text-accent-foreground
            transition-transform duration-300 ease-out
            ${isHovered ? "rotate-90" : "rotate-0"}
          `}
          strokeWidth={2.5}
        />
      </button>

      {/* Subtle inner glow effect */}
      <div className="absolute inset-0 rounded-pill pointer-events-none bg-gradient-to-t from-transparent via-transparent to-white/5" />
    </div>
  );
};

export default IOSPillButton;

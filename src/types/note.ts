export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: Date;
  size: "small" | "medium" | "large";
}

export const noteColors = [
  { name: "Default", value: "hsl(var(--card))" },
  { name: "Mint", value: "hsl(160 60% 95%)" },
  { name: "Lavender", value: "hsl(270 60% 95%)" },
  { name: "Peach", value: "hsl(20 80% 95%)" },
  { name: "Sky", value: "hsl(200 80% 95%)" },
  { name: "Lemon", value: "hsl(50 80% 95%)" },
];

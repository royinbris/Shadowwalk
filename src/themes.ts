export interface Theme {
  id: string;
  name: string;
  colors: string[]; // For displaying the palette in the UI
  styles: Record<string, string>; // CSS variables mapping
}

function generateStyles(c1: string, c2: string, c3: string, c4: string, c5: string): Record<string, string> {
  return {
    "--color-black": c1,
    "--color-zinc-950": c1,
    "--color-zinc-900": c2,
    "--color-zinc-800": c3,
    "--color-zinc-700": c3,
    "--color-zinc-600": c4,
    "--color-zinc-500": c4,
    "--color-yellow-500": c4,
    "--color-yellow-400": c5,
    "--color-cyan-500": c4,
    "--color-orange-500": c5,
    // Tints for text to ensure readability
    "--color-zinc-400": c5,
    "--color-zinc-300": "#e4e4e7",
    "--color-zinc-200": "#f4f4f5",
    "--color-white": "#ffffff",
  };
}

export const THEMES: Theme[] = [
  {
    id: "warm",
    name: "Warm",
    colors: ["#1C0B0C", "#331214", "#8B3035", "#F8A03D", "#FFD17B"],
    styles: generateStyles("#1C0B0C", "#331214", "#8B3035", "#F8A03D", "#FFD17B")
  },
  {
    id: "cool",
    name: "Cool",
    colors: ["#0B131A", "#142533", "#4A82B0", "#83A6C0", "#CFDBE9"],
    styles: generateStyles("#0B131A", "#142533", "#4A82B0", "#83A6C0", "#CFDBE9")
  },
  {
    id: "soft",
    name: "Soft",
    colors: ["#1C1614", "#302623", "#A67B6B", "#C89D8E", "#F2E4DD"],
    styles: generateStyles("#1C1614", "#302623", "#A67B6B", "#C89D8E", "#F2E4DD")
  },
  {
    id: "powerful",
    name: "Powerful",
    colors: ["#0A0B0C", "#141516", "#10398C", "#46954D", "#FFE900"],
    styles: generateStyles("#0A0B0C", "#141516", "#10398C", "#46954D", "#FFE900")
  },
  {
    id: "modern",
    name: "Modern",
    colors: ["#0E0E0E", "#1A1A1A", "#4D4D4D", "#E09B5F", "#FBFBFD"],
    styles: generateStyles("#0E0E0E", "#1A1A1A", "#4D4D4D", "#E09B5F", "#FBFBFD")
  },
  {
    id: "futuristic",
    name: "Futuristic",
    colors: ["#090912", "#121226", "#6A1AF4", "#476DEF", "#13C9B1"],
    styles: generateStyles("#090912", "#121226", "#6A1AF4", "#476DEF", "#13C9B1")
  },
  {
    id: "popular",
    name: "Popular",
    colors: ["#071810", "#0D2C1E", "#3A6E3E", "#8FCC65", "#FFF251"],
    styles: generateStyles("#071810", "#0D2C1E", "#3A6E3E", "#8FCC65", "#FFF251")
  },
  {
    id: "romantic",
    name: "Romantic",
    colors: ["#1F111A", "#331C2A", "#A47DA1", "#E591AE", "#F5E2CA"],
    styles: generateStyles("#1F111A", "#331C2A", "#A47DA1", "#E591AE", "#F5E2CA")
  },
  {
    id: "natural",
    name: "Natural",
    colors: ["#101510", "#1E2A1C", "#577160", "#9CB6A8", "#DCE0C3"],
    styles: generateStyles("#101510", "#1E2A1C", "#577160", "#9CB6A8", "#DCE0C3")
  },
  {
    id: "exclusive",
    name: "Exclusive",
    colors: ["#16131F", "#2A2536", "#51394C", "#92181F", "#D89467"],
    styles: generateStyles("#16131F", "#2A2536", "#51394C", "#92181F", "#D89467")
  },
  {
    id: "traditional",
    name: "Traditional",
    colors: ["#141414", "#292929", "#455A9E", "#BA3C3A", "#DF9448"],
    styles: generateStyles("#141414", "#292929", "#455A9E", "#BA3C3A", "#DF9448")
  },
  {
    id: "dark",
    name: "Dark",
    colors: ["#131418", "#1E2128", "#2A4150", "#45405D", "#7B6966"],
    styles: generateStyles("#131418", "#1E2128", "#2A4150", "#45405D", "#7B6966")
  }
];

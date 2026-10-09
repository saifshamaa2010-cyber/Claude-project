import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const COLORS = {
  bg: "#040607",
  doom: "#39e58c",
  doomDeep: "#0b3d24",
  steel: "#9aa7b0",
  text: "#f2f5f3",
  dim: "#8c979c",
  danger: "#ff4d4d",
};

export const FONTS = {
  display: "Bebas Neue",
  label: "Oswald",
  body: "Inter",
};

const fonts: Array<[string, string, string, string?]> = [
  [FONTS.display, "fonts/BebasNeue.woff2", "400"],
  [FONTS.label, "fonts/Oswald-500.woff2", "500"],
  [FONTS.label, "fonts/Oswald-700.woff2", "700"],
  [FONTS.body, "fonts/Inter-400.woff2", "400"],
  [FONTS.body, "fonts/Inter-600.woff2", "600"],
  [FONTS.body, "fonts/Inter-800.woff2", "800"],
  [FONTS.body, "fonts/Inter-400-italic.woff2", "400", "italic"],
  [FONTS.body, "fonts/Inter-600-italic.woff2", "600", "italic"],
];

for (const [family, file, weight, style] of fonts) {
  loadFont({ family, url: staticFile(file), weight, style: style ?? "normal" });
}

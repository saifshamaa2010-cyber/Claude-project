import React from "react";
import { FONTS } from "../theme";

export type EmblemKind =
  | "mask"
  | "bolt"
  | "star"
  | "wings"
  | "asterisk"
  | "four"
  | "claw"
  | "tree"
  | "rings"
  | "ant"
  | "x"
  | "web";

/** Original line-art emblems drawn for this video (no studio artwork). */
export const Emblem: React.FC<{ kind: EmblemKind; color: string; size: number; strokeWidth?: number; spin?: number }> = ({
  kind,
  color,
  size,
  strokeWidth = 5,
  spin = 0,
}) => {
  const common = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const soft = { ...common, strokeWidth: strokeWidth * 0.5, opacity: 0.55 };

  const body = (() => {
    switch (kind) {
      case "mask":
        return (
          <>
            <path {...soft} d="M22 190 C 18 90, 50 22, 100 16 C 150 22, 182 90, 178 190" />
            <path {...common} d="M58 50 Q100 36 142 50 L146 120 Q140 158 100 170 Q60 158 54 120 Z" />
            <path {...common} d="M68 92 L92 96 M108 96 L132 92" strokeWidth={strokeWidth * 1.6} />
            <path {...common} d="M100 72 L100 128" />
            <path {...soft} d="M82 136 L118 136 M84 146 L116 146 M88 156 L112 156" />
            <circle cx={66} cy={66} r={3} fill={color} />
            <circle cx={134} cy={66} r={3} fill={color} />
            <circle cx={62} cy={118} r={3} fill={color} />
            <circle cx={138} cy={118} r={3} fill={color} />
          </>
        );
      case "bolt":
        return (
          <>
            <circle {...soft} cx={100} cy={100} r={86} />
            <path {...common} d="M112 22 L62 108 L96 108 L82 178 L140 86 L104 86 Z" />
          </>
        );
      case "star":
        return (
          <>
            <circle {...common} cx={100} cy={100} r={86} />
            <circle {...soft} cx={100} cy={100} r={66} />
            <circle {...common} cx={100} cy={100} r={46} />
            <path {...common} d={starPath(100, 100, 40, 16)} />
          </>
        );
      case "wings":
        return (
          <>
            <path {...common} d={starPath(100, 92, 26, 10)} />
            <path {...common} d="M84 104 C 60 120, 34 116, 12 96 C 36 100, 52 96, 66 86 M80 118 C 58 136, 38 136, 22 124" />
            <path {...common} d="M116 104 C 140 120, 166 116, 188 96 C 164 100, 148 96, 134 86 M120 118 C 142 136, 162 136, 178 124" />
            <path {...soft} d="M100 124 L100 176" />
          </>
        );
      case "asterisk":
        return (
          <>
            <circle {...soft} cx={100} cy={100} r={86} />
            <path {...common} d="M100 34 L100 166 M43 67 L157 133 M43 133 L157 67" strokeWidth={strokeWidth * 2.2} />
          </>
        );
      case "four":
        return (
          <>
            <circle {...common} cx={100} cy={100} r={84} />
            <circle {...soft} cx={100} cy={100} r={70} />
            <text x={100} y={136} textAnchor="middle" fontFamily={FONTS.display} fontSize={112} fill={color}>
              4
            </text>
          </>
        );
      case "claw":
        return (
          <>
            <circle {...soft} cx={100} cy={100} r={86} />
            <path {...common} d="M58 40 Q 80 100 62 162 M96 30 Q 120 98 100 170 M134 40 Q 158 100 140 162" strokeWidth={strokeWidth * 1.4} />
          </>
        );
      case "tree":
        return (
          <>
            <circle {...soft} cx={100} cy={100} r={86} />
            <path {...common} d="M100 176 L100 70 M100 120 Q 70 100 54 66 M100 120 Q 130 100 146 66 M100 92 Q 80 70 78 40 M100 92 Q 120 70 122 40 M54 66 Q 40 56 34 40 M146 66 Q 160 56 166 40 M100 70 L100 26" />
            <path {...soft} d="M100 176 Q 80 186 62 182 M100 176 Q 120 186 138 182" />
          </>
        );
      case "rings":
        return (
          <>
            {new Array(10).fill(0).map((_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return <circle key={i} {...common} cx={100 + Math.cos(a) * 62} cy={100 + Math.sin(a) * 62} r={16} />;
            })}
            <circle {...soft} cx={100} cy={100} r={30} />
          </>
        );
      case "ant":
        return (
          <>
            <circle {...common} cx={100} cy={100} r={84} />
            <circle {...soft} cx={100} cy={100} r={56} />
            <circle {...common} cx={100} cy={100} r={30} />
            <circle cx={100} cy={100} r={8} fill={color} />
            <path {...soft} d="M100 6 L100 40 M100 160 L100 194 M6 100 L40 100 M160 100 L194 100" />
          </>
        );
      case "x":
        return (
          <>
            <circle {...common} cx={100} cy={100} r={84} />
            <path {...common} d="M54 42 L146 158 M146 42 L54 158" strokeWidth={strokeWidth * 2.4} />
          </>
        );
      case "web":
        return (
          <>
            {new Array(8).fill(0).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <path key={i} {...common} d={`M100 100 L${100 + Math.cos(a) * 90} ${100 + Math.sin(a) * 90}`} />;
            })}
            {[28, 52, 76].map((r) => (
              <path key={r} {...soft} d={polygon(100, 100, r, 8)} />
            ))}
          </>
        );
      default:
        return null;
    }
  })();

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: "visible", rotate: `${spin}deg` }}>
      {body}
    </svg>
  );
};

function starPath(cx: number, cy: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`);
  }
  return `M${pts.join(" L")} Z`;
}

function polygon(cx: number, cy: number, r: number, n: number) {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(`${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`);
  }
  return `M${pts.join(" L")} Z`;
}

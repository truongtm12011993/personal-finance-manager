declare module "remotion" {
  import type { CSSProperties, ReactNode } from "react";

  export type SpringConfig = {
    frame: number;
    fps: number;
    config?: {
      damping?: number;
      stiffness?: number;
      mass?: number;
    };
    delay?: number;
    durationInFrames?: number;
  };

  export type InterpolateOptions = {
    extrapolateLeft?: "clamp" | "extend" | "identity";
    extrapolateRight?: "clamp" | "extend" | "identity";
  };

  export const AbsoluteFill: (props: { children?: ReactNode; style?: CSSProperties }) => JSX.Element;
  export function spring(config: SpringConfig): number;
  export function useCurrentFrame(): number;
  export function useVideoConfig(): { fps: number; width: number; height: number; durationInFrames: number };
  export function interpolate(
    input: number,
    inputRange: number[],
    outputRange: number[],
    options?: InterpolateOptions
  ): number;
}

declare module "@remotion/google-fonts/Inter" {
  export function loadFont(): { fontFamily: string };
}

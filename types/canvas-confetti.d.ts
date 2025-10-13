declare module 'canvas-confetti' {
  export interface ConfettiOrigin {
    x?: number;
    y?: number;
  }

  export type ConfettiShape = 'square' | 'circle' | 'star' | 'triangle';

  export interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
    shapes?: ConfettiShape[];
    colors?: string[];
    origin?: ConfettiOrigin;
    resize?: boolean;
    useWorker?: boolean;
  }

  export interface CreateOptions {
    resize?: boolean;
    useWorker?: boolean;
  }

  export type ConfettiFunction = (options?: ConfettiOptions) => Promise<null>;

  export interface ConfettiExport extends ConfettiFunction {
    reset: () => void;
    create: (canvas: HTMLCanvasElement, options?: CreateOptions) => ConfettiFunction;
  }

  const confetti: ConfettiExport;
  export default confetti;
}


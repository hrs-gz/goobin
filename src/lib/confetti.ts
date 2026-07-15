import confetti from "canvas-confetti";

/** A single celebratory burst for completing a new bingo line. */
export function celebrateLine(colors: string[]): void {
  confetti({
    particleCount: 90,
    spread: 72,
    startVelocity: 42,
    origin: { y: 0.62 },
    colors,
    disableForReducedMotion: true,
  });
}

/** A bigger, sustained multi-burst for a full blackout. */
export function celebrateBlackout(colors: string[]): void {
  confetti({
    particleCount: 170,
    spread: 110,
    startVelocity: 48,
    origin: { y: 0.5 },
    colors,
    disableForReducedMotion: true,
  });

  const end = Date.now() + 900;
  const frame = () => {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 78,
      origin: { x: 0, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 78,
      origin: { x: 1, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

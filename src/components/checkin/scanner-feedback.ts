"use client";

export type ScannerFeedbackType =
  | "success"
  | "duplicate"
  | "error";

function vibrate(
  pattern: number[]
) {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function"
  ) {
    return;
  }

  navigator.vibrate(
    pattern
  );
}

function tone(
  frequency: number,
  duration: number,
  delay = 0
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const AudioContextClass =
    window.AudioContext ??
    (
      window as typeof window & {
        webkitAudioContext?:
          typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  try {
    const context =
      new AudioContextClass();

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.type =
      "sine";

    oscillator.frequency.value =
      frequency;

    gain.gain.value =
      0.0001;

    oscillator.connect(
      gain
    );

    gain.connect(
      context.destination
    );

    const start =
      context.currentTime +
      delay;

    const end =
      start +
      duration;

    gain.gain.exponentialRampToValueAtTime(
      0.14,
      start + 0.015
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      end
    );

    oscillator.start(
      start
    );

    oscillator.stop(
      end + 0.02
    );

    oscillator.addEventListener(
      "ended",
      () => {
        void context.close();
      },
      {
        once: true,
      }
    );
  } catch {
    // Audio is optional.
  }
}

export function triggerScannerFeedback(
  type: ScannerFeedbackType,
  soundEnabled: boolean
) {
  if (type === "success") {
    vibrate([
      70,
      45,
      110,
    ]);

    if (soundEnabled) {
      tone(
        620,
        0.12
      );

      tone(
        880,
        0.18,
        0.12
      );
    }

    return;
  }

  if (type === "duplicate") {
    vibrate([
      90,
      60,
      90,
    ]);

    if (soundEnabled) {
      tone(
        520,
        0.14
      );

      tone(
        520,
        0.14,
        0.18
      );
    }

    return;
  }

  vibrate([
    180,
    80,
    180,
  ]);

  if (soundEnabled) {
    tone(
      230,
      0.22
    );
  }
}

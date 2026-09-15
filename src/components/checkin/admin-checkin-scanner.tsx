"use client";

import {
  Camera,
  CheckCircle2,
  Keyboard,
  LoaderCircle,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  TriangleAlert,
  UserCheck,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  triggerScannerFeedback,
} from "@/components/checkin/scanner-feedback";

type Attendee = {
  id: string;
  name: string;
  registrationRef:
    string | null;
  country: string;
  countryCode:
    string | null;
  partySize: number;
  checkedIn?: boolean;
  checkedInAt:
    string | null;
};

type ScannerState =
  | {
      status: "idle";
    }
  | {
      status: "resolving";
    }
  | {
      status: "resolved";
      payload: string;
      attendee: Attendee;
    }
  | {
      status: "success";
      attendee: Attendee;
      alreadyCheckedIn:
        boolean;
    }
  | {
      status: "error";
      message: string;
    };

function flag(
  countryCode:
    | string
    | null
) {
  if (
    !countryCode ||
    !/^[A-Z]{2}$/i.test(
      countryCode
    )
  ) {
    return "🌐";
  }

  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split("")
      .map(
        (character) =>
          127397 +
          character.charCodeAt(
            0
          )
      )
  );
}

export function AdminCheckInScanner() {
  const scannerRef =
    useRef<{
      stop:
        () =>
          Promise<void>;
      clear:
        () =>
          void;
    } | null>(null);

  const lockedRef =
    useRef(false);

  const [
    scannerState,
    setScannerState,
  ] = useState<ScannerState>({
    status:
      "idle",
  });

  const [
    manualPayload,
    setManualPayload,
  ] = useState("");

  const [
    soundEnabled,
    setSoundEnabled,
  ] = useState(true);

  const [
    cameraState,
    setCameraState,
  ] = useState<
    | "starting"
    | "active"
    | "unavailable"
  >("starting");

  const stopScanner =
    useCallback(
      async () => {
        const current =
          scannerRef.current;

        scannerRef.current =
          null;

        if (!current) {
          return;
        }

        try {
          await current.stop();
        } catch {
          // Scanner may already
          // have stopped.
        }

        try {
          current.clear();
        } catch {
          // DOM may already
          // have unmounted.
        }
      },
      []
    );

  const resolvePayload =
    useCallback(
      async (
        payload: string
      ) => {
        if (
          lockedRef.current
        ) {
          return;
        }

        lockedRef.current =
          true;

        setScannerState({
          status:
            "resolving",
        });

        try {
          const response =
            await fetch(
              "/api/admin/checkin/resolve",
              {
                method:
                  "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body:
                  JSON.stringify({
                    payload,
                  }),
              }
            );

          const result =
            (await response.json()) as {
              ok?: boolean;
              error?: string;
              attendee?: Attendee;
            };

          if (
            !response.ok ||
            !result.ok ||
            !result.attendee
          ) {
            triggerScannerFeedback(
              "error",
              soundEnabled
            );

            setScannerState({
              status:
                "error",
              message:
                result.error ??
                "Unable to resolve this credential.",
            });

            return;
          }

          await stopScanner();

          setScannerState({
            status:
              "resolved",
            payload,
            attendee:
              result.attendee,
          });
        } catch {
          setScannerState({
            status:
              "error",
            message:
              "Unable to reach the check-in service.",
          });
        }
      },
      [
        soundEnabled,
        stopScanner,
      ]
    );

  const startScanner =
    useCallback(
      async () => {
        await stopScanner();

        lockedRef.current =
          false;

        setScannerState({
          status:
            "idle",
        });

        setCameraState(
          "starting"
        );

        try {
          const {
            Html5Qrcode,
          } =
            await import(
              "html5-qrcode"
            );

          const scanner =
            new Html5Qrcode(
              "mw-admin-qr-reader"
            );

          scannerRef.current =
            scanner;

          await scanner.start(
            {
              facingMode:
                "environment",
            },
            {
              fps: 10,
              qrbox: {
                width: 250,
                height: 250,
              },
              aspectRatio:
                1,
            },
            (decodedText) => {
              void resolvePayload(
                decodedText
              );
            },
            () => {
              // Ignore frame-level
              // scan failures.
            }
          );

          setCameraState(
            "active"
          );
        } catch {
          await stopScanner();

          setCameraState(
            "unavailable"
          );
        }
      },
      [
        resolvePayload,
        stopScanner,
      ]
    );

  useEffect(() => {
    const frame =
      window.requestAnimationFrame(
        () => {
          void startScanner();
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );

      void stopScanner();
    };
  }, [
    startScanner,
    stopScanner,
  ]);

  async function confirmCheckIn() {
    if (
      scannerState.status !==
      "resolved"
    ) {
      return;
    }

    const {
      payload,
    } =
      scannerState;

    setScannerState({
      status:
        "resolving",
    });

    try {
      const response =
        await fetch(
          "/api/admin/checkin/confirm",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                payload,
              }),
          }
        );

      const result =
        (await response.json()) as {
          ok?: boolean;
          error?: string;
          alreadyCheckedIn?:
            boolean;
          attendee?:
            Attendee;
        };

      if (
        !response.ok ||
        !result.ok ||
        !result.attendee
      ) {
        setScannerState({
          status:
            "error",
          message:
            result.error ??
            "Unable to complete check-in.",
        });

        return;
      }

      const alreadyCheckedIn =
        Boolean(
          result.alreadyCheckedIn
        );

      triggerScannerFeedback(
        alreadyCheckedIn
          ? "duplicate"
          : "success",
        soundEnabled
      );

      setScannerState({
        status:
          "success",
        attendee:
          result.attendee,
        alreadyCheckedIn,
      });
    } catch {
      setScannerState({
        status:
          "error",
        message:
          "Unable to reach the check-in service.",
      });
    }
  }

  function submitManual() {
    const value =
      manualPayload.trim();

    if (!value) {
      return;
    }

    void resolvePayload(
      value
    );
  }

  useEffect(() => {
    if (
      scannerState.status !==
        "success" ||
      scannerState.alreadyCheckedIn
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setManualPayload("");

          void startScanner();
        },
        5000
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    scannerState,
    startScanner,
  ]);

  function scanNext() {
    setManualPayload("");

    void startScanner();
  }

  return (
    <div className="mw-scanner-console">
      <div className="mw-scanner-toolbar">
        <div>
          <span className="mw-scanner-live-dot" />

          Scanner ready
        </div>

        <button
          type="button"
          onClick={() =>
            setSoundEnabled(
              (current) =>
                !current
            )
          }
          aria-pressed={
            soundEnabled
          }
        >
          {soundEnabled ? (
            <Volume2
              size={15}
            />
          ) : (
            <VolumeX
              size={15}
            />
          )}

          {soundEnabled
            ? "Sound on"
            : "Sound off"}
        </button>
      </div>

      <section className="mw-scanner-camera-card">
        <div className="mw-scanner-camera-header">
          <div>
            <span>
              Venue scanner
            </span>

            <strong>
              Scan attendee QR
            </strong>
          </div>

          <Camera
            size={22}
          />
        </div>

        <div className="mw-scanner-frame-shell">
          <div
            id="mw-admin-qr-reader"
            className="mw-scanner-frame"
          />

          {cameraState ===
          "starting" ? (
            <div className="mw-scanner-overlay">
              <LoaderCircle
                size={28}
                className="animate-spin"
              />

              Starting camera
            </div>
          ) : null}

          {cameraState ===
          "unavailable" ? (
            <div className="mw-scanner-overlay">
              <TriangleAlert
                size={27}
              />

              <strong>
                Camera unavailable
              </strong>

              <span>
                Allow camera access or use manual credential entry below.
              </span>
            </div>
          ) : null}
        </div>

        <div className="mw-scanner-camera-foot">
          <ScanLine
            size={16}
          />

          Hold the QR code inside the frame.
        </div>
      </section>

      <section className="mw-scanner-result-card">
        {scannerState.status ===
        "idle" ? (
          <div className="mw-scanner-placeholder">
            <ShieldCheck
              size={34}
            />

            <strong>
              Ready to scan
            </strong>

            <span>
              Attendee details appear only after the secure credential is verified.
            </span>
          </div>
        ) : null}

        {scannerState.status ===
        "resolving" ? (
          <div className="mw-scanner-placeholder">
            <LoaderCircle
              size={34}
              className="animate-spin"
            />

            <strong>
              Verifying credential
            </strong>
          </div>
        ) : null}

        {scannerState.status ===
        "resolved" ? (
          <div className="mw-scanner-attendee">
            <span className="mw-scanner-verified">
              <ShieldCheck
                size={15}
              />
              Credential verified
            </span>

            <div className="mw-scanner-person">
              <b>
                {flag(
                  scannerState
                    .attendee
                    .countryCode
                )}
              </b>

              <div>
                <h2>
                  {
                    scannerState
                      .attendee
                      .name
                  }
                </h2>

                <p>
                  {
                    scannerState
                      .attendee
                      .registrationRef
                  }
                </p>

                <span>
                  {
                    scannerState
                      .attendee
                      .country
                  }
                  {" · "}
                  {
                    scannerState
                      .attendee
                      .partySize
                  }{" "}
                  attendee
                  {scannerState
                    .attendee
                    .partySize ===
                  1
                    ? ""
                    : "s"}
                </span>
              </div>
            </div>

            {scannerState
              .attendee
              .checkedIn ? (
              <div className="mw-scanner-already">
                <CheckCircle2
                  size={19}
                />

                Already checked in
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  void confirmCheckIn()
                }
                className="mw-scanner-confirm"
              >
                <UserCheck
                  size={19}
                />

                Check in attendee
              </button>
            )}

            <button
              type="button"
              className="mw-scanner-secondary"
              onClick={
                scanNext
              }
            >
              <RotateCcw
                size={15}
              />

              Scan another
            </button>
          </div>
        ) : null}

        {scannerState.status ===
        "success" ? (
          <div
            className={[
              "mw-scanner-success",
              scannerState.alreadyCheckedIn
                ? "is-duplicate"
                : "is-new-checkin",
            ].join(" ")}
          >
            <CheckCircle2
              size={46}
            />

            <span
              className={
                scannerState.alreadyCheckedIn
                  ? "is-duplicate"
                  : "is-success"
              }
            >
              {scannerState.alreadyCheckedIn
                ? "Duplicate scan · already checked in"
                : "Check-in complete"}
            </span>

            <h2>
              {
                scannerState
                  .attendee
                  .name
              }
            </h2>

            <div className="mw-scanner-success-meta">
              <p>
                {flag(
                  scannerState
                    .attendee
                    .countryCode
                )}{" "}
                {
                  scannerState
                    .attendee
                    .country
                }
              </p>

              <div>
                <strong>
                  {
                    scannerState
                      .attendee
                      .partySize
                  }
                </strong>

                <small>
                  attendee
                  {scannerState
                    .attendee
                    .partySize ===
                  1
                    ? ""
                    : "s"}
                </small>
              </div>
            </div>

            {scannerState
              .attendee
              .registrationRef ? (
              <div className="mw-scanner-success-ref">
                <span>
                  Registration
                </span>

                <strong>
                  {
                    scannerState
                      .attendee
                      .registrationRef
                  }
                </strong>
              </div>
            ) : null}

            {!scannerState.alreadyCheckedIn ? (
              <div className="mw-scanner-auto-next">
                Scanner resets automatically in 5 seconds
              </div>
            ) : null}

            <button
              type="button"
              onClick={
                scanNext
              }
            >
              <ScanLine
                size={17}
              />
              Scan next attendee
            </button>
          </div>
        ) : null}

        {scannerState.status ===
        "error" ? (
          <div className="mw-scanner-error">
            <TriangleAlert
              size={39}
            />

            <strong>
              Unable to verify QR
            </strong>

            <p>
              {
                scannerState.message
              }
            </p>

            <button
              type="button"
              onClick={
                scanNext
              }
            >
              Try another code
            </button>
          </div>
        ) : null}
      </section>

      <section className="mw-scanner-manual">
        <div>
          <Keyboard
            size={18}
          />

          <span>
            Manual fallback
          </span>
        </div>

        <textarea
          value={
            manualPayload
          }
          onChange={(
            event
          ) =>
            setManualPayload(
              event.target
                .value
            )
          }
          placeholder="Paste the Mighty Works QR payload"
          rows={3}
        />

        <button
          type="button"
          onClick={
            submitManual
          }
          disabled={
            !manualPayload.trim()
          }
        >
          Verify credential
        </button>
      </section>
    </div>
  );
}

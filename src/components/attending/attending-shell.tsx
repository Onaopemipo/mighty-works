"use client";

import {
  ArrowLeft,
  ArrowRight,
  Download,
  ImagePlus,
  LockKeyhole,
  Share2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  DragEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const navigation = [
  {
    label: "Home",
    href: "/#top",
  },
  {
    label: "About",
    href: "/#about",
  },
  {
    label: "Experience",
    href: "/#experience",
  },
  {
    label: "Around the World",
    href: "/#nations",
  },
  {
    label: "Schedule",
    href: "/#schedule",
  },
];

const OUTPUT_SIZE = 1080;
const PHOTO_HEIGHT = 760;

const MAX_PHOTO_BYTES =
  10 * 1024 * 1024;

const ACCEPTED_PHOTO_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

type AttendeePhoto = {
  url: string;
  name: string;
};

type PhotoPosition = {
  x: number;
  y: number;
};

type AttendingFrame =
  | "signature"
  | "greater-things"
  | "midnight"
  | "minimal";

type AttendingFrameOption = {
  id: AttendingFrame;
  name: string;
  description: string;
  className: string;
};

const ATTENDING_FRAMES:
  AttendingFrameOption[] = [
    {
      id: "signature",
      name: "Signature",
      description:
        "Official dark conference frame",
      className:
        "is-signature",
    },
    {
      id: "greater-things",
      name: "Greater Things",
      description:
        "Bright editorial declaration",
      className:
        "is-greater-things",
    },
    {
      id: "midnight",
      name: "Midnight",
      description:
        "Cinematic indigo atmosphere",
      className:
        "is-midnight",
    },
    {
      id: "minimal",
      name: "Minimal",
      description:
        "Clean photo-first composition",
      className:
        "is-minimal",
    },
  ];

type PhotoDrag = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

const clampPosition = (
  value: number
) =>
  Math.max(
    -1,
    Math.min(1, value)
  );

const loadBrowserImage = (
  src: string
) =>
  new Promise<HTMLImageElement>(
    (resolve, reject) => {
      const image =
        new window.Image();

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            "Unable to load photo."
          )
        );

      image.src = src;
    }
  );

export function AttendingShell() {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const sourceImageRef =
    useRef<HTMLImageElement | null>(
      null
    );

  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const mightyWorksLogoRef =
    useRef<HTMLImageElement | null>(
      null
    );

  const hostLogoRef =
    useRef<HTMLImageElement | null>(
      null
    );

  const [photo, setPhoto] =
    useState<AttendeePhoto | null>(
      null
    );

  const [photoError, setPhotoError] =
    useState<string | null>(null);


  const [generating, setGenerating] =
    useState(false);

  const [
    shareMessage,
    setShareMessage,
  ] = useState<string | null>(
    null
  );

  const [
    photoReady,
    setPhotoReady,
  ] = useState(false);

  const [dragActive, setDragActive] =
    useState(false);

  const [photoPosition, setPhotoPosition] =
    useState<PhotoPosition>({
      x: 0,
      y: 0,
    });

  const [photoZoom, setPhotoZoom] =
    useState(1);

  const [
    selectedFrame,
    setSelectedFrame,
  ] = useState<AttendingFrame>(
    "signature"
  );

  const photoDragRef =
    useRef<PhotoDrag | null>(null);

  useEffect(() => {
    return () => {
      if (photo) {
        URL.revokeObjectURL(
          photo.url
        );
      }
    };
  }, [photo]);

  useEffect(() => {
    let active = true;

    Promise.all([
      loadBrowserImage(
        "/images/brand/mighty-works-conference-transparent.png"
      ),
      loadBrowserImage(
        "/images/brand/everwinning-host-transparent.png"
      ),
    ])
      .then(
        ([
          mightyWorksLogo,
          hostLogo,
        ]) => {
          if (!active) {
            return;
          }

          mightyWorksLogoRef.current =
            mightyWorksLogo;

          hostLogoRef.current =
            hostLogo;

          setPhotoPosition(
            (current) => ({
              ...current,
            })
          );
        }
      )
      .catch(() => {
        /*
         * Artwork retains its text fallback
         * if a decorative brand asset fails.
         */
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!photo) {
      sourceImageRef.current =
        null;
      return;
    }

    let active = true;

    loadBrowserImage(
      photo.url
    )
      .then((image) => {
        if (active) {
          sourceImageRef.current =
            image;

          setPhotoReady(true);
        }
      })
      .catch(() => {
        if (active) {
          sourceImageRef.current =
            null;

          setPhotoReady(false);

          setPhotoError(
            "We could not read that image. Choose another photo."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [photo]);

  const acceptPhoto = (
    file: File | undefined
  ) => {
    setPhotoError(null);

    if (!file) {
      return;
    }


    if (
      !ACCEPTED_PHOTO_TYPES.has(
        file.type
      )
    ) {
      setPhotoError(
        "This photo format is not supported yet."
      );
      return;
    }

    if (
      file.size >
      MAX_PHOTO_BYTES
    ) {
      setPhotoError(
        "Choose an image smaller than 10 MB."
      );
      return;
    }

    const nextUrl =
      URL.createObjectURL(file);


    sourceImageRef.current =
      null;

    setPhotoReady(false);

    setPhoto((current) => {
      if (current) {
        URL.revokeObjectURL(
          current.url
        );
      }

      return {
        url: nextUrl,
        name: file.name,
      };
    });

    setPhotoPosition({
      x: 0,
      y: 0,
    });

    setPhotoZoom(1);
  };

  const handleInputChange = (
    event:
      ChangeEvent<HTMLInputElement>
  ) => {
    acceptPhoto(
      event.target.files?.[0]
    );
  };

  const handleDrop = (
    event:
      DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragActive(false);

    acceptPhoto(
      event.dataTransfer
        .files?.[0]
    );
  };

  const removePhoto = () => {
    setPhoto((current) => {
      if (current) {
        URL.revokeObjectURL(
          current.url
        );
      }

      return null;
    });

    setPhotoError(null);
    setPhotoReady(false);

    sourceImageRef.current =
      null;

    setPhotoPosition({
      x: 0,
      y: 0,
    });

    setPhotoZoom(1);

    photoDragRef.current =
      null;

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  };

  const drawContainedImage =
    useCallback((
      context:
        CanvasRenderingContext2D,
    image: HTMLImageElement,
    centerX: number,
    centerY: number,
    maxWidth: number,
    maxHeight: number
  ) => {
    const scale =
      Math.min(
        maxWidth /
          image.naturalWidth,
        maxHeight /
          image.naturalHeight
      );

    const width =
      image.naturalWidth *
      scale;

    const height =
      image.naturalHeight *
      scale;

    context.drawImage(
      image,
      centerX -
        width / 2,
      centerY -
        height / 2,
      width,
      height
    );
  }, []);

  const drawPhotoToCanvas =
    useCallback((
      context:
        CanvasRenderingContext2D
    ) => {
    const image =
      sourceImageRef.current;

    if (!image) {
      return false;
    }

    const baseScale =
      Math.max(
        OUTPUT_SIZE /
          image.naturalWidth,
        PHOTO_HEIGHT /
          image.naturalHeight
      );

    const scale =
      baseScale *
      photoZoom;

    const drawWidth =
      image.naturalWidth *
      scale;

    const drawHeight =
      image.naturalHeight *
      scale;

    const overflowX =
      Math.max(
        0,
        drawWidth -
          OUTPUT_SIZE
      );

    const overflowY =
      Math.max(
        0,
        drawHeight -
          PHOTO_HEIGHT
      );

    /*
     * Normalised position:
     * -1 = left/top edge
     *  0 = centred
     *  1 = right/bottom edge
     *
     * Because translation is derived
     * exclusively from real overflow,
     * blank canvas can never be exposed.
     */
    const drawX =
      -overflowX / 2 +
      photoPosition.x *
        overflowX /
        2;

    const drawY =
      -overflowY / 2 +
      photoPosition.y *
        overflowY /
        2;

    context.save();

    context.beginPath();

    context.rect(
      0,
      0,
      OUTPUT_SIZE,
      PHOTO_HEIGHT
    );

    context.clip();

    context.drawImage(
      image,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );

    context.restore();

    return true;
  }, [
    photoPosition.x,
    photoPosition.y,
    photoZoom,
  ]);

  const renderGreaterThingsFrame =
    useCallback((
      canvas: HTMLCanvasElement
    ) => {
      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Canvas rendering is unavailable."
        );
      }

      canvas.width =
        OUTPUT_SIZE;

      canvas.height =
        OUTPUT_SIZE;

      context.clearRect(
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      context.fillStyle =
        "#f6f1e7";

      context.fillRect(
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      drawPhotoToCanvas(
        context
      );

      const fade =
        context.createLinearGradient(
          0,
          470,
          0,
          800
        );

      fade.addColorStop(
        0,
        "rgba(246,241,231,0)"
      );

      fade.addColorStop(
        0.52,
        "rgba(246,241,231,.82)"
      );

      fade.addColorStop(
        1,
        "#f6f1e7"
      );

      context.fillStyle =
        fade;

      context.fillRect(
        0,
        450,
        OUTPUT_SIZE,
        380
      );

      context.fillStyle =
        "#f6f1e7";

      context.fillRect(
        0,
        760,
        OUTPUT_SIZE,
        320
      );

      context.fillStyle =
        "#ef4b5b";

      context.fillRect(
        0,
        0,
        24,
        OUTPUT_SIZE
      );

      context.fillRect(
        1056,
        0,
        24,
        OUTPUT_SIZE
      );

      context.textAlign =
        "center";

      context.fillStyle =
        "#ef4b5b";

      context.font =
        "800 29px Arial, sans-serif";

      context.fillText(
        "I AM ATTENDING",
        540,
        784
      );

      context.fillStyle =
        "#17142b";

      context.font =
        "italic 500 82px Georgia, serif";

      context.fillText(
        "Greater Things",
        540,
        870
      );

      const mightyWorksLogo =
        mightyWorksLogoRef.current;

      if (mightyWorksLogo) {
        drawContainedImage(
          context,
          mightyWorksLogo,
          540,
          932,
          430,
          92
        );
      } else {
        context.font =
          "700 35px Arial, sans-serif";

        context.fillText(
          "MIGHTY WORKS CONFERENCE 2026",
          540,
          935
        );
      }

      context.fillStyle =
        "#625c6c";

      context.font =
        "600 18px Arial, sans-serif";

      context.fillText(
        "7-8 NOVEMBER 2026  •  FAITH CENTER  •  BRISBANE",
        540,
        1008
      );

      context.fillStyle =
        "#ef4b5b";

      context.fillRect(
        350,
        1034,
        380,
        4
      );
    }, [
      drawContainedImage,
      drawPhotoToCanvas,
    ]);

  const renderMidnightFrame =
    useCallback((
      canvas: HTMLCanvasElement
    ) => {
      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Canvas rendering is unavailable."
        );
      }

      canvas.width =
        OUTPUT_SIZE;

      canvas.height =
        OUTPUT_SIZE;

      context.clearRect(
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      context.fillStyle =
        "#050611";

      context.fillRect(
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      drawPhotoToCanvas(
        context
      );

      const veil =
        context.createLinearGradient(
          0,
          0,
          OUTPUT_SIZE,
          OUTPUT_SIZE
        );

      veil.addColorStop(
        0,
        "rgba(42,19,80,.14)"
      );

      veil.addColorStop(
        0.58,
        "rgba(5,6,17,.18)"
      );

      veil.addColorStop(
        1,
        "rgba(5,6,17,.9)"
      );

      context.fillStyle =
        veil;

      context.fillRect(
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      const lowerGlow =
        context.createRadialGradient(
          540,
          820,
          40,
          540,
          820,
          560
        );

      lowerGlow.addColorStop(
        0,
        "rgba(93,80,163,.72)"
      );

      lowerGlow.addColorStop(
        0.45,
        "rgba(42,19,80,.42)"
      );

      lowerGlow.addColorStop(
        1,
        "rgba(5,6,17,0)"
      );

      context.fillStyle =
        lowerGlow;

      context.fillRect(
        0,
        470,
        OUTPUT_SIZE,
        610
      );

      context.strokeStyle =
        "rgba(242,147,159,.72)";

      context.lineWidth = 3;

      context.strokeRect(
        34,
        34,
        1012,
        1012
      );

      context.textAlign =
        "center";

      context.fillStyle =
        "#f2939f";

      context.font =
        "800 27px Arial, sans-serif";

      context.fillText(
        "I AM ATTENDING",
        540,
        785
      );

      const mightyWorksLogo =
        mightyWorksLogoRef.current;

      if (mightyWorksLogo) {
        drawContainedImage(
          context,
          mightyWorksLogo,
          540,
          880,
          610,
          145
        );
      } else {
        context.fillStyle =
          "#f6f1e7";

        context.font =
          "700 66px Georgia, serif";

        context.fillText(
          "MIGHTY WORKS",
          540,
          880
        );
      }

      context.fillStyle =
        "#f6f1e7";

      context.font =
        "italic 500 28px Georgia, serif";

      context.fillText(
        "Greater Things",
        540,
        963
      );

      context.fillStyle =
        "rgba(246,241,231,.72)";

      context.font =
        "600 17px Arial, sans-serif";

      context.fillText(
        "7-8 NOVEMBER 2026  •  FAITH CENTER",
        540,
        1010
      );

      const hostLogo =
        hostLogoRef.current;

      if (hostLogo) {
        context.save();

        context.globalAlpha =
          0.72;

        drawContainedImage(
          context,
          hostLogo,
          145,
          1010,
          160,
          46
        );

        context.restore();
      }
    }, [
      drawContainedImage,
      drawPhotoToCanvas,
    ]);

  const renderMinimalFrame =
    useCallback((
      canvas: HTMLCanvasElement
    ) => {
      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Canvas rendering is unavailable."
        );
      }

      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      context.clearRect(
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      context.fillStyle =
        "#f6f1e7";

      context.fillRect(
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      drawPhotoToCanvas(
        context
      );

      /*
       * Minimal is intentionally photo-first.
       * A clean information panel replaces
       * the atmospheric lower overlays.
       */
      context.fillStyle =
        "#fffdf8";

      context.fillRect(
        0,
        744,
        OUTPUT_SIZE,
        336
      );

      context.fillStyle =
        "#ef4b5b";

      context.fillRect(
        0,
        744,
        OUTPUT_SIZE,
        9
      );

      context.textAlign =
        "left";

      context.fillStyle =
        "#ef4b5b";

      context.font =
        "800 25px Arial, sans-serif";

      context.fillText(
        "I AM ATTENDING",
        70,
        807
      );

      context.fillStyle =
        "#17142b";

      context.font =
        "700 58px Georgia, serif";

      context.fillText(
        "Mighty Works",
        70,
        875
      );

      context.font =
        "800 24px Arial, sans-serif";

      context.fillText(
        "CONFERENCE 2026",
        72,
        916
      );

      context.fillStyle =
        "#625c6c";

      context.font =
        "600 17px Arial, sans-serif";

      context.fillText(
        "7-8 NOVEMBER 2026",
        72,
        975
      );

      context.fillText(
        "FAITH CENTER • BRISBANE",
        72,
        1007
      );

      context.textAlign =
        "right";

      context.fillStyle =
        "#ef4b5b";

      context.font =
        "italic 500 31px Georgia, serif";

      context.fillText(
        "Greater Things",
        1008,
        865
      );

      const mightyWorksLogo =
        mightyWorksLogoRef.current;

      if (mightyWorksLogo) {
        drawContainedImage(
          context,
          mightyWorksLogo,
          875,
          940,
          245,
          72
        );
      }

      const hostLogo =
        hostLogoRef.current;

      if (hostLogo) {
        context.save();

        context.globalAlpha =
          0.7;

        drawContainedImage(
          context,
          hostLogo,
          900,
          1008,
          180,
          48
        );

        context.restore();
      }

      context.strokeStyle =
        "rgba(23,20,43,.14)";

      context.lineWidth = 2;

      context.strokeRect(
        25,
        25,
        1030,
        1030
      );
    }, [
      drawContainedImage,
      drawPhotoToCanvas,
    ]);

  const renderArtwork =
    useCallback((
      canvas: HTMLCanvasElement
    ) => {
      if (
        selectedFrame ===
        "greater-things"
      ) {
        renderGreaterThingsFrame(
          canvas
        );
        return;
      }

      if (
        selectedFrame ===
        "midnight"
      ) {
        renderMidnightFrame(
          canvas
        );
        return;
      }

      if (
        selectedFrame ===
        "minimal"
      ) {
        renderMinimalFrame(
          canvas
        );
        return;
      }

      const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Canvas rendering is unavailable."
      );
    }

    canvas.width =
      OUTPUT_SIZE;

    canvas.height =
      OUTPUT_SIZE;

    context.clearRect(
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    context.fillStyle =
      "#17142b";

    context.fillRect(
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    const hasPhoto =
      drawPhotoToCanvas(
        context
      );

    if (!hasPhoto) {
      const placeholder =
        context.createLinearGradient(
          0,
          0,
          OUTPUT_SIZE,
          PHOTO_HEIGHT
        );

      placeholder.addColorStop(
        0,
        "#221a47"
      );

      placeholder.addColorStop(
        1,
        "#0a0916"
      );

      context.fillStyle =
        placeholder;

      context.fillRect(
        0,
        0,
        OUTPUT_SIZE,
        PHOTO_HEIGHT
      );
    }

    const fade =
      context.createLinearGradient(
        0,
        500,
        0,
        850
      );

    fade.addColorStop(
      0,
      "rgba(5,6,17,0)"
    );

    fade.addColorStop(
      0.58,
      "rgba(5,6,17,.86)"
    );

    fade.addColorStop(
      1,
      "#050611"
    );

    context.fillStyle =
      fade;

    context.fillRect(
      0,
      490,
      OUTPUT_SIZE,
      390
    );

    context.fillStyle =
      "#050611";

    context.fillRect(
      0,
      760,
      OUTPUT_SIZE,
      320
    );

    const glow =
      context.createRadialGradient(
        540,
        810,
        30,
        540,
        810,
        520
      );

    glow.addColorStop(
      0,
      "rgba(93,80,163,.48)"
    );

    glow.addColorStop(
      1,
      "rgba(5,6,17,0)"
    );

    context.fillStyle =
      glow;

    context.fillRect(
      0,
      560,
      OUTPUT_SIZE,
      520
    );

    context.strokeStyle =
      "#ef4b5b";

    context.lineWidth = 8;

    context.strokeRect(
      24,
      24,
      1032,
      1032
    );

    context.fillStyle =
      "#ef4b5b";

    context.fillRect(
      0,
      738,
      OUTPUT_SIZE,
      8
    );

    context.textAlign =
      "center";

    context.fillStyle =
      "#f2939f";

    context.font =
      "700 35px Arial, sans-serif";

    context.fillText(
      "I AM ATTENDING",
      540,
      796
    );

    const mightyWorksLogo =
      mightyWorksLogoRef.current;

    if (mightyWorksLogo) {
      drawContainedImage(
        context,
        mightyWorksLogo,
        540,
        875,
        620,
        145
      );
    } else {
      context.fillStyle =
        "#f6f1e7";

      context.font =
        "700 70px Georgia, serif";

      context.fillText(
        "MIGHTY WORKS",
        540,
        875
      );

      context.font =
        "700 31px Arial, sans-serif";

      context.fillText(
        "CONFERENCE 2026",
        540,
        925
      );
    }

    const hostLogo =
      hostLogoRef.current;

    if (hostLogo) {
      context.save();

      context.globalAlpha =
        0.78;

      drawContainedImage(
        context,
        hostLogo,
        160,
        1010,
        190,
        55
      );

      context.restore();
    }

    context.fillStyle =
      "#f2939f";

    context.font =
      "italic 600 30px Georgia, serif";

    context.fillText(
      "Greater Things",
      540,
      976
    );

    context.fillStyle =
      "rgba(246,241,231,.78)";

    context.font =
      "600 19px Arial, sans-serif";

    context.fillText(
      "7-8 NOVEMBER 2026  •  FAITH CENTER  •  BRISBANE",
      540,
      1021
    );
  }, [
    drawContainedImage,
    drawPhotoToCanvas,
    renderGreaterThingsFrame,
    renderMidnightFrame,
    renderMinimalFrame,
    selectedFrame,
  ]);

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    renderArtwork(
      canvas
    );
  }, [
    photo,
    photoReady,
    selectedFrame,
    renderArtwork,
  ]);

  const buildArtworkBlob =
    async () => {
      const canvas =
        canvasRef.current;

      if (
        !photo ||
        !photoReady ||
        !canvas
      ) {
        throw new Error(
          "Artwork is not ready."
        );
      }

      renderArtwork(
        canvas
      );

      return new Promise<Blob>(
        (
          resolve,
          reject
        ) => {
          canvas.toBlob(
            (result) => {
              if (result) {
                resolve(result);
                return;
              }

              reject(
                new Error(
                  "PNG generation failed."
                )
              );
            },
            "image/png"
          );
        }
      );
    };

  const downloadArtwork =
    async () => {
      if (!photo) {
        setPhotoError(
          "Upload your photo before downloading your graphic."
        );
        return;
      }

      const canvas =
        canvasRef.current;

      if (!canvas) {
        setPhotoError(
          "Your graphic is not ready yet."
        );
        return;
      }

      setGenerating(true);
      setPhotoError(null);

      try {
        renderArtwork(
          canvas
        );

        const blob =
          await new Promise<Blob>(
            (
              resolve,
              reject
            ) => {
              canvas.toBlob(
                (result) => {
                  if (result) {
                    resolve(
                      result
                    );
                    return;
                  }

                  reject(
                    new Error(
                      "PNG generation failed."
                    )
                  );
                },
                "image/png"
              );
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `mighty-works-2026-${selectedFrame}.png`;

        document.body.appendChild(
          link
        );

        link.click();
        link.remove();

        window.setTimeout(
          () => {
            URL.revokeObjectURL(
              url
            );
          },
          1000
        );
      } catch {
        setPhotoError(
          "We could not generate your image. Please try again."
        );
      } finally {
        setGenerating(false);
      }
    };

  const shareArtwork =
    async () => {
      if (
        !photo ||
        !photoReady
      ) {
        setPhotoError(
          "Upload your photo before sharing your graphic."
        );
        return;
      }

      setGenerating(true);
      setPhotoError(null);
      setShareMessage(null);

      try {
        const blob =
          await buildArtworkBlob();

        const fileName =
          `mighty-works-2026-${selectedFrame}.png`;

        const file =
          new File(
            [blob],
            fileName,
            {
              type: "image/png",
            }
          );

        if (
          navigator.share &&
          navigator.canShare?.({
            files: [file],
          })
        ) {
          await navigator.share({
            title:
              "I am attending Mighty Works Conference 2026",
            text:
              "I am attending Mighty Works Conference 2026 — Greater Things.",
            files: [file],
          });

          setShareMessage(
            "Your graphic is ready to share."
          );

          return;
        }

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;
        link.download =
          fileName;

        document.body.appendChild(
          link
        );

        link.click();
        link.remove();

        window.setTimeout(
          () => {
            URL.revokeObjectURL(
              url
            );
          },
          1000
        );

        setShareMessage(
          "Direct sharing is not supported by this browser, so your graphic was downloaded instead."
        );
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        setPhotoError(
          "Sharing is unavailable right now. You can still download your image."
        );
      } finally {
        setGenerating(false);
      }
    };

  const resetPhotoPosition = () => {
    setPhotoPosition({
      x: 0,
      y: 0,
    });

    setPhotoZoom(1);
  };

  const handlePhotoPointerDown = (
    event:
      ReactPointerEvent<HTMLDivElement>
  ) => {
    if (!photo) {
      return;
    }

    photoDragRef.current = {
      pointerId:
        event.pointerId,
      startX:
        event.clientX,
      startY:
        event.clientY,
      originX:
        photoPosition.x,
      originY:
        photoPosition.y,
    };

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );
  };

  const handlePhotoPointerMove = (
    event:
      ReactPointerEvent<HTMLDivElement>
  ) => {
    const drag =
      photoDragRef.current;

    if (
      !photo ||
      !drag ||
      drag.pointerId !==
        event.pointerId
    ) {
      return;
    }

    const bounds =
      event.currentTarget
        .getBoundingClientRect();

    const sensitivity =
      2.25 / Math.max(
        1,
        photoZoom
      );

    const deltaX =
      (
        event.clientX -
        drag.startX
      ) /
      Math.max(
        bounds.width,
        1
      );

    const deltaY =
      (
        event.clientY -
        drag.startY
      ) /
      Math.max(
        bounds.height,
        1
      );

    setPhotoPosition({
      x: clampPosition(
        drag.originX +
          deltaX *
            sensitivity
      ),
      y: clampPosition(
        drag.originY +
          deltaY *
            sensitivity
      ),
    });
  };

  const handlePhotoPointerEnd = (
    event:
      ReactPointerEvent<HTMLDivElement>
  ) => {
    if (
      photoDragRef.current
        ?.pointerId !==
      event.pointerId
    ) {
      return;
    }

    photoDragRef.current =
      null;

    if (
      event.currentTarget
        .hasPointerCapture(
          event.pointerId
        )
    ) {
      event.currentTarget
        .releasePointerCapture(
          event.pointerId
        );
    }
  };

  return (
    <main
      id="main-content"
      className="mw-attending"
    >
      <header className="mw-attending-nav">
        <div className="mw-attending-nav-inner">
          <Link
            href="/"
            className="mw-attending-brand"
            aria-label="Mighty Works Conference 2026 home"
          >
            <span className="mw-attending-brand-mwc">
              <Image
                src="/images/hero-2026/mighty-works-conference.png"
                alt="Mighty Works Conference 2026"
                width={230}
                height={154}
                priority
              />
            </span>

            <span
              className="mw-attending-brand-rule"
              aria-hidden="true"
            />

            <span className="mw-attending-brand-host">
              <Image
                src="/images/hero-2026/everwinning-white.png"
                alt="Everwinning Faith Ministries Australia"
                width={230}
                height={154}
                priority
              />
            </span>
          </Link>

          <nav
            className="mw-attending-links"
            aria-label="Conference navigation"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/#register-interest"
            className="mw-attending-register"
          >
            Register now
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="mw-attending-hero">
        <Link
          href="/"
          className="mw-attending-back"
        >
          <ArrowLeft size={16} />
          Conference home
        </Link>

        <div className="mw-attending-eyebrow">
          <span aria-hidden="true" />
          Greater Things
          <span aria-hidden="true" />
        </div>

        <h1>
          Show You&apos;re
          <span> Attending</span>
        </h1>

        <p>
          Upload your photo and create your
          personal conference graphic.
          <br />
          Let everyone know:
          <em>
            {" "}
            I am attending Mighty Works
            Conference 2026.
          </em>
        </p>
      </section>

      <section
        className="mw-attending-workspace"
        aria-label="Attendee graphic generator"
      >
        <div className="mw-attending-controls">
          <div
            className="mw-attending-steps"
            aria-label="Generator steps"
          >
            <div className="is-active">
              <strong>1</strong>
              <span>
                <b>Upload</b>
                Your photo
              </span>
            </div>

            <i aria-hidden="true" />

            <div>
              <strong>2</strong>
              <span>
                <b>Position</b>
                Make it yours
              </span>
            </div>

            <i aria-hidden="true" />

            <div>
              <strong>3</strong>
              <span>
                <b>Frame</b>
                Choose a style
              </span>
            </div>

            <i aria-hidden="true" />

            <div>
              <strong>4</strong>
              <span>
                <b>Download</b>
                Share it
              </span>
            </div>
          </div>

          <div
            className={[
              "mw-attending-upload",
              dragActive
                ? "is-dragging"
                : "",
              photo
                ? "has-photo"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() =>
              setDragActive(false)
            }
            onDrop={handleDrop}
          >
            <div className="mw-attending-upload-icon">
              <Upload size={32} />
            </div>

            <h2>
              {photo
                ? "Photo selected"
                : "Choose your photo"}
            </h2>

            <p>
              {photo
                ? photo.name
                : "Drag and drop an image here, or click to browse."}
            </p>

            <small>
              JPG, PNG or WebP · max 10 MB
            </small>

            <div className="mw-attending-native-upload">
              <span
                className="mw-attending-upload-button"
                aria-hidden="true"
              >
                <ImagePlus
                  size={18}
                />

                {photo
                  ? "Change photo"
                  : "Upload photo"}
              </span>

              <input
                ref={inputRef}
                id="mw-attending-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="mw-attending-native-file-input"
                aria-label={
                  photo
                    ? "Change photo"
                    : "Upload photo"
                }
                onChange={
                  handleInputChange
                }
              />
            </div>

            {photo ? (
              <button
                type="button"
                className="mw-attending-remove-photo"
                onClick={removePhoto}
              >
                Remove photo
              </button>
            ) : null}

            {photoError ? (
              <p
                className="mw-attending-photo-error"
                role="alert"
              >
                {photoError}
              </p>
            ) : null}
          </div>

          {photo ? (
            <div className="mw-attending-position-controls">
              <div className="mw-attending-position-heading">
                <div>
                  <strong>
                    Position your photo
                  </strong>

                  <span>
                    Drag the preview and zoom until it looks right.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    resetPhotoPosition
                  }
                >
                  Reset
                </button>
              </div>

              <label className="mw-attending-zoom">
                <span>
                  Zoom
                </span>

                <input
                  type="range"
                  min="1"
                  max="2.2"
                  step="0.01"
                  value={
                    photoZoom
                  }
                  onChange={(event) =>
                    setPhotoZoom(
                      Number(
                        event.target
                          .value
                      )
                    )
                  }
                  aria-label="Photo zoom"
                />

                <output>
                  {Math.round(
                    photoZoom *
                      100
                  )}
                  %
                </output>
              </label>
            </div>
          ) : null}

          {photo ? (
            <section
              className="mw-attending-frame-picker"
              aria-labelledby="mw-attending-frame-title"
            >
              <div className="mw-attending-frame-heading">
                <div>
                  <span>
                    Step 3
                  </span>

                  <h3 id="mw-attending-frame-title">
                    Choose your frame
                  </h3>
                </div>

                <small>
                  Your crop stays exactly the same
                </small>
              </div>

              <div
                className="mw-attending-frame-options"
                role="radiogroup"
                aria-label="Attendee graphic frame"
              >
                {ATTENDING_FRAMES.map(
                  (frame) => {
                    const selected =
                      selectedFrame ===
                      frame.id;

                    return (
                      <button
                        key={frame.id}
                        type="button"
                        role="radio"
                        aria-checked={
                          selected
                        }
                        className={[
                          "mw-attending-frame-option",
                          frame.className,
                          selected
                            ? "is-selected"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() =>
                          setSelectedFrame(
                            frame.id
                          )
                        }
                      >
                        <span
                          className="mw-attending-frame-thumbnail"
                          aria-hidden="true"
                        >
                          <i />
                          <b>
                            I AM
                            <br />
                            ATTENDING
                          </b>
                          <em>
                            MW
                          </em>
                        </span>

                        <span className="mw-attending-frame-meta">
                          <strong>
                            {frame.name}
                          </strong>

                          <small>
                            {
                              frame.description
                            }
                          </small>
                        </span>

                        <span
                          className="mw-attending-frame-check"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </section>
          ) : null}

          <div className="mw-attending-privacy">
            <LockKeyhole size={15} />

            <span>
              Your photo is processed in
              your browser. It is never
              uploaded or stored.
            </span>
          </div>

          <p className="mw-attending-stage-note">
            Photo controls activate in the
            next implementation stage.
          </p>
        </div>

        <div className="mw-attending-preview-column">
          <div
            className={[
              "mw-attending-preview",
              photo
                ? "is-adjustable"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onPointerDown={
              handlePhotoPointerDown
            }
            onPointerMove={
              handlePhotoPointerMove
            }
            onPointerUp={
              handlePhotoPointerEnd
            }
            onPointerCancel={
              handlePhotoPointerEnd
            }
          >
            <canvas
              ref={canvasRef}
              className="mw-attending-artwork-canvas"
              width={OUTPUT_SIZE}
              height={OUTPUT_SIZE}
              aria-label="Your Mighty Works Conference attendee graphic preview"
            />

            {photo &&
            !photoReady ? (
              <div
                className="mw-attending-preview-loading"
                role="status"
                aria-live="polite"
              >
                <span
                  className="mw-attending-preview-spinner"
                  aria-hidden="true"
                />

                <strong>
                  Preparing your photo
                </strong>

                <small>
                  Building your conference graphic…
                </small>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="mw-attending-download"
            disabled={
              !photo ||
              !photoReady ||
              generating
            }
            onClick={
              downloadArtwork
            }
          >
            <Download size={19} />

            {generating
              ? "Generating..."
              : "Download image"}
          </button>

          <button
            type="button"
            className="mw-attending-share"
            disabled={
              !photo ||
              !photoReady ||
              generating
            }
            onClick={
              shareArtwork
            }
          >
            <Share2 size={19} />

            {generating
              ? "Preparing..."
              : "Share graphic"}
          </button>

          {shareMessage ? (
            <p
              className="mw-attending-share-message"
              role="status"
              aria-live="polite"
            >
              {shareMessage}
            </p>
          ) : null}

          <p className="mw-attending-declaration">
            Let&apos;s declare it together —
            <em> Greater Things ahead.</em>
          </p>
        </div>
      </section>

      <footer className="mw-attending-footer">
        <div className="mw-attending-footer-details">
          <span>
            <strong>
              7–8 November 2026
            </strong>
            Saturday 5:00 PM · Sunday 9:00 AM
          </span>

          <span>
            <strong>
              Faith Center
            </strong>
            62 Eastern Rd, Browns Plains QLD 4118
          </span>
        </div>

        <div className="mw-attending-footer-theme">
          <em>Greater Things</em>
          <span>John 14:12</span>
        </div>
      </footer>
    </main>
  );
}

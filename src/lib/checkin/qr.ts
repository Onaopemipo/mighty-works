import "server-only";

import QRCode from "qrcode";

const CHECK_IN_QR_OPTIONS = {
  errorCorrectionLevel:
    "M" as const,
  margin: 1,
  width: 420,
};

export async function createCheckInQrPng(
  payload: string
) {
  return QRCode.toBuffer(
    payload,
    {
      ...CHECK_IN_QR_OPTIONS,
      type:
        "png",
    }
  );
}

export async function createCheckInQrDataUrl(
  payload: string
) {
  return QRCode.toDataURL(
    payload,
    {
      ...CHECK_IN_QR_OPTIONS,
      type:
        "image/png",
    }
  );
}

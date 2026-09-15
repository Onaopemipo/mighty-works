import "server-only";

import QRCode from "qrcode";

export async function createCheckInQrDataUrl(
  payload: string
) {
  return QRCode.toDataURL(
    payload,
    {
      errorCorrectionLevel:
        "M",
      margin: 1,
      width: 420,
      type:
        "image/png",
    }
  );
}

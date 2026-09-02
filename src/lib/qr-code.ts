import QRCode from "qrcode";

export async function createQrSvg(value: string) {
  return QRCode.toString(value, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 3,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    width: 1024,
  });
}

export async function createQrPngBuffer(value: string) {
  return QRCode.toBuffer(value, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 4,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    width: 1400,
  });
}

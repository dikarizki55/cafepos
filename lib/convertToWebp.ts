// utils/convertToWebp.ts
"use client";

export async function convertToWebp(
  file: File,
  maxWidthHeight: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(
        maxWidthHeight / img.width,
        maxWidthHeight / img.height,
        1
      );
      const newW = img.width * scale;
      const newH = img.height * scale;

      canvas.width = newW;
      canvas.height = newH;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));

      // draw original image
      ctx.drawImage(img, 0, 0, newW, newH);

      // convert canvas to webp Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Failed to convert to WebP"));
          const webpFile = new File([blob], `${file.name.split(".")[0]}.webp`, {
            type: "image/webp",
          });
          resolve(webpFile);
        },
        "image/webp",
        0.8 // quality (0 - 1)
      );
    };

    img.onerror = reject;
  });
}

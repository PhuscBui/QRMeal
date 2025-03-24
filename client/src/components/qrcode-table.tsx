"use client";
import { Button } from "@/components/ui/button";
import { getTableLink } from "@/lib/utils";
import { ImageDown } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

export default function QRCodeTable({
  token,
  tableNumber,
  width = 250,
}: {
  token: string;
  tableNumber: number;
  width?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.height = width + 70;
    canvas.width = width;
    const canvasContext = canvas.getContext("2d")!;
    canvasContext.fillStyle = "#fff";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.font = "20px Arial";
    canvasContext.textAlign = "center";
    canvasContext.fillStyle = "#000";
    canvasContext.fillText(
      `Table ${tableNumber}`,
      canvas.width / 2,
      canvas.width + 20
    );
    canvasContext.fillText(
      `Scan to order`,
      canvas.width / 2,
      canvas.width + 50
    );
    const virtalCanvas = document.createElement("canvas");
    QRCode.toCanvas(
      virtalCanvas,
      getTableLink({
        token,
        tableNumber,
      }),
      {
        width,
        margin: 4,
      },
      function (error) {
        if (error) console.error(error);
        canvasContext.drawImage(virtalCanvas, 0, 0, width, width);
      }
    );
  }, [token, width, tableNumber]);
  return <canvas ref={canvasRef} />;
}

export function DownloadQRCodeTable({
  token,
  tableNumber,
  width = 250,
}: {
  token: string;
  tableNumber: number;
  width?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Function to download the canvas as an image
  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary link element
    const link = document.createElement("a");

    // Convert canvas to data URL
    const dataURL = canvas.toDataURL("image/png");

    // Set link attributes
    link.href = dataURL;
    link.download = `table-${tableNumber}-qrcode.png`;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.height = width + 70;
    canvas.width = width;
    const canvasContext = canvas.getContext("2d")!;
    canvasContext.fillStyle = "#fff";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.font = "20px Arial";
    canvasContext.textAlign = "center";
    canvasContext.fillStyle = "#000";
    canvasContext.fillText(
      `Table ${tableNumber}`,
      canvas.width / 2,
      canvas.width + 20
    );
    canvasContext.fillText(
      `Scan to order`,
      canvas.width / 2,
      canvas.width + 50
    );
    const virtalCanvas = document.createElement("canvas");
    QRCode.toCanvas(
      virtalCanvas,
      getTableLink({
        token,
        tableNumber,
      }),
      {
        width,
        margin: 4,
      },
      function (error) {
        if (error) console.error(error);
        canvasContext.drawImage(virtalCanvas, 0, 0, width, width);
      }
    );
  }, [token, width, tableNumber]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} hidden />
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={downloadQRCode}
      >
        <ImageDown className="h-4 w-4" />
      </Button>
    </div>
  );
}

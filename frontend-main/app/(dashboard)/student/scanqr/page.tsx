"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useLogAttendance } from "@/lib/hooks/useLogAttendance";

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const  { address } = useAccount()

  const { logAttendance } =
    useLogAttendance();

  useEffect(() => {
    // Initialize scanner on component mount
    html5QrCodeRef.current = new Html5Qrcode("qr-reader");

    // Cleanup on component unmount
    return () => {
      if (
        html5QrCodeRef.current &&
        isScanning &&
        html5QrCodeRef.current.getState() !==
          Html5QrcodeScannerState.NOT_STARTED
      ) {
        html5QrCodeRef.current
          .stop()
          .catch((err: unknown) =>
            console.error("Failed to stop scanner:", err)
          );
      }
    };
  }, [isScanning]);

  const startScanning = async () => {
    if (!html5QrCodeRef.current) return;

    try {
      setError(null);
      setScanResult(null);
      setIsScanning(true);

      const config = { fps: 10, qrbox: { width: 250, height: 400 } };
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        async (decodedText: string) => {
          setScanResult(decodedText);
          setIsScanning(false);
          const data = JSON.parse(decodedText);
          console.log(data)

          await logAttendance({
            studentAddress: address as string,
            // studentAddress: '0xCe2682E44734b96361BD0d7B0DEC01D2AB82adcF',
            cohortId: Number(data.cohortId),
            track: Number(data.trackId),
          });
          html5QrCodeRef.current
            ?.stop()
            .catch((err: unknown) =>
              console.error("Failed to stop scanner:", err)
            );
        },
        (errorMessage: string) => {
          console.warn("Scan error:", errorMessage);
        }
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to access camera";
      setError(
        `${errorMessage}. Please ensure camera permissions are granted.`
      );
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (
      html5QrCodeRef.current &&
      isScanning &&
      html5QrCodeRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED
    ) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err: unknown) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-screen p-4 -mt-20">
      <h2 className="text-[22px] font-medium text-gray-800">Scan attendance QR code</h2>
      <div
        id="qr-reader"
        className="w-full max-w-[300px] h-[300px] border border-gray-300 rounded-xl overflow-hidden"
      ></div>
      {scanResult && (
        <div className="text-green-600">
          <p>Data to submit: {scanResult}, wallet address: { address }</p>
        </div>
      )}
      {error && (
        <div className="text-red-600">
          <p>Error: {error}</p>
        </div>
      )}
      <div className="flex gap-4">
        {!isScanning ? (
          <Button onClick={startScanning} className="" size="lg">
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="destructive">
            Stop Scanning
          </Button>
        )}
      </div>
    </div>
  );
}

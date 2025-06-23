"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import Image from "next/image";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

// Mock data for cohorts and tracks
const cohorts = [
  { id: "1", name: "Cohort 1" },
  { id: "2", name: "Cohort 2" },
  { id: "3", name: "Cohort 3" },
];

const tracks = [
  { id: "1", name: "Frontend" },
  { id: "2", name: "Backend" },
  { id: "3", name: "Full-stack" },
];

export function GenerateAttendanceModal({ isOpen, setIsOpen }: Props) {
  const [selectedCohort, setSelectedCohort] = React.useState<
    string | undefined
  >();
  const [selectedTrack, setSelectedTrack] = React.useState<
    string | undefined
  >();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState<string | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCohort(undefined);
    setSelectedTrack(undefined);
    setQrCodeDataUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCohort || !selectedTrack) {
      toast.error("Please select both a cohort and a track.");
      return;
    }
    setIsGenerating(true);
    try {
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const dataToEmbed = JSON.stringify({
        cohortId: selectedCohort,
        trackId: selectedTrack,
        day,
        month,
        year,
      });
      const qrCodeUrl = await QRCode.toDataURL(dataToEmbed);
      setQrCodeDataUrl(qrCodeUrl);
      toast.success("QR code generated successfully!");
    } catch (err) {
      toast.error("Failed to generate QR code.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = selectedCohort && selectedTrack;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-xl p-6 bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {qrCodeDataUrl ? "Scan QR Code" : "Generate New Attendance"}
          </DialogTitle>
        </DialogHeader>
        {qrCodeDataUrl ? (
          <div className="flex flex-col items-center gap-4 mt-2">
            <Image
              src={qrCodeDataUrl}
              alt="Attendance QR Code"
              height={300}
              width={300}
              className="object-contain"
            />
            <p className="text-sm text-gray-600">
              Scan this code to mark your attendance.
            </p>
            <Button
              onClick={handleClose}
              size="lg"
              className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div>
              <label
                htmlFor="cohort"
                className="block text-sm font-medium mb-1"
              >
                Cohort
              </label>
              <Select onValueChange={setSelectedCohort} value={selectedCohort}>
                <SelectTrigger id="cohort" className="w-full">
                  <SelectValue placeholder="Select a cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Track Selector */}
            <div>
              <label htmlFor="track" className="block text-sm font-medium mb-1">
                Track
              </label>
              <Select onValueChange={setSelectedTrack} value={selectedTrack}>
                <SelectTrigger id="track" className="w-full">
                  <SelectValue placeholder="Select a track" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((track) => (
                    <SelectItem key={track.id} value={track.id}>
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition"
              disabled={isGenerating || !isFormValid}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                "Generate Attendance"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useRegisterStudent } from "@/lib/hooks/useRegisterStudent";

interface AddStudentsExcelModalProps {
 isOpen: boolean;
 setIsOpen: (open: boolean) => void;
}

interface ExcelStudentRow {
 firstname: string;
 lastname: string;
 github?: string;
 twitter?: string;
 linkedin?: string;
 track: number | string;
 cohort: number | string;
 studentAddress: string;
 email?: string;
}

export function AddStudentsExcelModal({ isOpen, setIsOpen }: AddStudentsExcelModalProps) {
 const [file, setFile] = useState<File | null>(null);
 const [results, setResults] = useState<any[]>([]);
 const [isProcessing, setIsProcessing] = useState(false);
 const [columnError, setColumnError] = useState<string | null>(null);
 const { registerStudent } = useRegisterStudent();

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFile(e.target.files?.[0] || null);
  setResults([]);
 };

 const handleProcess = async () => {
  if (!file) return;
  setIsProcessing(true);
  setResults([]);
  setColumnError(null);
  try {
   const data = await file.arrayBuffer();
   const workbook = XLSX.read(data);
   const sheet = workbook.Sheets[workbook.SheetNames[0]];
   const rows: ExcelStudentRow[] = XLSX.utils.sheet_to_json(sheet);

   // Validate columns
   const requiredColumns = [
    "firstname",
    "lastname",
    "github",
    "twitter",
    "linkedin",
    "track",
    "cohort",
    "studentAddress"
   ];
   const firstRow = rows[0] || {};
   const missing = requiredColumns.filter(col => !(col in firstRow));
   if (missing.length > 0) {
    setColumnError(`Missing required columns: ${missing.join(", ")}`);
    setIsProcessing(false);
    return;
   }

   // Batch registration: Promise.allSettled
   const regResults = await Promise.allSettled(
    rows.map(row =>
     registerStudent({
      firstname: row.firstname,
      lastname: row.lastname,
      github: row.github || "",
      twitter: row.twitter || "",
      linkedin: row.linkedin || "",
      track: Number(row.track),
      cohort: Number(row.cohort),
      studentAddress: row.studentAddress,
      email: row.email || "",
     })
    )
   );

   const summary = rows.map((row, idx) => {
    const res = regResults[idx];
    return {
     ...row,
     status: res.status === "fulfilled" ? "success" : "error",
     error: res.status === "rejected" ? (res.reason?.message || String(res.reason)) : undefined,
    };
   });
   setResults(summary);
  } catch (err: any) {
   setResults([{ status: "error", error: err.message || "Failed to process file" }]);
  }
  setIsProcessing(false);
 };

 const handleClose = () => {
  setIsOpen(false);
  setFile(null);
  setResults([]);
  setIsProcessing(false);
 };

 return (
  <Dialog open={isOpen} onOpenChange={handleClose}>
   <DialogContent className="max-w-lg rounded-xl p-6 bg-white border border-gray-200">
    <DialogHeader>
     <DialogTitle className="text-lg font-semibold text-gray-900">
      Add Students via Excel
     </DialogTitle>
    </DialogHeader>
    <div className="flex flex-col gap-4 mt-2">
     <input
      type="file"
      accept=".xlsx"
      onChange={handleFileChange}
      disabled={isProcessing}
     />
     {columnError && (
      <div className="text-red-600 text-sm border border-red-200 bg-red-50 rounded p-2">
       {columnError}
      </div>
     )}
     <Button onClick={handleProcess} disabled={!file || isProcessing}>
      {isProcessing ? "Processing..." : "Process & Register"}
     </Button>
     {results.length > 0 && (
      <div className="mt-4 max-h-60 overflow-y-auto border rounded p-2 bg-gray-50">
       <div className="font-semibold mb-2">Results:</div>
       {results.map((r, i) => (
        <div key={i} className="text-sm flex gap-2 items-center">
         <span>{r.firstname} {r.lastname} ({r.studentAddress}):</span>
         <span className={r.status === "success" ? "text-green-600" : "text-red-600"}>{r.status}</span>
         {r.error && <span className="text-xs text-red-500">- {r.error}</span>}
        </div>
       ))}
      </div>
     )}
    </div>
   </DialogContent>
  </Dialog>
 );
} 
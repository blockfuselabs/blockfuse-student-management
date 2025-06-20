"use client";
import React from "react";
import { Users } from "lucide-react";
import { useAssessmentService } from "../../hooks/useStudentsAssesmentService";
import { Address } from 'viem';

interface Student {
  id: number;
  name: string;
  cohort: string; 
  track: string;
  walletAddress: Address;
}

const Assessment: React.FC = () => {
  const assessmentService = useAssessmentService();
  
  const students: Student[] = [
    { 
      id: 1, 
      name: "John Doe", 
      cohort: "Cohort 2024A", 
      track: "Frontend", 
      walletAddress: "0xAD0096Dfd7f1EdEDfD2462A2F268A63AbDbe1b9F" as Address 
    }
  ];

  return (
    <div className="px-4 md:px-8 bg-white flex-grow min-w-0">
      <h1 className="text-2xl font-bold">Assessment Management</h1>
      <p className="text-gray-600">Record and track student assessments</p>
      <div className="mt-6">
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Student</th>
              <th className="border px-4 py-2">Cohort</th>
              <th className="border px-4 py-2">Track</th>
              <th className="border px-4 py-2">Final Score</th>
              <th className="border px-4 py-2">All Scores</th>
              <th className="border px-4 py-2">Individual Scores</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const { finalScore, isLoading: finalScoreLoading, error: finalScoreError } = 
                assessmentService.useStudentFinalScore(student.walletAddress);

              const { assessments, isLoading: assessmentsLoading, error: assessmentsError } = 
                assessmentService.useStudentAssesments(student.walletAddress);

              return (
                <tr key={student.id}>
                  <td className="border px-4 py-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    {student.name}
                  </td>
                  <td className="border px-4 py-2">{student.cohort}</td>
                  <td className="border px-4 py-2">{student.track}</td>
                  <td className="border px-4 py-2 text-center">
                    {finalScoreLoading 
                      ? "Loading..." 
                      : finalScoreError 
                        ? "Error fetching score" 
                        : finalScore !== undefined 
                          ? finalScore 
                          : "No Data"}
                  </td>
                  <td className="border px-4 py-2">
                    {assessmentsLoading 
                      ? "Loading..." 
                      : assessmentsError
                        ? "Error fetching assessments"
                        : assessments && assessments.length > 0 
                          ? assessments.join(", ") 
                          : "No Scores"}
                  </td>
                  <td className="border px-4 py-2">
                    {Array.from({ length: 3 }, (_, index) => {
                      const { 
                        score, 
                        isLoading: scoreLoading, 
                        error: scoreError 
                      } = assessmentService.useStudentScoreByIndex(
                        student.walletAddress,
                        index
                      );
                      return (
                        <div key={index} className="inline-block mr-2">
                          Score {index + 1}: {
                            scoreLoading 
                              ? "Loading..." 
                              : scoreError 
                                ? "Error" 
                                : score !== undefined 
                                  ? score 
                                  : "N/A"
                          }
                        </div>
                      );
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assessment;
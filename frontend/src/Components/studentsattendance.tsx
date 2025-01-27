import React, { useState, useEffect } from 'react';
import { 
  useAccount, 
  useReadContracts,
} from 'wagmi';
import { Abi } from 'viem';
import smsAbi from "../ABI/smsAbi.json";

// Define interfaces at the top of the file
interface Student {
  id: number;
  name: string;
  cohort: string;
  track: string;
  walletAddress: string;
}

interface Assessment {
  id: number;
  title: string;
  maxScore: number;
  weight: number;
}

const CONTRACT_ADDRESS = import.meta.env.VITE_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

const StudentsAttendance: React.FC = () => {
  const { address, isConnected } = useAccount();
  
  // State management
  const [students] = useState<Student[]>([
    { 
      id: 1, 
      name: "John Doe", 
      cohort: "Cohort 2024A", 
      track: "Frontend", 
      walletAddress: address || "0x123..." 
    },
  ]);
  
  const [assessments] = useState<Assessment[]>([
    { id: 1, title: "HTML & CSS Basics", maxScore: 100, weight: 30 },
    { id: 2, title: "JavaScript Fundamentals", maxScore: 100, weight: 35 },
    { id: 3, title: "React Essentials", maxScore: 100, weight: 35 },
  ]);

  // State for student scores
  const [studentScores, setStudentScores] = useState<{ [key: string]: number[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prepare contracts for reading with proper typing
  const contracts = students.map(student => ({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: smsAbi as Abi,
    functionName: 'getStudentAssesments' as const,
    args: [student.walletAddress]
  }));

  const { data, isLoading: contractLoading, error: contractError } = useReadContracts({
    contracts: contracts
  });

  // Effect to process contract data
  useEffect(() => {
    if (data) {
      const scoresMap: { [key: string]: number[] } = {};
      students.forEach((student, index) => {
        const studentScores = data[index]?.result as number[] | undefined;
        if (studentScores) {
          scoresMap[student.walletAddress] = studentScores;
        }
      });
      setStudentScores(scoresMap);
    }
  }, [data, students]);

  // Update loading and error states
  useEffect(() => {
    setIsLoading(contractLoading);
    if (contractError) {
      setError('Failed to fetch assessments');
      console.error('Error fetching assessments:', contractError);
    }
  }, [contractLoading, contractError]);

  // Calculate final score based on contract data
  const calculateFinalScore = (scores: number[], assessments: Assessment[]): number => {
    if (!scores || scores.length === 0) return 0;
    
    return scores.reduce((total, score, index) => {
      const assessment = assessments[index];
      if (!assessment) return total;
      return total + (score / assessment.maxScore) * assessment.weight;
    }, 0);
  };

  // Render content based on connection status
  if (!isConnected) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">Please connect your wallet to view assessments</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 bg-white flex-grow min-w-0">
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 items-start py-6">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2A3355]">Assessment Management</h1>
          <p className="text-gray-600 mt-2">View student assessments</p>
        </div>
        <div className="text-sm text-gray-600">
          Connected Wallet: {address}
        </div>
      </div>
      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading assessments...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Wallet Address</th>
                  {assessments.map(assessment => (
                    <th key={assessment.id} className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      {assessment.title}
                      <span className="block text-xs text-gray-500">({assessment.weight}%)</span>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Final Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map(student => {
                  const scores = studentScores[student.walletAddress] || [];
                  const finalScore = calculateFinalScore(scores, assessments);
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.walletAddress}
                      </td>
                      {assessments.map((assessment, index) => (
                        <td key={assessment.id} className="px-6 py-4 whitespace-nowrap text-sm">
                          {scores[index] !== undefined ? (
                            <div className="flex items-center">
                              <span className={`font-medium ${
                                scores[index] >= assessment.maxScore * 0.7 ? 'text-green-600' :
                                scores[index] >= assessment.maxScore * 0.5 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {scores[index]}/{assessment.maxScore}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not graded</span>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${
                          finalScore >= 70 ? 'text-green-600' :
                          finalScore >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {finalScore.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsAttendance;
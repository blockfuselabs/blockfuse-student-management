import React, { useState } from 'react';
import { Users } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  cohort: string;
  track: string;
}

interface Assessment {
  id: number;
  title: string;
  maxScore: number;
  weight: number; // Percentage weight of final score
}

interface AssessmentScore {
  id: number;
  studentId: number;
  assessmentId: number;
  score: number;
  submittedAt: string;
  feedback?: string;
}

interface FilterState {
  cohort: string;
  track: string;
  assessment: number | '';
}

const Assessment: React.FC = () => {
  // Sample data - replace with actual data from your backend
  const [students] = useState<Student[]>([
    { id: 1, name: "John Doe", cohort: "Cohort 2024A", track: "Frontend" },
    { id: 2, name: "Jane Smith", cohort: "Cohort 2024A", track: "Frontend" },
    { id: 3, name: "Mike Johnson", cohort: "Cohort 2024B", track: "Backend" },
  ]);

  const [assessments] = useState<Assessment[]>([
    { id: 1, title: "HTML & CSS Basics", maxScore: 100, weight: 30 },
    { id: 2, title: "JavaScript Fundamentals", maxScore: 100, weight: 35 },
    { id: 3, title: "React Essentials", maxScore: 100, weight: 35 },
  ]);

  const [assessmentScores, setAssessmentScores] = useState<AssessmentScore[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    cohort: "",
    track: "",
    assessment: '',
  });
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [newScore, setNewScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  // Get unique cohorts and tracks for filters
  const cohorts = Array.from(new Set(students.map(s => s.cohort)));
  const tracks = Array.from(new Set(students.map(s => s.track)));

  // Record student assessment
  const recordStudentAssessment = () => {
    if (!selectedStudent || !selectedAssessment || !newScore) return;

    const score = parseFloat(newScore);
    if (isNaN(score) || score < 0 || score > selectedAssessment.maxScore) return;

    const newAssessmentScore: AssessmentScore = {
      id: Date.now(),
      studentId: selectedStudent.id,
      assessmentId: selectedAssessment.id,
      score,
      submittedAt: new Date().toISOString(),
      feedback: feedback.trim() || undefined,
    };

    setAssessmentScores(prev => [...prev, newAssessmentScore]);
    setShowScoreModal(false);
    setNewScore("");
    setFeedback("");
  };

  // Get student's assessment scores
  const getStudentAssessments = (studentId: number): AssessmentScore[] => {
    return assessmentScores.filter(score => score.studentId === studentId);
  };

  // Calculate student's final score
  const getStudentFinalScore = (studentId: number): number => {
    const scores = getStudentAssessments(studentId);
    if (scores.length === 0) return 0;

    const weightedScores = scores.map(score => {
      const assessment = assessments.find(a => a.id === score.assessmentId);
      if (!assessment) return 0;
      return (score.score / assessment.maxScore) * assessment.weight;
    });

    return weightedScores.reduce((sum, score) => sum + score, 0);
  };

  // Get filtered students
  const getFilteredStudents = () => {
    return students.filter(student => {
      const matchCohort = !filters.cohort || student.cohort === filters.cohort;
      const matchTrack = !filters.track || student.track === filters.track;
      return matchCohort && matchTrack;
    });
  };

  return (
    <div className="px-4 md:px-8 bg-white flex-grow min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 items-start py-6">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2A3355]">Assessment Management</h1>
          <p className="text-gray-600 mt-2">Record and track student assessments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cohort</label>
          <select
            value={filters.cohort}
            onChange={(e) => setFilters(f => ({ ...f, cohort: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A55]"
          >
            <option value="">All Cohorts</option>
            {cohorts.map(cohort => (
              <option key={cohort} value={cohort}>{cohort}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
          <select
            value={filters.track}
            onChange={(e) => setFilters(f => ({ ...f, track: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A55]"
          >
            <option value="">All Tracks</option>
            {tracks.map(track => (
              <option key={track} value={track}>{track}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
          <select
            value={filters.assessment}
            onChange={(e) => setFilters(f => ({ ...f, assessment: e.target.value ? parseInt(e.target.value) : '' }))}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A55]"
          >
            <option value="">All Assessments</option>
            {assessments.map(assessment => (
              <option key={assessment.id} value={assessment.id}>{assessment.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessment Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Cohort</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Track</th>
                {assessments.map(assessment => (
                  <th key={assessment.id} className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    {assessment.title}
                    <span className="block text-xs text-gray-500">({assessment.weight}%)</span>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Final Score</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getFilteredStudents().map(student => {
                const studentScores = getStudentAssessments(student.id);
                const finalScore = getStudentFinalScore(student.id);

                return (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.cohort}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {student.track}
                    </td>
                    {assessments.map(assessment => {
                      const score = studentScores.find(s => s.assessmentId === assessment.id);
                      return (
                        <td key={assessment.id} className="px-6 py-4 whitespace-nowrap text-sm">
                          {score ? (
                            <div className="flex items-center">
                              <span className={`font-medium ${
                                score.score >= assessment.maxScore * 0.7 ? 'text-green-600' :
                                score.score >= assessment.maxScore * 0.5 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {score.score}/{assessment.maxScore}
                              </span>
                              {score.feedback && (
                                <span className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                                  💬
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not graded</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${
                        finalScore >= 70 ? 'text-green-600' :
                        finalScore >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {finalScore.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowScoreModal(true);
                        }}
                        className="px-4 py-2 bg-[#1E2A55] text-white rounded-lg hover:bg-[#2A3355]"
                      >
                        Record Score
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#2A3355] mb-4">
              Record Assessment Score - {selectedStudent?.name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment
                </label>
                <select
                  value={selectedAssessment?.id || ''}
                  onChange={(e) => {
                    const assessment = assessments.find(a => a.id === parseInt(e.target.value));
                    setSelectedAssessment(assessment || null);
                  }}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Assessment</option>
                  {assessments.map(assessment => (
                    <option key={assessment.id} value={assessment.id}>
                      {assessment.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score
                </label>
                <input
                  type="number"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder={`Max score: ${selectedAssessment?.maxScore || 100}`}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Add feedback for the student..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowScoreModal(false);
                  setSelectedStudent(null);
                  setSelectedAssessment(null);
                  setNewScore("");
                  setFeedback("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={recordStudentAssessment}
                className="px-4 py-2 bg-[#1E2A55] text-white rounded-lg hover:bg-[#2A3355]"
              >
                Save Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
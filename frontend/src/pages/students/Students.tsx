import React, { useState, useEffect } from "react";
import { 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from "wagmi";
import CONTRACT_ABI from '../../smart_contract/SMSAbi.json';
import { useAssessmentService } from "../../hooks/useStudentsAssesmentService";
import { useCohortService } from "../../hooks/useCohortService";

enum Track {
  WEB2,
  WEB3
}

interface NewStudent {
  firstName: string;
  lastName: string;
  twitter: string;
  linkedin: string;
  github: string;
  track: string;
  cohort: string;
  walletAddress: string;
}

const CONTRACT_ADDRESS = "0x3Db767d0407e1fB7d82dA095702937502563910A" as `0x${string}`;

const Students: React.FC = () => {
  // State Management
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const assessmentService = useAssessmentService();
  const cohortService = useCohortService();

  // New Student State
  const [newStudent, setNewStudent] = useState<NewStudent>({
    firstName: "string;",
    lastName: "string;",
    twitter: "string;",
    linkedin: "string;",
    github: "string;",
    track: "string;",
    cohort: "string;",
    walletAddress: "string;",
  });

  // Wagmi Hooks
  const { 
    writeContract, 
    isPending: isRegistering, 
    isSuccess: isRegistrationSuccess,
    error: registrationError 
  } = useWriteContract();

  // Transaction Receipt for Registration
  const { isSuccess: isTransactionConfirmed } = useWaitForTransactionReceipt({
    hash: registrationError ? undefined : undefined,
  });

  const { cohort } = assessmentService.useGetCohort(2); //todo:
  console.log(cohort.processedData, typeof(cohort))

  // const { student } = assessmentService.useGetStudent("0x7e9AABe5EaEe5A454217cFdD3f9f1ada36dD5bF0"); //todo:
  // console.log(student.processedData)

  // Input Change Handler
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Student Registration Handler
  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!newStudent.walletAddress) {
      setError("Wallet address is required");
      return;
    }

    // Map track to track enum
    const trackMapping: {[key: string]: Track} = {
      "Web2": Track.WEB2,
      "Web3": Track.WEB3
    };

    writeContract({
      abi: CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: 'registerStudent',
      args: [
        newStudent.firstName,
        newStudent.lastName,
        newStudent.twitter,
        newStudent.linkedin,
        newStudent.github,
        trackMapping[newStudent.track],
        newStudent.cohort,
        newStudent.walletAddress as `0x${string}`
      ]
    });
  };

  // Map track to track enum
  const trackMapping: {[key: string]: Track} = {
    "Web2": Track.WEB2,
    "Web3": Track.WEB3
  };

  const tabs = Object.keys(trackMapping).map((trackName, index) => ({
    id: index + 1,
    label: trackName,
    track: trackMapping[trackName],
    count: 0
  }));

  const [selectedTab, setSelectedTab] = useState(tabs[0].id);
  const [currentTrack, setCurrentTrack] = useState(Track.WEB2); 

  const { studentDetails } = assessmentService.useGetStudentsByCohortAndTrack(2, currentTrack); //todo: change static
  console.log("students:", studentDetails.processedData)


  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentScore, setStudentScore] = useState('');

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };
  
  const handleAddScore = async () => {
    try {
      // Implement score submission logic
      await cohortService.recordStudentAssesment(
        selectedStudent.studentAddress, 
        Number(studentScore)
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update score', error);
    }
  };

  // Registration Success/Error Handling
  useEffect(() => {
    if (registrationError) {
      setError(registrationError.message);
    }
  
    if (isRegistrationSuccess) {
      setShowCreateModal(false);
      // Reset form
      setNewStudent({
        firstName: "",
        lastName: "",
        twitter: "",
        linkedin: "",
        github: "",
        track: "",
        cohort: 0,
        walletAddress: "",
      });
    }
  }, [registrationError, isRegistrationSuccess]);

  return (
    <div className="p-6 bg-white">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
        >
          CREATE STUDENT
        </button>
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Create New Student</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                {/* <X size={24} /> */}
              </button>
            </div>
            <form onSubmit={handleRegisterStudent} className="p-6">
  <div className="grid grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        First Name
      </label>
      <input
        type="text"
        name="firstName"
        value={newStudent.firstName}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Last Name
      </label>
      <input
        type="text"
        name="lastName"
        value={newStudent.lastName}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Twitter
      </label>
      <input
        type="text"
        name="twitter"
        value={newStudent.twitter}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        LinkedIn
      </label>
      <input
        type="text"
        name="linkedin"
        value={newStudent.linkedin}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        GitHub
      </label>
      <input
        type="text"
        name="github"
        value={newStudent.github}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Track
      </label>
      <select
        name="track"
        value={newStudent.track}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Track</option>
        <option value="Web2">Web2</option>
        <option value="Web3">Web3</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Cohort
      </label>
      <input
        type="number"
        name="cohort"
        value={newStudent.cohort}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Wallet Address
      </label>
      <input
        type="text"
        name="walletAddress"
        value={newStudent.walletAddress}
        onChange={handleInputChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  </div>

  {error && (
    <div className="mt-4 text-red-600">
      {error}
    </div>
  )}

  <div className="mt-6 flex justify-end gap-4">
    <button
      type="button"
      onClick={() => setShowCreateModal(false)}
      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isRegistering}
      className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
    >
      {isRegistering ? 'Creating...' : 'Create Student'}
    </button>
  </div>
</form>
          </div>
        </div>
      )}

       {/* Tabs */}
       <div className="flex gap-8 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedTab(tab.id);
              setCurrentTrack(tab.track);
            }}
            className={`pb-4 px-2 relative ${
              selectedTab === tab.id ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {tab.label}
            {selectedTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-4 pr-6">
                VIEW
              </th>
              <th className="pb-4 pr-6">ADDRESS</th>
              <th className="pb-4 pr-6">
                <div className="flex items-center gap-2">
                  FIRST NAME
                  {/* <ArrowDown size={16} className="text-gray-400" /> */}
                </div>
              </th>
              <th className="pb-4 pr-6">LAST NAME</th>
              <th className="pb-4">TRACK</th>
              <th className="pb-4">SCORE</th>
            </tr>
          </thead>
          <tbody>
          {studentDetails?.processedData?.map((student, index) => (
            <tr key={index} className="border-b">
              <td className="py-4 pr-6">
              <svg onClick={() => handleViewStudent(student)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer hover:text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              </td>
              <td className="py-4 pr-6">{student.studentAddress}</td>
              <td className="py-4 pr-6">{student.firstname}</td>
              <td className="py-4 pr-6">{student.lastname}</td>
              <td className="py-4">{student.track === 1 ? "Web3" : "Web2"}</td>
              <td className="py-4">{Number(student.finalScore)}</td>
            </tr>
          ))}
        </tbody>
        {/* Modal */}
        {isModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Student Details</h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedStudent.firstname} {selectedStudent.lastname}</p>
                <p><strong>Address:</strong> {selectedStudent.studentAddress}</p>
                <p><strong>Track:</strong> {selectedStudent.track === 1 ? "Web3" : "Web2"}</p>
                <p><a className="text-blue-500 underline" href={selectedStudent.twitter}><strong>Twitter</strong></a></p>
                <p><a className="text-blue-500 underline" href={selectedStudent.linkedin}><strong>LinkedIn</strong> </a></p>
                <p><a className="text-blue-500 underline" href={selectedStudent.github}><strong>GitHub</strong> </a></p>
                <div className="mt-4">
                  <label className="block mb-2">Add Student Score</label>
                  <input 
                    type="number" 
                    value={studentScore}
                    onChange={(e) => setStudentScore(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter score"
                  />
                  <button 
                    onClick={handleAddScore}
                    className="mt-2 w-full bg-blue-600 text-white p-2 rounded"
                  >
                    Submit Score
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full bg-gray-200 p-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
        </table>
      </div>
    </div>
  );
};

export default Students;
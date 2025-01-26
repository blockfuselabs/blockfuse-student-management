import React, { useState, useEffect } from "react";
import { 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from "wagmi";
import { ChevronDown, X } from "lucide-react";

// Import your ABI from the JSON file
import CONTRACT_ABI from '../../smart_contract/SMSAbi.json';
import { useAssessmentService } from "../../hooks/useStudentsAssesmentService";

// Enum for Track (based on contract)
enum Track {
  WEB2,
  WEB3
}

enum Gender {
  MALE,
  FEMALE
}

// Interfaces
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

const CONTRACT_ADDRESS = "0x071215bd2c5bc7042b8C9151D4aC2Bc4DEF20d9C" as `0x${string}`;

const Students: React.FC = () => {
  // State Management
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const assessmentService = useAssessmentService();

  // New Student State
  const [newStudent, setNewStudent] = useState<NewStudent>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    track: "",
    address: "",
    walletAddress: "",
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

  const getStudentsByTrack = (trackIndex: number) => {
    const addressesArray = cohort.processedData?.[6];
    if (!addressesArray || !Array.isArray(addressesArray)) {
      console.error("Invalid data structure or no track data available.");
      return [];
    }
    return addressesArray[trackIndex] || [];
  };

  console.log("students: ", getStudentsByTrack(0))

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
                <X size={24} />
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
    </div>
  );
};

export default Students;
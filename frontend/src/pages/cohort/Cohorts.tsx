import React, { useState, useEffect } from 'react';
import { 
  useWriteContract, 
  useReadContract, 
  useAccount 
} from 'wagmi';
import { Plus, Users, Search, AlertCircle } from 'lucide-react';

// Import ABI and contract details
import SMSAbi from '../../smart_contract/SMSAbi.json';

// Contract Configuration
const CONTRACT_ADDRESS = "0x3Db767d0407e1fB7d82dA095702937502563910A" as `0x${string}`;

// Type Definitions
interface Track {
  id: string;
  name: string;
  trackNumber: number;
}

interface Cohort {
  id: number;
  name: string;
  startDate: number;
  endDate: number;
  duration: number;
  tracks: Track[];
  studentCount: number;
}

interface CohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (startDate: number, endDate: number) => void;
  title: string;
  buttonText: string;
}

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (trackNumber: number) => void;
  cohortName: string;
}

// Constant Definitions
const TRACK_OPTIONS = [
  { value: '0', label: 'Web2' },
  { value: '1', label: 'Web3' },
];

// Modal Components
const CohortModal: React.FC<CohortModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  buttonText,
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
    onSubmit(startTimestamp, endTimestamp);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={!startDate || !endDate}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrackModal: React.FC<TrackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cohortName,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedTrack) {
      onSubmit(parseInt(selectedTrack));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Add Track to {cohortName}</h2>
        <select
          value={selectedTrack}
          onChange={(e) => setSelectedTrack(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="">Select Track</option>
          {TRACK_OPTIONS.map((track) => (
            <option key={track.value} value={track.value}>
              {track.label}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-4 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={!selectedTrack}
          >
            Add Track
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Cohort Page Component
const CohortPage: React.FC = () => {
  // const account = useAccount();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCohortModal, setShowNewCohortModal] = useState(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);

  // Contract Write Hooks
  const { 
    writeContract: createCohort, 
    isPending: isCreatingCohort,
    error: createCohortError 
  } = useWriteContract();

  const { 
    writeContract: addTrackToCohort, 
    isPending: isAddingTrack,
    error: addTrackError 
  } = useWriteContract();

  // Read Cohorts Contract Hook
  const { data: cohortCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SMSAbi,
    functionName: 'cohortCount',
  });
  
  const { data: cohortData, refetch, error: readCohortError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SMSAbi,
    functionName: 'getAllCohorts',
  });

  console.log('DATA NEW:', cohortData);

  // Transform Contract Data
// Transform Contract Data
// useEffect(() => {
//   console.log('Raw cohortData:', cohortData); // Debugging
//   if (cohortData && Array.isArray(cohortData)) {
//     console.log("startdate: ", cohortData)
//     // console.log("startdate: ", cohortData[2], Number(cohortData[2]),  new Date(Number(cohortData[2]) * 1000).toLocaleDateString())
//     // console.log("enddate: ", cohortData[3], Number(cohortData[3]),  new Date(Number(cohortData[3]) * 1000).toLocaleDateString())
//     // console.log("duration: ", cohortData[4], Number(cohortData[4]),  new Date(Number(cohortData[4]) * 1000).toLocaleDateString())

//     const transformedCohorts = cohortData.map((cohort) => {
//       console.log(cohort)
//       const startDate = cohort.startDate
//         ? new Date(Number(cohort.startDate) * 1000).toLocaleDateString()
//         : 'Invalid Date';
//       const endDate = cohort.endDate
//         ? new Date(Number(cohort.endDate) * 1000).toLocaleDateString()
//         : 'Invalid Date';

//       return {
//         id: Number(cohort.id),
//         name: `Cohort ${cohort.id}`,
//         startDate,
//         endDate,
//         duration:
//           cohort.startDate && cohort.endDate
//             ? Math.round((Number(cohort.endDate) - Number(cohort.startDate)) / 86400)
//             : 0,
//         tracks: cohort.tracks
//           ? cohort.tracks.map((track: any) => ({
//               id: track.id.toString(),
//               name: TRACK_OPTIONS[Number(track.trackNumber)]?.label || 'Unknown',
//               trackNumber: Number(track.trackNumber),
//             }))
//           : [],
//         studentCount: Number(cohort.studentCount || 0),
//       };
//     });

//     setCohorts(transformedCohorts);
//     setIsLoading(false);
//   } else {
//     setCohorts([]);
//     setIsLoading(false);
//   }
// }, [cohortData]);


useEffect(() => {
  console.log("Raw cohortData:", cohortData); // Debugging

  if (cohortData && Array.isArray(cohortData)) {
    const numCohorts = (cohortData[0] as (bigint | number)[])?.length || 0;

    const groupedData: (bigint | number)[][] = Array.from({ length: numCohorts }, () => []);

    cohortData.forEach((item: (bigint | number)[]) => {
      item.forEach((value: bigint | number, index: number) => {
        groupedData[index].push(value || BigInt(0));
      });
    });
 
    console.log("Grouped Data:", groupedData);

    const transformedCohorts = groupedData.map((cohort, index) => {
      if (Array.isArray(cohort)) {

        const id = cohort[0] || BigInt(0);
        const totalStudents = cohort[1] || BigInt(0);
        const startDateRaw = cohort[2] || BigInt(0); // start date is at index 2
        const endDateRaw = cohort[3] || BigInt(0); // end date is at index 3
        const durationRaw = cohort[4] || BigInt(0); // duration is at index 4
        const tracksRaw = cohort[5] || []; // tracks data is at index 5
        console.log("Test", cohort)

        const startDate =
          startDateRaw && startDateRaw !== BigInt(0)
            ? new Date(Number(startDateRaw) * 1000).toLocaleDateString()
            : "Invalid Date";

        const endDate =
          endDateRaw && endDateRaw !== BigInt(0)
            ? new Date(Number(endDateRaw) * 1000).toLocaleDateString()
            : "Invalid Date";

        const duration =
          durationRaw && durationRaw !== BigInt(0)
            ? new Date(Number(durationRaw) * 1000).toLocaleDateString()
            : "Invalid Date";

        const tracks =
          Array.isArray(tracksRaw) && tracksRaw.length > 0
            ? tracksRaw.map((track) => {
                const trackName = TRACK_OPTIONS[Number(track)] || "Unknown";
                return {
                  id: track?.toString() || "0",
                  name: trackName.label,
                  trackNumber: Number(track),
                };
              })
            : [{ id: "0", name: "no track", trackNumber: 0 }];

        return {
          id,
          name: `Cohort ${id}`,
          startDate,
          endDate,
          duration,
          tracks,
          studentCount: totalStudents,
        };
      } else {
        return {
          id: index + 1,
          name: `Cohort ${index + 1}`,
          startDate: "Invalid Date",
          endDate: "Invalid Date",
          duration: 0,
          tracks: [],
          studentCount: 0,
        };
      }
    });

    console.log("Transformed Cohorts:", transformedCohorts); // Debugging transformed data
    setCohorts(transformedCohorts);
    setIsLoading(false);
  } else {
    setCohorts([]); // Handle case where cohortData is invalid or empty
    setIsLoading(false);
  }
}, [cohortData]);

  
  

  // Create Cohort Handler
  const handleCreateCohort = (startDate: number, endDate: number) => {
    createCohort({
      address: CONTRACT_ADDRESS,
      abi: SMSAbi,
      functionName: 'createCohort',
      args: [BigInt(startDate), BigInt(endDate)],
    });
  };

  // Add Track Handler
  const handleAddTrack = (trackNumber: number) => {
    if (selectedCohort) {
      addTrackToCohort({
        address: CONTRACT_ADDRESS,
        abi: SMSAbi,
        functionName: 'addTrackToCohort',
        args: [BigInt(selectedCohort.id), BigInt(trackNumber)],
      });
    }
  };

  // Filtered Cohorts
  const filteredCohorts = cohorts.filter((cohort) =>
    cohort.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cohort Management</h1>
          <p className="text-gray-600">Manage cohorts and tracks</p>
        </div>
        <button
          onClick={() => setShowNewCohortModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#233255] text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Cohort
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search cohorts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {/* Error Handling */}
      {(createCohortError || addTrackError || readCohortError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <AlertCircle className="h-5 w-5 inline-block mr-2" />
          {createCohortError?.message || 
           addTrackError?.message || 
           readCohortError?.message}
        </div>
      )}

      {/* Cohort List */}
      {!isLoading && filteredCohorts.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredCohorts.map((cohort) => (
      <div key={cohort.id} className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{cohort.name}</h3>
        <div className="space-y-2">
          {/* <div>
            <strong>ID:</strong> {cohort.id}
          </div> */}
          <div>
            <strong>Start Date:</strong> {cohort.startDate}
          </div>
          <div>
            <strong>End Date:</strong> {cohort.endDate}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span>{cohort.studentCount} Students</span>
          </div>
          <div>
            <strong>Tracks:</strong>
            <div className="flex gap-2 mt-2">
              {cohort.tracks.map((track) => (
                <span
                  key={track.id}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {track.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedCohort(cohort);
            setShowAddTrackModal(true);
          }}
          className="mt-4 w-full py-2 bg-[#233255] text-white rounded hover:bg-blue-600"
        >
          Add Track
        </button>
      </div>
    ))}
  </div>
)}
      {/* Modals */}
      <CohortModal
        isOpen={showNewCohortModal}
        onClose={() => setShowNewCohortModal(false)}
        onSubmit={handleCreateCohort}
        title="Create New Cohort"
        buttonText="Create"
      />

      {selectedCohort && (
        <TrackModal
          isOpen={showAddTrackModal}
          onClose={() => {
            setShowAddTrackModal(false);
            setSelectedCohort(null);
          }}
          onSubmit={handleAddTrack}
          cohortName={selectedCohort.name}
        />
      )}
    </div>
  );
};

export default CohortPage;
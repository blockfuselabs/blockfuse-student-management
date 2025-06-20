import React, { useState, useEffect } from 'react';
import { Plus, Users, BookOpen, Search } from 'lucide-react';

// Types
interface Track {
  id: string;
  name: string;
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

// Track Options
const TRACK_OPTIONS = [
  { value: '0', label: 'Frontend' },
  { value: '1', label: 'Backend' },
  { value: '2', label: 'Cloud' },
  { value: '3', label: 'Product Design' },
];

// CohortModal Component
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
    const startTimestamp = new Date(startDate).getTime() / 1000;
    const endTimestamp = new Date(endDate).getTime() / 1000;
    onSubmit(startTimestamp, endTimestamp);
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// TrackModal Component
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
      setSelectedTrack('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Add Track to {cohortName}</h2>
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
    </div>
  );
};

// CohortCard Component
const CohortCard: React.FC<{
  cohort: Cohort;
  onAddTrack: () => void;
}> = ({ cohort, onAddTrack }) => {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium">{cohort.name}</h3>
          <button
            onClick={onAddTrack}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            Add Track
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={16} />
            <span>{cohort.studentCount} Students</span>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <div>Start: {formatDate(cohort.startDate)}</div>
            <div>End: {formatDate(cohort.endDate)}</div>
            <div>Duration: {cohort.duration} days</div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium mb-2">Tracks:</h4>
            <div className="space-y-2">
              {cohort.tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <BookOpen size={16} className="text-gray-600" />
                  <span>{track.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main CohortPage Component
const CohortPage: React.FC = () => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [showNewCohortModal, setShowNewCohortModal] = useState(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Mock cohort service functions (replace with your actual service)
  const mockCohortService = {
    fetchCohorts: async () => {
      // Simulate API call
      const mockCohorts: Cohort[] = [
        {
          id: 1,
          name: 'Cohort 2024A',
          startDate: Date.now() / 1000,
          endDate: (Date.now() + 90 * 24 * 60 * 60 * 1000) / 1000,
          duration: 90,
          tracks: [{ id: '1', name: 'Frontend' }],
          studentCount: 25,
        },
        // Add more mock cohorts here
      ];
      return mockCohorts;
    },
    createCohort: async (startDate: number, endDate: number) => {
      // Simulate API call
      const newCohort: Cohort = {
        id: cohorts.length + 1,
        name: `Cohort ${new Date().getFullYear()}${String.fromCharCode(65 + cohorts.length)}`,
        startDate,
        endDate,
        duration: Math.round((endDate - startDate) / (24 * 60 * 60)),
        tracks: [],
        studentCount: 0,
      };
      setCohorts([...cohorts, newCohort]);
    },
    addTrackToCohort: async (cohortId: number, trackNumber: number) => {
      // Simulate API call
      const trackOption = TRACK_OPTIONS[trackNumber];
      const newTrack: Track = {
        id: `${cohortId}-${trackNumber}`,
        name: trackOption.label,
      };
      
      setCohorts(prevCohorts =>
        prevCohorts.map(cohort =>
          cohort.id === cohortId
            ? { ...cohort, tracks: [...cohort.tracks, newTrack] }
            : cohort
        )
      );
    },
  };

  // Load cohorts
  useEffect(() => {
    const loadCohorts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCohorts = await mockCohortService.fetchCohorts();
        setCohorts(fetchedCohorts);
      } catch (err) {
        setError('Failed to load cohorts');
        console.error('Error loading cohorts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCohorts();
  }, []);

  // Handlers
  const handleCreateCohort = async (startDate: number, endDate: number) => {
    try {
      await mockCohortService.createCohort(startDate, endDate);
      setShowNewCohortModal(false);
    } catch (error) {
      console.error('Error creating cohort:', error);
    }
  };

  const handleAddTrack = async (trackNumber: number) => {
    try {
      if (selectedCohort) {
        await mockCohortService.addTrackToCohort(selectedCohort.id, trackNumber);
        setShowAddTrackModal(false);
        setSelectedCohort(null);
      }
    } catch (error) {
      console.error('Error adding track:', error);
    }
  };

  const filteredCohorts = cohorts.filter((cohort) =>
    cohort.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 items-start">
          <div>
            <h1 className="text-2xl font-bold">Cohort Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your cohorts, tracks, and students
            </p>
          </div>
          <button
            onClick={() => setShowNewCohortModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New Cohort
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search cohorts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <p>Total Cohorts: {cohorts.length}</p>
            <p>Filtered Cohorts: {filteredCohorts.length}</p>
            <p>Search Query: {searchQuery || 'none'}</p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-8">Loading cohorts...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : filteredCohorts.length === 0 ? (
          <div className="text-center py-8">
            {searchQuery ? 'No cohorts found matching your search' : 'No cohorts found'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCohorts.map((cohort) => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                onAddTrack={() => {
                  setSelectedCohort(cohort);
                  setShowAddTrackModal(true);
                }}
              />
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

        {/* Toast Container - Add if you're using react-toastify */}
        {/* <ToastContainer position="bottom-right" /> */}
      </div>
    </div>
  );
};

// Hook for managing cohort service
interface UseCohortServiceReturn {
  cohortCount: number;
  fetchCohorts: () => Promise<Cohort[]>;
  createCohort: (startDate: number, endDate: number) => Promise<void>;
  addTrackToCohort: (cohortId: number, trackNumber: number) => Promise<void>;
  watchCohortEvents: (callback: () => void) => (() => void) | undefined;
}

const useCohortService = (): UseCohortServiceReturn => {
  // This is a mock implementation - replace with your actual API calls
  const [cohortCount, setCohortCount] = useState<number>(0);

  const fetchCohorts = async (): Promise<Cohort[]> => {
    // Mock API call - replace with your actual API endpoint
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockCohorts: Cohort[] = [
        {
          id: 1,
          name: "Cohort 2024A",
          startDate: Date.now() / 1000,
          endDate: (Date.now() + 90 * 24 * 60 * 60 * 1000) / 1000,
          duration: 90,
          tracks: [
            { id: "1", name: "Frontend" },
            { id: "2", name: "Backend" }
          ],
          studentCount: 32
        },
        {
          id: 2,
          name: "Cohort 2024B",
          startDate: (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000,
          endDate: (Date.now() + 120 * 24 * 60 * 60 * 1000) / 1000,
          duration: 90,
          tracks: [
            { id: "3", name: "Cloud" },
            { id: "4", name: "Product Design" }
          ],
          studentCount: 28
        },
        // Add more mock cohorts as needed
      ];

      setCohortCount(mockCohorts.length);
      return mockCohorts;
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      throw error;
    }
  };

  const createCohort = async (startDate: number, endDate: number): Promise<void> => {
    // Mock API call - replace with your actual API endpoint
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCohortCount(prev => prev + 1);
    } catch (error) {
      console.error("Error creating cohort:", error);
      throw error;
    }
  };

  const addTrackToCohort = async (cohortId: number, trackNumber: number): Promise<void> => {
    // Mock API call - replace with your actual API endpoint
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Implementation would update the cohort with the new track
    } catch (error) {
      console.error("Error adding track:", error);
      throw error;
    }
  };

  const watchCohortEvents = (callback: () => void): (() => void) | undefined => {
    // Mock implementation - replace with your actual event watching logic
    // This could be websockets, polling, or other real-time updates
    const interval = setInterval(callback, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  };

  return {
    cohortCount,
    fetchCohorts,
    createCohort,
    addTrackToCohort,
    watchCohortEvents,
  };
};

export {
  CohortPage as default,
  useCohortService,
  type Cohort,
  type Track,
  type CohortModalProps,
  type TrackModalProps,
};
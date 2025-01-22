import React, { useState } from 'react';
import { Plus, Users, BookOpen, Search } from 'lucide-react';

interface Track {
  id: string;
  name: string;
}

interface Cohort {
  id: number;
  name: string;
  tracks: Track[];
  studentCount: number;
}

interface CohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  title: string;
  buttonText: string;
  inputPlaceholder: string;
  inputValue: string;
  setInputValue: (value: string) => void;
}

const Modal: React.FC<CohortModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  buttonText,
  inputPlaceholder,
  inputValue,
  setInputValue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-[#2A3355] mb-4">{title}</h2>
        <input
          type="text"
          placeholder={inputPlaceholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(inputValue)}
            className="px-4 py-2 bg-[#1E2A55] text-white rounded-lg hover:bg-[#2A3355]"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Cohort: React.FC = () => {
  const [cohorts, setCohorts] = useState<Cohort[]>([
    {
      id: 1,
      name: "Cohort 2024A",
      tracks: [
        { id: "1", name: "Frontend" },
        { id: "2", name: "Backend" }
      ],
      studentCount: 32
    },
    {
      id: 2,
      name: "Cohort 2024B",
      tracks: [
        { id: "3", name: "UI/UX" },
        { id: "4", name: "Frontend" }
      ],
      studentCount: 28
    }
  ]);
  
  const [showNewCohortModal, setShowNewCohortModal] = useState<boolean>(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState<boolean>(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [newCohortName, setNewCohortName] = useState<string>("");
  const [newTrack, setNewTrack] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const createCohort = (name: string): void => {
    if (!name.trim()) return;
    
    const newCohort: Cohort = {
      id: cohorts.length + 1,
      name: name.trim(),
      tracks: [],
      studentCount: 0
    };
    
    setCohorts([...cohorts, newCohort]);
    setNewCohortName("");
    setShowNewCohortModal(false);
  };
  
  const addTrackToCohort = (trackName: string): void => {
    if (!selectedCohort || !trackName.trim()) return;
    
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: trackName.trim()
    };
    
    const updatedCohorts = cohorts.map(cohort => {
      if (cohort.id === selectedCohort.id) {
        return {
          ...cohort,
          tracks: [...cohort.tracks, newTrack]
        };
      }
      return cohort;
    });
    
    setCohorts(updatedCohorts);
    setNewTrack("");
    setShowAddTrackModal(false);
  };

  const filteredCohorts = cohorts.filter(cohort =>
    cohort.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 md:px-8 bg-white flex-grow min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 items-start py-6">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2A3355]">Cohort Management</h1>
          <p className="text-gray-600 mt-2">Manage your cohorts, tracks, and students</p>
        </div>
        
        <button
          onClick={() => setShowNewCohortModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E2A55] text-white rounded-lg hover:bg-[#2A3355] transition-colors"
        >
          <Plus size={20} />
          Create New Cohort
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search cohorts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A55] focus:border-transparent"
        />
      </div>

      {/* Cohorts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCohorts.map((cohort) => (
          <div key={cohort.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-[#2A3355]">{cohort.name}</h3>
              <button
                onClick={() => {
                  setSelectedCohort(cohort);
                  setShowAddTrackModal(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Add Track
              </button>
            </div>

            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Users size={16} />
              <span>{cohort.studentCount} Students</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#2A3355] mb-2">Tracks:</h4>
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
        ))}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showNewCohortModal}
        onClose={() => setShowNewCohortModal(false)}
        onSubmit={createCohort}
        title="Create New Cohort"
        buttonText="Create"
        inputPlaceholder="Cohort Name"
        inputValue={newCohortName}
        setInputValue={setNewCohortName}
      />

      <Modal
        isOpen={showAddTrackModal}
        onClose={() => setShowAddTrackModal(false)}
        onSubmit={addTrackToCohort}
        title={`Add Track to ${selectedCohort?.name}`}
        buttonText="Add Track"
        inputPlaceholder="Track Name"
        inputValue={newTrack}
        setInputValue={setNewTrack}
      />
    </div>
  );
};

export default Cohort;
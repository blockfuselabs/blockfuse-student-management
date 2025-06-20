import React, { useState } from 'react';
import { Users} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  cohort: string;
  track: string;
}

interface AttendanceRecord {
  id: number;
  studentId: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  cohort: string;
  track: string;
}

interface FilterState {
  cohort: string;
  track: string;
  date: string;
}

const Attendance: React.FC = () => {
  // Sample data - replace with actual data from your backend
  const [students] = useState<Student[]>([
    { id: 1, name: "John Doe", cohort: "Cohort 2024A", track: "Frontend" },
    { id: 2, name: "Jane Smith", cohort: "Cohort 2024A", track: "Frontend" },
    { id: 3, name: "Mike Johnson", cohort: "Cohort 2024B", track: "Backend" },
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    cohort: "",
    track: "",
    date: new Date().toISOString().split('T')[0],
  });

  // Get unique cohorts and tracks for filters
  const cohorts = Array.from(new Set(students.map(s => s.cohort)));
  const tracks = Array.from(new Set(students.map(s => s.track)));

  // Function to log attendance
  const logAttendance = (studentId: number, status: 'present' | 'absent' | 'late') => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const existingRecord = attendanceRecords.find(
      record => 
        record.studentId === studentId && 
        record.date === filters.date
    );

    if (existingRecord) {
      setAttendanceRecords(records =>
        records.map(record =>
          record.id === existingRecord.id
            ? { ...record, status }
            : record
        )
      );
    } else {
      const newRecord: AttendanceRecord = {
        id: Date.now(),
        studentId,
        date: filters.date,
        status,
        cohort: student.cohort,
        track: student.track
      };
      setAttendanceRecords(records => [...records, newRecord]);
    }
  };

  // Function to check if student has attendance for current date
  const hasAttendance = (studentId: number): AttendanceRecord | undefined => {
    return attendanceRecords.find(
      record => 
        record.studentId === studentId && 
        record.date === filters.date
    );
  };

  // Function to get filtered students
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#2A3355]">Attendance Management</h1>
          <p className="text-gray-600 mt-2">Track and manage student attendance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters(f => ({ ...f, date: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A55]"
          />
        </div>

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
      </div>
              {/* Summary Card */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {['present', 'absent', 'late'].map((status) => {
          const count = attendanceRecords.filter(
            record => 
              record.date === filters.date && 
              record.status === status &&
              (!filters.cohort || record.cohort === filters.cohort) &&
              (!filters.track || record.track === filters.track)
          ).length;
          
          return (
            <div key={status} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-[#2A3355] capitalize">{status}</h3>
              <p className="mt-2 text-3xl font-bold text-[#2A3355]">{count}</p>
              <p className="text-gray-600">students</p>
            </div>
          );
        })}
      </div>

      {/* Attendance Table */}
      <div className="bg-white mt-8 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Cohort</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Track</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getFilteredStudents().map(student => {
                const attendance = hasAttendance(student.id);
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${attendance?.status === 'present' ? 'bg-green-100 text-green-800' : 
                          attendance?.status === 'absent' ? 'bg-red-100 text-red-800' : 
                          attendance?.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {attendance?.status || 'Not Marked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => logAttendance(student.id, 'present')}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => logAttendance(student.id, 'absent')}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => logAttendance(student.id, 'late')}
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    
    </div>
  );
};

export default Attendance;
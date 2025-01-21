import { useState } from "react";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";

const Profile = () => {
  const [currentWeek, setCurrentWeek] = useState("Week 6");
  const [showWeeks, setShowWeeks] = useState(false);
  const [currentSyllabusSlide, setSyllabusSlide] = useState(0);
  const [currentAssignmentSlide, setAssignmentSlide] = useState(0);

  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];

  const syllabusItems = [
    {
      title: "Basic Design",
      subtitle: "Introduction to Graphics Design",
      status: "completed",
    },
    {
      title: "Basic Design",
      subtitle: "Introduction to Graphics Design",
      status: "pending",
    },
    {
      title: "Basic Design",
      subtitle: "Introduction to Graphics Design",
      status: "pending",
    },
    {
      title: "Advanced Design",
      subtitle: "Advanced Graphics Design",
      status: "pending",
    },
    {
      title: "Expert Design",
      subtitle: "Expert Graphics Design",
      status: "pending",
    },
  ];

  const assignments = [
    {
      startDate: "25th March 2022",
      endDate: "8th April 2022",
      submitted: 32,
      notSubmitted: 18,
    },
    {
      startDate: "25th March 2022",
      endDate: "8th April 2022",
      submitted: 32,
      notSubmitted: 18,
    },
    {
      startDate: "25th March 2022",
      endDate: "8th April 2022",
      submitted: 32,
      notSubmitted: 18,
    },
    {
      startDate: "26th March 2022",
      endDate: "9th April 2022",
      submitted: 28,
      notSubmitted: 22,
    },
  ];

  const nextSyllabusSlide = () => {
    setSyllabusSlide((prev) =>
      prev + 3 >= syllabusItems.length ? 0 : prev + 3
    );
  };

  const prevSyllabusSlide = () => {
    setSyllabusSlide((prev) =>
      prev - 3 < 0 ? Math.max(syllabusItems.length - 3, 0) : prev - 3
    );
  };

  const nextAssignmentSlide = () => {
    setAssignmentSlide((prev) =>
      prev + 3 >= assignments.length ? 0 : prev + 3
    );
  };

  const prevAssignmentSlide = () => {
    setAssignmentSlide((prev) =>
      prev - 3 < 0 ? Math.max(assignments.length - 3, 0) : prev - 3
    );
  };

  return (
    <div className="px-4 md:px-8 bg-white flex-grow min-w-0">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 items-start">
        <div className="w-full lg:w-auto space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#2A3355]">Good Morning</h1>
            <span className="text-2xl">👋</span>
          </div>
          <h2 className="text-xl text-[#2A3355] mt-1">Mr. Scarface</h2>

          {/* Syllabus Guide */}
          <div className="w-full">
            <h3 className="text-lg font-medium text-[#2A3355]">
              Syllabus Guide
            </h3>
            <div className="bg-[#1E2A55] rounded-lg p-4 md:p-6 relative">
              <button
                onClick={prevSyllabusSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-3 overflow-hidden">
                {syllabusItems
                  .slice(currentSyllabusSlide, currentSyllabusSlide + 3)
                  .map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 md:p-6 rounded-lg ${
                        index === 0 ? "bg-yellow-50" : "bg-white"
                      } flex-1 min-w-[200px] md:min-w-[250px]`}
                    >
                      <h4 className="font-medium text-[#2A3355] mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600">{item.subtitle}</p>
                    </div>
                  ))}
              </div>
              <button
                onClick={nextSyllabusSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Students Card */}
        <div className="bg-white rounded-lg shadow-lg w-full lg:w-80 flex-shrink-0">
          <div className="px-6 py-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h3 className="text-lg font-medium text-[#2A3355]">STUDENTS</h3>
              <div className="text-sm space-x-2">
                <span className="text-gray-600">MALE (61%)</span>
                <span className="text-gray-600">FEMALE (39%)</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-center my-6 text-[#2A3355]">
              308
            </div>

            <div>
              <h4 className="font-medium text-[#2A3355]">Student Rankings</h4>
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-medium">
                    {num}
                  </div>
                  <span className="text-gray-600">ActiveEdge Technologies</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="mb-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-[#2A3355]">
            Current Assignments
          </h3>
          <ChevronRight size={20} className="text-gray-400" />
        </div>
        <div className="relative">
          <button
            onClick={prevAssignmentSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
            {assignments
              .slice(currentAssignmentSlide, currentAssignmentSlide + 3)
              .map((assignment, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 mb-4">
                  <h4 className="font-medium text-[#2A3355] mb-1">
                    Basic Design
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    Introduction to Graphics Design
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500 mb-6 gap-2">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{assignment.startDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{assignment.endDate}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div className="bg-blue-50 px-4 py-2 rounded-lg text-sm text-blue-600 text-center">
                      {assignment.submitted} Submitted
                    </div>
                    <div className="bg-yellow-50 px-4 py-2 rounded-lg text-sm text-yellow-600 text-center">
                      {assignment.notSubmitted} Not Submitted
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <button
            onClick={nextAssignmentSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="mt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-lg font-medium text-[#2A3355]">
            Student Attendance
          </h3>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm"
              onClick={() => setShowWeeks(!showWeeks)}
            >
              {currentWeek}
              <ChevronDown size={16} />
            </button>
            {showWeeks && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-20">
                {weeks.map((week) => (
                  <button
                    key={week}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => {
                      setCurrentWeek(week);
                      setShowWeeks(false);
                    }}
                  >
                    {week}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg px-4 md:px-6 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-4 pr-4 font-medium">Name</th>
                <th className="py-4 px-4 font-medium">Mon</th>
                <th className="py-4 px-4 font-medium">Tues</th>
                <th className="py-4 px-4 font-medium">Wed</th>
                <th className="py-4 px-4 font-medium">Thurs</th>
                <th className="py-4 px-4 font-medium">Fri</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-4 pr-4">ActivEdge Technologies</td>
                <td className="py-4 px-4">Present</td>
                <td className="py-4 px-4 text-red-500">Absent</td>
                <td className="py-4 px-4">Present</td>
                <td className="py-4 px-4">Present</td>
                <td className="py-4 px-4"></td>
              </tr>
              <tr className="border-t">
                <td className="py-4 pr-4">ActivEdge Technologies</td>
                <td className="py-4 px-4 text-red-500">Absent</td>
                <td className="py-4 px-4">Present</td>
                <td className="py-4 px-4">Present</td>
                <td className="py-4 px-4">Present</td>
                <td className="py-4 px-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;
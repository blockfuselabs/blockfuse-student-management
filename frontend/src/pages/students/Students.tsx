import { useState } from "react";
import { ChevronDown, Search, Printer, ArrowDown, X } from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  department: string;
}

interface NewStudent {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  department: string;
  address: string;
  class: string;
}

interface ExportData {
  "Ref ID": string;
  "First Name": string;
  "Last Name": string;
  Gender: string;
  Department: string;
}

type Tab = {
  id: "ALL" | "PRESENT" | "ALUMNI";
  label: string;
  count: number;
};

const Students = () => {
  const [selectedTab, setSelectedTab] = useState<Tab["id"]>("ALL");
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [showGenderDropdown, setShowGenderDropdown] = useState<boolean>(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] =
    useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [showExportDropdown, setShowExportDropdown] = useState<boolean>(false);

  const [newStudent, setNewStudent] = useState<NewStudent>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    department: "",
    address: "",
    class: "",
  });

  // Sample data - in a real app, this would come from an API
  const allStudents: Student[] = [
    {
      id: "STU432101",
      firstName: "Micheal",
      lastName: "Armstrong",
      gender: "Male",
      department: "Science",
    },
    {
      id: "STU432102",
      firstName: "Michelle",
      lastName: "Livingston",
      gender: "Female",
      department: "Technology",
    },
    {
      id: "STU432103",
      firstName: "John",
      lastName: "Smith",
      gender: "Male",
      department: "Science",
    },
    {
      id: "STU432104",
      firstName: "Sarah",
      lastName: "Johnson",
      gender: "Female",
      department: "Technology",
    },
    // Add more sample data to test pagination
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `STU4321${i + 5}`,
      firstName: `Student${i + 5}`,
      lastName: `LastName${i + 5}`,
      gender: i % 2 === 0 ? "Male" : "Female",
      department: i % 2 === 0 ? "Science" : "Technology",
    })),
  ];

  const filteredStudents = allStudents.filter((student) => {
    const matchesGender = !selectedGender || student.gender === selectedGender;
    const matchesDepartment =
      !selectedDepartment || student.department === selectedDepartment;
    return matchesGender && matchesDepartment;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const generatePaginationNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const handlePrint = () => {
    const printContent: ExportData[] = filteredStudents.map((student) => ({
      "Ref ID": student.id,
      "First Name": student.firstName,
      "Last Name": student.lastName,
      Gender: student.gender,
      Department: student.department,
    }));

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Students List</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Students List</h2>
          <table>
            <thead>
              <tr>
                ${Object.keys(printContent[0])
                  .map((key) => `<th>${key}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${printContent
                .map(
                  (student) => `
                <tr>
                  ${Object.values(student)
                    .map((value) => `<td>${value}</td>`)
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExport = (format: "csv") => {
    const exportData: ExportData[] = filteredStudents.map((student) => ({
      "Ref ID": student.id,
      "First Name": student.firstName,
      "Last Name": student.lastName,
      Gender: student.gender,
      Department: student.department,
    }));

    if (format === "csv") {
      const headers = Object.keys(exportData[0]);
      const csv = [
        headers.join(","),
        ...exportData.map((row) => {
          return headers
            .map((header) => {
              // Type-safe way to access the properties
              const key = header as keyof ExportData;
              return row[key];
            })
            .join(",");
        }),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "students.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    }

    setShowExportDropdown(false);
  };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New student:", newStudent);
    setShowCreateModal(false);
    setNewStudent({
      firstName: "",
      lastName: "",
      email: "",
      gender: "",
      department: "",
      address: "",
      class: "",
    });
  };

  const tabs: Tab[] = [
    { id: "ALL", label: "ALL", count: filteredStudents.length },
    { id: "PRESENT", label: "PRESENT", count: filteredStudents.length },
    { id: "ALUMNI", label: "ALUMNI", count: 0 },
  ];

  return (
    <div className="p-6 bg-white">
      {/* Header Actions */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowGenderDropdown(!showGenderDropdown)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                selectedGender ? "bg-blue-50 border-blue-200" : ""
              }`}
            >
              {selectedGender || "Gender"}
              <ChevronDown size={16} />
            </button>
            {showGenderDropdown && (
              <div className="absolute mt-1 w-40 bg-white border rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedGender("Male");
                      setShowGenderDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    Male
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGender("Female");
                      setShowGenderDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    Female
                  </button>
                  {selectedGender && (
                    <button
                      onClick={() => {
                        setSelectedGender("");
                        setShowGenderDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
              className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                selectedDepartment ? "bg-blue-50 border-blue-200" : ""
              }`}
            >
              {selectedDepartment || "Department"}
              <ChevronDown size={16} />
            </button>
            {showDepartmentDropdown && (
              <div className="absolute mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedDepartment("Science");
                      setShowDepartmentDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    Science
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDepartment("Technology");
                      setShowDepartmentDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    Technology
                  </button>
                  {selectedDepartment && (
                    <button
                      onClick={() => {
                        setSelectedDepartment("");
                        setShowDepartmentDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <Printer size={20} />
            PRINT
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"
            >
              EXPORT
              <ChevronDown size={16} />
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport("csv")}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
          >
            CREATE STUDENT
          </button>
        </div>
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

            <form onSubmit={handleSubmit} className="p-6">
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
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newStudent.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={newStudent.gender}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={newStudent.department}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Science">Science</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
                  <input
                    type="text"
                    name="class"
                    value={newStudent.class}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={newStudent.address}
                  onChange={handleInputChange}
                  rows={3} 
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

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
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  Create Student
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
            onClick={() => setSelectedTab(tab.id)}
            className={`pb-4 px-2 relative ${
              selectedTab === tab.id ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-sm text-gray-400">{tab.count}</span>
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
                <input type="checkbox" className="rounded" />
              </th>
              <th className="pb-4 pr-6">REF ID</th>
              <th className="pb-4 pr-6">
                <div className="flex items-center gap-2">
                  FIRST NAME
                  <ArrowDown size={16} className="text-gray-400" />
                </div>
              </th>
              <th className="pb-4 pr-6">LAST NAME</th>
              <th className="pb-4 pr-6">GENDER</th>
              <th className="pb-4">DEPARTMENT</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((student, index) => (
              <tr key={index} className="border-b">
                <td className="py-4 pr-6">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="py-4 pr-6">{student.id}</td>
                <td className="py-4 pr-6">{student.firstName}</td>
                <td className="py-4 pr-6">{student.lastName}</td>
                <td className="py-4 pr-6">{student.gender}</td>
                <td className="py-4">{student.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`w-8 h-8 flex items-center justify-center rounded-lg ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          ←
        </button>

        {generatePaginationNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => {
              if (typeof page === "number") {
                setCurrentPage(page);
              }
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : typeof page === "number"
                ? "text-gray-600 hover:bg-gray-100"
                : "text-gray-600"
            }`}
            disabled={typeof page !== "number"}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`w-8 h-8 flex items-center justify-center rounded-lg ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          →
        </button>
      </div>
    </div>
  );
};

export default Students;

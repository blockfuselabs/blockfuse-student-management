import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Globe,
  Users,
  CheckCircle,
  Calendar,
} from "lucide-react";

interface StudentInfoProps {
  student: {
    name: string;
    email: string;
    phone?: string;
    track?: string;
    cohort: string;
    status: string;
    address?: string;
    enrollmentDate?: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "text-green-600 bg-green-100";
    case "inactive":
      return "text-red-600 bg-red-100";
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "graduated":
      return "text-blue-600 bg-blue-100";
    case "evicted":
      return "text-red-600 bg-red-100";
    case "suspended":
      return "text-yellow-600 bg-yellow-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const StudentInfo: React.FC<StudentInfoProps> = ({ student }) => {
  return (
    <Card className="">
      <CardContent className="pt-6 pb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">{student.name}</h2>
          <p className="text-gray-500 text-sm mb-1">{student.email}</p>
          {student.phone && <p className="text-gray-500 text-sm mb-1">{student.phone}</p>}
          {student.address && <p className="text-gray-500 text-sm mb-1">{student.address}</p>}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border">
            <Globe className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Track</p>
              <p className="font-medium text-gray-800">{student.track || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border">
            <Users className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm text-gray-500">Cohort</p>
              <p className="font-medium text-gray-800">{student.cohort}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border">
            <Calendar className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-sm text-gray-500">Enrollment Date</p>
              <p className="font-medium text-gray-800">{student.enrollmentDate || "-"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInfo;
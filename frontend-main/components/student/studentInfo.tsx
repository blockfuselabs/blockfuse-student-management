import React from "react";
import { Card,  CardContent } from "@/components/ui/card";
import { 
  Globe, 
  Users, 
  CheckCircle, 
  Calendar,
} from "lucide-react";

const StudentInfo = () => {
  const studentData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    track: "Web 3",
    cohort: "5",
    status: "Active",
    address: "123 Main St, City, State 12345",
    enrollmentDate: "January 2024"
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
      <Card className="mt-10">
        
        <CardContent className="">
            <div className="flex flex-row justify-between">

              
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border">
                <Globe className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Track</p>
                  <p className="font-medium text-gray-800">{studentData.track}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border">
                <Users className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500">Cohort</p>
                  <p className="font-medium text-gray-800">Cohort {studentData.cohort}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(studentData.status)}`}>
                    {studentData.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border">
                <Calendar className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Enrollment Date</p>
                  <p className="font-medium text-gray-800">{studentData.enrollmentDate}</p>
                </div>
              </div>
            </div>
        
        </CardContent>
      </Card>
  );
};

export default StudentInfo;
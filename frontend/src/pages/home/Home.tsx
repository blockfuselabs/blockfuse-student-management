import React from 'react';
import AttendanceChart from '../../Components/AttendanceChart';
import icon1 from "../../assets/student.png";
import icon2 from "../../assets/training-class.png";
import icon3 from "../../assets/alphabetical-variant.png";

type StatsCardProps = {
  title: string;
  count: number;
  iconSrc: string;
  subtext: string;
};

type UserData = {
  name: string;
  id: string;
  role: string;
  gender: string;
  email: string;
};

const DashboardLayout = () => {
  const recentUsers: UserData[] = [
    {
      name: "ActiveEdge Technologies",
      id: "AET154-5671",
      role: "Teacher",
      gender: "Male",
      email: "activeedgetechnologies@gmail..."
    },
    {
      name: "ActiveEdge Technologies",
      id: "AET154-5671",
      role: "Teacher",
      gender: "Male",
      email: "activeedgetechnologies@gmail..."
    },
    {
      name: "ActiveEdge Technologies",
      id: "AET154-5671",
      role: "Teacher",
      gender: "Male",
      email: "activeedgetechnologies@gmail..."
    }
  ];

  const StatsCard: React.FC<StatsCardProps> = ({ title, count, iconSrc, subtext }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm flex items-center space-x-4">
      <div className="rounded-full p-3 bg-blue-50 flex items-center justify-center">
        <img src={iconSrc} alt={title} className="w-6 h-6 object-contain" />
      </div>
      <div>
        <h2 className="text-gray-500 text-sm uppercase">{title}</h2>
        <p className="text-xs text-gray-400">{subtext}</p>
        <p className="text-2xl font-semibold mt-1">{count}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard 
          title="STUDENTS" 
          count={308}
          iconSrc={icon1}
          subtext="MALE (2074) • FEMALE (2074)"
        />
        <StatsCard 
          title="STAFF" 
          count={100}
          iconSrc={icon2}
          subtext="MALE (50) • FEMALE (50)"
        />
        <StatsCard 
          title="SUBJECTS" 
          count={50}
          iconSrc={icon3}
          subtext="SCIENCE (25) • ARTS (25)"
        />
      </div>
  
      <AttendanceChart/>
      <div className="bg-white rounded-lg p-6 shadow-sm mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-700">Recently registered users</h2>
          <a href="#" className="text-blue-600 text-sm">view all users</a>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="pb-4">Name</th>
              <th className="pb-4">ID</th>
              <th className="pb-4">Role</th>
              <th className="pb-4">Gender</th>
              <th className="pb-4">Email</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user, index) => (
              <tr key={index} className="border-t">
                <td className="py-4">{user.name}</td>
                <td className="py-4">{user.id}</td>
                <td className="py-4">{user.role}</td>
                <td className="py-4">{user.gender}</td>
                <td className="py-4">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardLayout;
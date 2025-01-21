
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AttendanceChart = () => {
  const data = [
    { month: 'Jan', value: 60 },
    { month: 'Feb', value: 80 },
    { month: 'Mar', value: 65 },
    { month: 'Apr', value: 20 },
    { month: 'May', value: 85 },
    { month: 'Jun', value: 85 }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E293B] text-white px-3 py-2 rounded text-sm">
          {`${payload[0].value}%`}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-700 font-medium">Attendance Summary</h2>
        <div className="flex space-x-2">
          <select className="bg-gray-100 rounded px-3 py-1 text-sm text-gray-600">
            <option>Monthly</option>
          </select>
          <select className="bg-gray-100 rounded px-3 py-1 text-sm text-gray-600">
            <option>Students</option>
          </select>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              vertical={false}
              stroke="#EEE"
              strokeDasharray="3 3"
            />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={false}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0EA5E9"
              strokeWidth={2}
              fill="url(#colorValue)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;
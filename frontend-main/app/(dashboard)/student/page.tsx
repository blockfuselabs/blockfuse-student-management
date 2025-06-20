import React from 'react'
import StudentInfo from '@/components/student/studentInfo'
import AttendanceCard from '@/components/student/AttendanceCard'
import PerformanceCard from '@/components/student/PerformanceCard'

const page = () => {
  return (
    <div>
        <div className='flex items-center flex-row' >
             <h1 className="text-2xl">Good Morning,</h1>
             <span className=' ml-2  text-xl mt-2'>John Doe</span>
        </div>
       
         <StudentInfo/>
     <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
         <AttendanceCard daysPresent={20} attendanceRate="95%"  />
         <PerformanceCard finalScore={85} />
       </div>
    </div>
  )
}

export default page

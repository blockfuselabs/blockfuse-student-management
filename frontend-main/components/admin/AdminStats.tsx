import React from 'react'
import StatisticsCard from '../shared/StatsCard'
import { useGetCohorts } from '@/lib/hooks/useGetCohorts'
import { useGetAdmins } from '@/lib/hooks/useGetAdmins'

const AdminStats = () => {
  // Get real data from blockchain
  const { cohorts } = useGetCohorts()
  const { admins } = useGetAdmins()

  // Calculate stats
  const totalStudents = cohorts.reduce((sum, cohort) => sum + (cohort.students || 0), 0)
  const totalCohorts = cohorts.length
  const totalTracks = cohorts.reduce((acc, cohort) => acc + cohort.tracks.length, 0)
  const totalAdmins = admins.length

  // Calculate growth percentages (you can implement more sophisticated logic later)
  const studentGrowth = totalStudents > 0 ? 20 : 0
  const cohortGrowth = totalCohorts > 0 ? 8 : 0
  const trackGrowth = totalTracks > 0 ? 15 : 0
  const adminGrowth = totalAdmins > 0 ? 12 : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatisticsCard
        title="Total Students"
        value={totalStudents}
        growth="up"
        percentage={studentGrowth}
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 7.16C17.94 7.15 17.87 7.15 17.81 7.16C16.43 7.11 15.33 5.98 15.33 4.58C15.33 3.15 16.48 2 17.91 2C19.34 2 20.49 3.16 20.49 4.58C20.48 5.98 19.38 7.11 18 7.16Z"
              stroke="#3FC0F5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.97 14.44C18.34 14.67 19.85 14.43 20.91 13.72C22.32 12.78 22.32 11.24 20.91 10.3C19.84 9.59004 18.31 9.35003 16.94 9.59003"
              stroke="#3FC0F5"
              strokeWidth="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M5.97001 7.16C6.03001 7.15 6.10001 7.15 6.16001 7.16C7.54001 7.11 8.64001 5.98 8.64001 4.58C8.64001 3.15 7.49001 2 6.06001 2C4.63001 2 3.48001 3.16 3.48001 4.58C3.49001 5.98 4.59001 7.11 5.97001 7.16Z"
              stroke="#3FC0F5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 14.44C5.63 14.67 4.12 14.43 3.06 13.72C1.65 12.78 1.65 11.24 3.06 10.3C4.13 9.59004 5.66 9.35003 7.03 9.59003"
              stroke="#3FC0F5"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 14.63C11.94 14.62 11.87 14.62 11.81 14.63C10.43 14.58 9.33002 13.45 9.33002 12.05C9.33002 10.62 10.48 9.46997 11.91 9.46997C13.34 9.46997 14.49 10.63 14.49 12.05C14.48 13.45 13.38 14.59 12 14.63Z"
              stroke="#3FC0F5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.09 17.78C7.68 18.72 7.68 20.26 9.09 21.2C10.69 22.27 13.31 22.27 14.91 21.2C16.32 20.26 16.32 18.72 14.91 17.78C13.32 16.72 10.69 16.72 9.09 17.78Z"
              stroke="#3FC0F5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        iconBgColor="#F0F9FC"
        iconColor="#0209CC"
      />

      <StatisticsCard
        title="Total Cohorts"
        value={totalCohorts}
        growth="up"
        percentage={cohortGrowth}
        icon={
          <svg
            width="24"
            height="23"
            viewBox="0 0 24 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.16443 21.2847L7.20508 19.9592L8.53053 22.9999L11.6492 14.8135C10.0119 14.7356 8.45254 14.1898 7.28307 13.2542L4.16443 21.2847Z"
              fill="#FF8CE6"
            />
            <path
              d="M16.7169 13.2542C15.4695 14.1898 13.9881 14.7356 12.3508 14.8135L15.4695 22.9999L16.7949 19.9592L19.8356 21.2847L16.7169 13.2542Z"
              fill="#FF8CE6"
            />
            <path
              d="M18.978 7.01694C18.978 3.11864 15.8593 0 11.961 0C8.06273 0 4.94409 3.11864 4.94409 7.01694C4.94409 10.9152 8.06273 14.0339 11.961 14.0339C15.8593 14.0339 18.978 10.9152 18.978 7.01694ZM14.6898 10.9152L11.961 9.12205L9.2322 10.9152L10.4017 7.7966L8.06273 6.23728H10.7916L11.9611 3.11864L13.1306 6.23728H15.8594L13.5204 7.7966L14.6898 10.9152Z"
              fill="#FF8CE6"
            />
          </svg>
        }
        iconBgColor="#FFF4FD"
        iconColor="#4F46E5"
      />

      <StatisticsCard
        title="Total Tracks"
        value={totalTracks}
        growth="up"
        percentage={trackGrowth}
        icon={
          <svg
            width="20"
            height="21"
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.19 0.5H5.81C2.17 0.5 0 2.67 0 6.31V14.69C0 18.33 2.17 20.5 5.81 20.5H14.19C17.83 20.5 20 18.33 20 14.69V6.31C20 2.67 17.83 0.5 14.19 0.5ZM7.97 13.4L5.72 15.65C5.57 15.8 5.38 15.87 5.19 15.87C5 15.87 4.8 15.8 4.66 15.65L3.91 14.9C3.61 14.61 3.61 14.13 3.91 13.84C4.2 13.55 4.67 13.55 4.97 13.84L5.19 14.06L6.91 12.34C7.2 12.05 7.67 12.05 7.97 12.34C8.26 12.63 8.26 13.11 7.97 13.4ZM7.97 6.4L5.72 8.65C5.57 8.8 5.38 8.87 5.19 8.87C5 8.87 4.8 8.8 4.66 8.65L3.91 7.9C3.61 7.61 3.61 7.13 3.91 6.84C4.2 6.55 4.67 6.55 4.97 6.84L5.19 7.06L6.91 5.34C7.2 5.05 7.67 5.05 7.97 5.34C8.26 5.63 8.26 6.11 7.97 6.4ZM15.56 15.12H10.31C9.9 15.12 9.56 14.78 9.56 14.37C9.56 13.96 9.9 13.62 10.31 13.62H15.56C15.98 13.62 16.31 13.96 16.31 14.37C16.31 14.78 15.98 15.12 15.56 15.12ZM15.56 8.12H10.31C9.9 8.12 9.56 7.78 9.56 7.37C9.56 6.96 9.9 6.62 10.31 6.62H15.56C15.98 6.62 16.31 6.96 16.31 7.37C16.31 7.78 15.98 8.12 15.56 8.12Z"
              fill="#8785FF"
            />
          </svg>
        }
        iconBgColor="#F1F0FF"
        iconColor="#059669"
      />

      <StatisticsCard
        title="Total Admins"
        value={totalAdmins}
        growth="up"
        percentage={adminGrowth}
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
              fill="#DC2626"
            />
            <path
              d="M19 15L19.74 17.74L22.5 18.5L19.74 19.26L19 22L18.26 19.26L15.5 18.5L18.26 17.74L19 15Z"
              fill="#DC2626"
            />
            <path
              d="M5 15L5.74 17.74L8.5 18.5L5.74 19.26L5 22L4.26 19.26L1.5 18.5L4.26 17.74L5 15Z"
              fill="#DC2626"
            />
          </svg>
        }
        iconBgColor="#FFF5F5"
        iconColor="#DC2626"
      />
    </div>
  )
}

export default AdminStats
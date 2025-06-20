'use client'
import { ArrowRight, ScanQrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const AttendanceSection = () => {
  const router = useRouter();

  return (
    <div className="w-full">
    <div className="">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <ScanQrCode size={45} className="text-gray-700" />
          <div className="">
            <h3 className="text-lg text-gray-600 font-semibold">
              Hey Hacker, Complete your Attendance
            </h3>
            <p className="text-sm text-gray-400 font-medium">
              Our attendance system uses a QR code that’s securely
              connected and verified on-chain,
            </p>
          </div>
          <p></p>
        </div>
        <div className="mt-6">
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm">
            <li>
              <span className="font-medium ">
                Click the <b>Get started</b> button
              </span>{" "}
              to begin your attendance process.
            </li>
            <li>
              <span className="font-medium ">Point your camera</span> at
              the QR code provided by your instructor or mentor for
              today.
            </li>
            <li>
              <span className="font-medium ">
                Get instant confirmation
              </span>{" "}
              as your attendance is securely verified on-chain.
            </li>
          </ol>
          <button
            className="mt-6 bg-[#131315] text-white px-6 py-2 rounded-md flex items-center gap-2 text-sm hover:bg-[#7c2bc4] transition"
            type="button"
            onClick={() => router.push('/student/scanqr')}
          >
            Get Started 

            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}

export default AttendanceSection
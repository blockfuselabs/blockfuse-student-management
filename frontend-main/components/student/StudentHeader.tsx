import Image from 'next/image'
import React from 'react'

const StudentHeader = () => {
  return (
    <div className="relative">
    <div
      className="w-full h-[160px] bg-[#9434EA] rounded-xl flex flex-col justify-between relative p-4"
      style={{
        backgroundImage:
          "url(https://www.myridima.com/imgs/headercurvebg.webp)",
      }}
    >
      <div className=""></div>
      <div className=" flex">
        <div className="w-32"></div>
        <div className="flex flex-col px-8 pt-4">
          <h2 className="text-white text-[22px] font-semibold">
            Clement Ikechukwu Bulus
          </h2>
          <h2 className="text-white">
            Web 2 Advanced - COHORT 3
          </h2>
          {/* <div className="flex items-center gap-2 px-1">
            <span className="text-white text-xs font-mono truncate max-w-[180px]" title="0x1234...abcd">
              0x1234...abcd
            </span>
            <button
              type="button"
              className="text-white hover:text-[#9434EA] transition"
              onClick={() => {
                navigator.clipboard.writeText("0x1234...abcd");
              }}
              aria-label="Copy wallet address"
            >
              <Copy size={16} />
            </button>
          </div> */}
        </div>
      </div>
    </div>
    <div className="h-32 w-32 bg-black rounded-full absolute -bottom-8 overflow-hidden left-10">
      <Image
        src="https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=d456a2af571d980d8b2985472c262b31"
        alt=""
        height={128}
        width={128}
        className="object-cover h-full w-full"
      />
    </div>
  </div>
  )
}

export default StudentHeader
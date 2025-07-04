"use client";
import Image from "next/image";
import React from "react";
import { Montserrat } from "next/font/google";
import { motion } from "framer-motion";
import Link from "next/link";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["700"] });

const textVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.42, 0, 0.58, 1] },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.7 } },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.5 + i * 0.15, duration: 0.5 },
  }),
};

// const statsVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.7 } },
// };

const LandingPage = () => {
  return (
    <div className="w-full min-h-screen overflow-hidden bg-gradient-to-r from-[#1B1720] via-[#1B1720] to-[#0e0d1c] text-white relative">
      <div className="container mx-auto h-screen relative">
        <span className="size-8 bg-white rounded-full absolute top-20 right-[27rem]"></span>

        <div className="h-full grow flex items-center">
          <div className="w-[40%] flex flex-col gap-6 relative">
            <span className="size-8 rounded-full bg-[#8C0282] absolute -top-14 -left-8"></span>
            <motion.h1
              className={`text-4xl font-extrabold tracking-wide leading-tight ${montserrat.className}`}
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              Your Modern <br /> Student Management System
            </motion.h1>
            <motion.p
              className="text-lg text-gray-300"
              variants={subtitleVariants}
              initial="hidden"
              animate="visible"
            >
              Revolutionize blockchain education at Blockfuse Labs with our
              decentralized student management platform. Track learning
              progress, verify achievements, and manage your blockchain hub with
              transparent, secure technology.
            </motion.p>

            <div className="flex gap-6">
              {[
                {
                  text: "Get Started",
                  className:
                    "py-3 px-10 rounded-r-full rounded-t-full bg-[#9434EA] text-white",
                  link: "/login",
                },
                {
                  text: "Learn more",
                  className:
                    "py-3 px-10 rounded-l-full rounded-t-full bg-[#3F3A38] text-white",
                  link: "/",
                },
              ].map((btn, i) => (
                <Link key={btn.text} href={btn.link}>
                  <motion.button
                    className={btn.className}
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {btn.text}
                  </motion.button>
                </Link>
              ))}
            </div>

            {/* <motion.div
              className="flex"
              variants={statsVariants}
              initial="hidden"
              animate="visible"
            >
              <h3></h3>
              <div className="bg-[#262630] w-full p-6 rounded-2xl flex justify-between items-center">
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold text-white">200+</h2>
                  <p className="text-gray-500 text-sm">
                    Total Students
                    <br /> onboarded
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold text-white px-2">4</h2>
                  <p className="text-gray-500 text-sm">
                    Active Tracks/ <br /> courses
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold text-white tpx-2">50+</h2>
                  <p className="text-gray-500 text-sm">
                    Active Mentors and
                    <br /> Instructors
                  </p>
                </div>
              </div>
            </motion.div> */}
          </div>

          {/* ...rest of your image grid code remains unchanged... */}
          <div className="grow flex gap-10 h-full">
            <span className="size-8 bg-purple-700 rounded-full absolute bottom-10 right-72"></span>
            <div className=" h-full pt-10 absolute right-[25rem]">
              <div className="flex flex-col gap-6 h-full mt-10">
                <div className="h-[50%] w-[150px] p-10 rounded-full relative overflow-hidden">
                  <Image
                    src="/auth-bg.jpeg"
                    alt=""
                    className="object-cover"
                    fill
                  />
                </div>
                <div className="h-[50%]  w-[150px] p-10 rounded-full relative overflow-hidden">
                  <Image
                    src="/smiles.jpeg"
                    alt=""
                    className="object-cover"
                    fill
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 h-full absolute right-52 top-0 bottom-0">
              <div className="h-[100%] bg-gray-400 w-[150px] p-10 rounded-b-full relative overflow-hidden">
                <Image src="/vic.jpeg" alt="" className="object-cover" fill />
              </div>
              <div className="h-[100%] bg-gray-400 w-[150px] p-10 rounded-t-full relative overflow-hidden">
                <Image
                  src="/devlongs.JPG"
                  alt=""
                  className="object-cover"
                  fill
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 h-full mt-6 absolute right-0">
              <div className="h-[50%] bg-gray-400 w-[150px] p-10 rounded-full relative overflow-hidden">
                <Image src="/mitong.JPG" alt="" className="object-cover" fill />
              </div>
              <div className="h-[50%] bg-gray-400 w-[150px] p-10 rounded-full  relative overflow-hidden">
                <Image src="/scar.jpeg" alt="" className="object-cover" fill />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

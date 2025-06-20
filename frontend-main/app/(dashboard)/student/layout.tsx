import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <div className="flex justify-center  h-screen">
      <div className="max-w-5xl w-full h-full p-6">{children}</div>
    </div>
  );
};

export default layout;

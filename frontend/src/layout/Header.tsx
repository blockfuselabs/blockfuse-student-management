// assets
import logo from "../assets/logo.svg";

const Header = () => {
  return (
    <div className="w-full flex justify-between items-center px-[30px] py-[30px]">
      <img src={logo} alt="LOGO" />

      <div
        className="flex items-center gap-3 px-3 py-2 rounded-[20px] bg-[#FFFFFF]"
        style={{ boxShadow: "0px 0px 10px 0px #23325517" }}
      >
        <div className="w-[50px] h-[50px] rounded-full">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg"
            className="w-full h-full rounded-full"
            alt="PROFILE"
          />
        </div>
        <p className="font-inter text-[16px] font-semibold leading-[16.94px] tracking-[0.05em] text-left text-[#233255CC]">
          Mr Scarface
        </p>
      </div>
    </div>
  );
};

export default Header;

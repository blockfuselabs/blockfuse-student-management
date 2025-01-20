// assets
import logo from "../assets/logo.svg";

const Header = () => {
  return (
    <div className="w-full flex justify-between items-center px-[40px] py-[30px]">
      <img src={logo} alt="LOGO" />

      <div className="flex items-center gap-3">
        <div className="w-[50px] h-[50px] rounded-full">
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg"
            className="w-full h-full rounded-full"
            alt="PROFILE"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;

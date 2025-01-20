// components
import { Outlet } from "react-router"
import Header from "./Header"

const RootLayout = () => {
  return (
    <div className="">
      <Header />
      <div className="">
        <Outlet />
      </div>
    </div>
  )
}

export default RootLayout

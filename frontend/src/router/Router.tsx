import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";

// layout
import RootLayout from "../layout/RootLayout";

// pages
import Home from "../pages/home/Home";
import Profile from "../pages/profile/Profile";
import Students from "../pages/students/Students";
import Cohort from "../pages/cohort/Cohorts";
import Attendance from "../pages/attendance/Attendance";
import Assessment from "../pages/assessment/Assessment";
import Admin from "../pages/admin/Admin ";

const router = createBrowserRouter(
  // Routes
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="profile" element={<Profile />} />
      <Route path="students" element={<Students />} />
      <Route path="cohorts" element={<Cohort />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="assessment" element={<Assessment />} />
      <Route path="admin" element={<Admin />} />
    </Route>
  )
);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;

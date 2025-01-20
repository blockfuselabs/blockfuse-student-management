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

const router = createBrowserRouter(
  // Routes
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
    </Route>
  )
);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;

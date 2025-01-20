import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";

// pages
import Home from "../pages/home/Home";

const router = createBrowserRouter(
  // Routes
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Home />} />
    </Route>
  )
);

const Router = () => {
  return <RouterProvider router={router} />;
}

export default Router;
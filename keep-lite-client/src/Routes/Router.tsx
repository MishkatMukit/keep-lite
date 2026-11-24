import { createBrowserRouter } from "react-router";
import MainLayout from "../Layouts/MainLayout/MainLayout";
import Home from "../Pages/Home/Home";
import Categories from "../Pages/Categories/Categories";
import Login from "../Components/AuthComponents/Login";
import Register from "../Components/AuthComponents/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "categories",
        element: <Categories />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "*",
        element: (
          <div className="py-20 text-center space-y-3">
            <h2 className="text-3xl font-bold text-slate-800">404</h2>
            <p className="text-slate-500">Page not found</p>
          </div>
        ),
      },
    ],
  },
]);

export default router;

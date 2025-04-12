// router.tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "@pages/Home/Home";
import Login from "@pages/Login/Login";
import Register from "@pages/Register/Register";
import Events from "@pages/Events/Events";
import NotFound from "@pages/NotFound/NotFound";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { 
        path: "/events", 
        element: <ProtectedRoute><Events /></ProtectedRoute> 
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
    

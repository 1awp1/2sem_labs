import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const HomePage = lazy(() => import("../pages/Home/Home"));
const EventsPage = lazy(() => import("../pages/Events/Events"));
const LoginPage = lazy(() => import("../pages/Login/Login"));
const RegisterPage = lazy(() => import("../pages/Register/Register"));
const ProfilePage = lazy(() => import("../pages/Profile/Profile"));
const NotFoundPage = lazy(() => import("../pages/NotFound/NotFound"));

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/events" element={<EventsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/events/new" element={<EventsPage />} />
        <Route path="/events/:id/edit" element={<EventsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;

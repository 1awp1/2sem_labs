import { useEffect } from "react";
import { useAppDispatch } from "./redux/hook";
import { loginUser } from "./redux/slices/authSlice"; // Добавьте этот импорт
import { getAuthData } from "./utils/localStorageUtils";
import ErrorNotification from "./components/ErrorNotification";
import AppRouter from "./routes/router";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify/unstyled";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const authData = getAuthData();
    if (authData?.token) {
      dispatch(
        loginUser.fulfilled(authData.user, "", {
          email: "",
          password: "",
        })
      );
    }
  }, [dispatch]);

  return (
    <>
      <ToastContainer/>
      <ErrorNotification />
      <AppRouter />
    </>
  );
}

export default App;

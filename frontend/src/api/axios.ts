import axios from "axios";
import { getAuthData } from "@/utils/localStorageUtils";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
  // withCredentials: true, // для теста
});

instance.interceptors.request.use((config) => {
  const authData = getAuthData();
  //console.log("Axios request interceptor", { authData });
  if (authData?.token) {
    config.headers.Authorization = `Bearer ${authData.token}`;
    //console.log("Токен добавлен в заголовок");
  } else {
    //console.warn("Токен не найден, запрос без авторизации");
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth");
    }
    return Promise.reject(error);
  }
);

export default instance;

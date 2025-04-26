// src/pages/Profile/Profile.tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getCurrentUser, getUserEvents, updateUser } from "@/redux/thunks/userThunks";
import { getAuthData, setAuthData } from "@/utils/localStorageUtils";
import UserInfo from "./components/UserInfo";
import UserEventsList from "./components/UserEventsList";
import styles from "./Profile.module.scss";
import { Event } from "@/types/event";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/user";

export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { profile, events, isLoading, error } = useAppSelector((state) => state.user);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const authData = getAuthData();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (authData?.token) {
      dispatch(getCurrentUser(authData.token));
      dispatch(getUserEvents(authData.token));
    }
  }, [dispatch, isAuthenticated, authData?.token, navigate]);

  const handleUpdateProfile = async (updatedUser: User) => {
    if (!authData?.token) return;

    try {
      const response = await dispatch(
        updateUser({
          id: updatedUser.id,
          userData: updatedUser,
          token: authData.token,
        })
      ).unwrap();

      // Обновляем данные в localStorage
      if (authData) {
        setAuthData({ ...authData, user: response });
      }
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      throw error;
    }
  };

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const userEvents = events as unknown as Event[];

  return (
    <div className={styles.profile}>
      <div className={styles.profileContainer}>
        {profile && <UserInfo user={profile} onUpdate={handleUpdateProfile} editable={true} />}
        <div className={styles.eventsSection}>
          <h2>Мои мероприятия</h2>
          <UserEventsList events={userEvents} />
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import { setAuthData, useAuth } from "@utils/localStorageUtils";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@api/eventService";
import { updateUser } from "@api/authService";
import EventList from "../Events/EventList/EventList";
import EventModal from "./EventModal";
import ProfileModal from "./ProfileModal";
import ConfirmationModal from "./ConfirmationModal";
import { Event, EventFormValues, EventCategory, categoriesList } from "@/types/event";
import styles from "./Events.module.scss";
import { User } from "@/types/user";
import UserInfo from "../Profile/components/UserInfo";
import { useLocation } from "react-router-dom";
type LocationState = {
  showProfile?: boolean;
};
export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "все">("все");
  const location = useLocation();
  const locationState = location.state as LocationState;
  const [showProfile, setShowProfile] = useState(() => {
    const fromState = locationState?.showProfile;
    if (fromState !== undefined) return fromState;

    const saved = localStorage.getItem("profileVisibility");
    return saved ? JSON.parse(saved) : false;
  });
  const { getAuthData, logout } = useAuth();
  const [currentUser, setCurrentUser] = useState(getAuthData()?.user);

  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const err = error as AxiosError<{ message?: string }>;
    setError(err.response?.data?.message || err.message || defaultMessage);
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await getEvents();
      setEvents(data);
      setError("");
    } catch (error) {
      handleError(error, "Ошибка загрузки мероприятий");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    let isMounted = true;
    localStorage.setItem("profileVisibility", JSON.stringify(showProfile));
    const loadData = async () => {
      await fetchEvents();
    };

    if (isMounted) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchEvents, showProfile]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "все") return events;
    return events.filter((event) => event.category === selectedCategory);
  }, [events, selectedCategory]);

  const openModal = useCallback((event: Event | null = null) => {
    setCurrentEvent(event);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentEvent(null);
  }, []);

  const handleCreateOrUpdateEvent = async (eventData: EventFormValues) => {
    try {
      if (!currentUser?.id) return;
      setError("");

      if (currentEvent) {
        const updatedEvent = await updateEvent(currentEvent.id, eventData, currentUser.id);
        setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
      } else {
        const newEvent = await createEvent(eventData, currentUser.id);
        setEvents([newEvent, ...events]);
      }

      closeModal();
    } catch (error) {
      handleError(
        error,
        currentEvent ? "Не удалось обновить мероприятие" : "Не удалось создать мероприятие"
      );
    }
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    try {
      const authData = getAuthData();
      if (!authData?.token) return;

      // Обновляем пользователя через API
      const updatedUserData = await updateUser(
        updatedUser.id, // Первый параметр - id пользователя
        updatedUser, // Второй параметр - данные пользователя
        authData.token // Третий параметр - токен
      );
      const newAuthData = { ...authData, user: updatedUserData };
      // Обновляем данные в localStorage и состоянии
      setAuthData(newAuthData);
      setCurrentUser(updatedUserData);
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
      throw error;
    }
  };

  const handleEdit = useCallback(
    (eventId: number) => {
      const event = events.find((e) => e.id === eventId);
      if (event) {
        openModal(event);
      }
    },
    [events, openModal]
  );

  const handleDeleteClick = useCallback((eventId: number) => {
    setEventToDelete(eventId);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      await deleteEvent(eventToDelete);
      setEvents(events.filter((e) => e.id !== eventToDelete));
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      handleError(error, "Не удалось удалить мероприятие");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const eventList = useMemo(
    () => (
      <EventList
        events={filteredEvents}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        currentUserId={currentUser?.id}
      />
    ),
    [filteredEvents, handleEdit, handleDeleteClick, currentUser?.id]
  );

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.events}>
      <div className={styles.header}>
        <h1>Мероприятия</h1>
        <div className={styles.filterContainer}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as EventCategory | "все")}
            className={styles.categoryFilter}
          >
            <option value="все">Все категории</option>
            {categoriesList.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.userActions}>
          {currentUser && (
            <div className={styles.profileSection}>
              <span className={styles.userGreeting}>
                Добро пожаловать, {currentUser.name || currentUser.username}
              </span>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={styles.profileButton}
                aria-label={showProfile ? "Скрыть профиль" : "Показать профиль"}
              >
                <svg className={styles.profileIcon} viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span>{showProfile ? "Скрыть" : "Профиль"}</span>
              </button>
            </div>
          )}

          <div className={styles.buttons}>
            <Link to="/" className={styles.homeButton}>
              На главную
            </Link>
            <button onClick={() => openModal()} className={styles.createButton}>
              + Создать мероприятие
            </button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Выйти
            </button>
          </div>
        </div>
      </div>

      {showProfile && currentUser && (
        <div className={styles.profileContainer}>
          <UserInfo user={currentUser} onUpdate={handleUpdateProfile} editable={true} />
        </div>
      )}

      {eventList}

      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleCreateOrUpdateEvent}
        event={currentEvent}
        categories={categoriesList}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser!}
        onUpdate={handleUpdateProfile}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить это мероприятие?"
      />
    </div>
  );
}

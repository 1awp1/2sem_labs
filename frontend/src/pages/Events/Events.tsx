import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '@utils/localStorageUtils';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@api/eventService';
import EventList from '../Events/EventList/EventList';
import EventModal from './EventModal';
import ConfirmationModal from './ConfirmationModal';
import { Event, EventFormValues, EventCategory, categoriesList } from '@/types/event';
import styles from './Events.module.scss';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'все'>('все');
  
  const { getAuthData, logout } = useAuth();
  const currentUser = getAuthData()?.user;

  const handleError = useCallback((error: unknown, defaultMessage: string) => {
    const err = error as AxiosError<{ message?: string }>;
    setError(err.response?.data?.message || err.message || defaultMessage);
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await getEvents();
      setEvents(data);
      setError('');
    } catch (error) {
      handleError(error, 'Ошибка загрузки мероприятий');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      await fetchEvents();
    };

    if (isMounted) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'все') return events;
    return events.filter(event => event.category === selectedCategory);
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
      setError('');

      if (currentEvent) {
        const updatedEvent = await updateEvent(
          currentEvent.id,
          eventData,
          currentUser.id
        );
        setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      } else {
        const newEvent = await createEvent(
          eventData,
          currentUser.id
        );
        setEvents([newEvent, ...events]);
      }
      
      closeModal();
    } catch (error) {
      handleError(
        error,
        currentEvent ? 'Не удалось обновить мероприятие' : 'Не удалось создать мероприятие'
      );
    }
  };

  const handleEdit = useCallback((eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      openModal(event);
    }
  }, [events, openModal]);

  const handleDeleteClick = useCallback((eventId: number) => {
    setEventToDelete(eventId);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteEvent(eventToDelete);
      setEvents(events.filter(e => e.id !== eventToDelete));
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      handleError(error, 'Не удалось удалить мероприятие');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const eventList = useMemo(() => (
    <EventList 
      events={filteredEvents}
      onEdit={handleEdit}
      onDelete={handleDeleteClick}
      currentUserId={currentUser?.id} 
    />
  ), [filteredEvents, handleEdit, handleDeleteClick, currentUser?.id]);

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.events}>
      <div className={styles.header}>
        <h1>Мероприятия</h1>
        <div className={styles.filterContainer}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as EventCategory | 'все')}
            className={styles.categoryFilter}
          >
            <option value="все">Все категории</option>
            {categoriesList.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className={styles.userActions}>
          {currentUser && (
            <span className={styles.userGreeting}>
              Добро пожаловать, {currentUser.name || currentUser.username}
            </span>
          )}
          
          <div className={styles.buttons}>
            <Link to="/" className={styles.homeButton}>
              На главную
            </Link>
            <button 
              onClick={() => openModal()} 
              className={styles.createButton}
            >
              + Создать мероприятие
            </button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Выйти
            </button>
          </div>
        </div>
      </div>
      
      {eventList}

      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleCreateOrUpdateEvent}
        event={currentEvent}
        categories={categoriesList}
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
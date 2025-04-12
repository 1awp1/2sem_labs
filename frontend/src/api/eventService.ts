// src/api/eventService.ts
import axios from "./axios";
import { Event, EventFormValues } from "@/types/event";
import { getAuthData } from "@utils/localStorageUtils";

export async function getEvents(): Promise<Event[]> {
  const authData = getAuthData();
  const response = await axios.get("/events", {
    headers: {
      Authorization: `Bearer ${authData?.token}`,
    },
  });
  return response.data;
}

export async function createEvent(eventData: EventFormValues, userId: number): Promise<Event> {
  const authData = getAuthData();
  const response = await axios.post(
    "/events",
    {
      ...eventData,
      createdBy: userId,
    },
    {
      headers: {
        Authorization: `Bearer ${authData?.token}`,
      },
    }
  );
  return response.data;
}

export async function updateEvent(
  id: number,
  eventData: EventFormValues,
  userId: number
): Promise<Event> {
  const authData = getAuthData();
  const response = await axios.put(
    `/events/${id}`,
    {
      ...eventData,
      createdBy: userId,
    },
    {
      headers: {
        Authorization: `Bearer ${authData?.token}`,
      },
    }
  );
  return response.data;
}

export async function deleteEvent(id: number): Promise<void> {
  const authData = getAuthData();
  await axios.delete(`/events/${id}`, {
    headers: {
      Authorization: `Bearer ${authData?.token}`,
    },
  });
}

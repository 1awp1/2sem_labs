import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { hideNotification } from "@/redux/slices/uiSlice";
import styles from "./ErrorNotification.module.scss";

export default function ErrorNotification() {
  const dispatch = useAppDispatch();
  const { isOpen, message, type } = useAppSelector((state) => state.ui.notification);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.message}>{message}</div>
      <button className={styles.closeButton} onClick={() => dispatch(hideNotification())}>
        ×
      </button>
    </div>
  );
}

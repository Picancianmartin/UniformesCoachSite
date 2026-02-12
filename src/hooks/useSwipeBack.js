import { useEffect, useRef } from "react";

const EDGE_ZONE_PX = 30; // Left edge detection zone
const MIN_SWIPE_PX = 80; // Minimum horizontal distance to trigger back
const MAX_DIAGONAL_RATIO = 0.5; // dy must be < dx * ratio (keeps swipe horizontal)

/**
 * Detects a swipe-right gesture from the left edge of the screen
 * and calls `onSwipeBack` when detected. Works on touch devices.
 */
export default function useSwipeBack(onSwipeBack) {
  const touchStart = useRef(null);

  useEffect(() => {
    if (!onSwipeBack) return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      if (touch.clientX < EDGE_ZONE_PX) {
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      } else {
        touchStart.current = null;
      }
    };

    const handleTouchEnd = (e) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = Math.abs(touch.clientY - touchStart.current.y);

      if (dx > MIN_SWIPE_PX && dy < dx * MAX_DIAGONAL_RATIO) {
        onSwipeBack();
      }
      touchStart.current = null;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onSwipeBack]);
}

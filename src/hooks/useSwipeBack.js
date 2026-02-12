import { useEffect, useRef } from "react";

/**
 * Detects a swipe-right gesture from the left edge of the screen (< 30px)
 * and calls `onSwipeBack` when detected. Works on touch and trackpad.
 */
export default function useSwipeBack(onSwipeBack) {
  const touchStart = useRef(null);

  useEffect(() => {
    if (!onSwipeBack) return;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      // Only trigger from left edge (first 30px)
      if (touch.clientX < 30) {
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

      // Horizontal swipe > 80px, and mostly horizontal (not diagonal)
      if (dx > 80 && dy < dx * 0.5) {
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

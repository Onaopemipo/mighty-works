"use client";

import {
  useEffect,
  useState,
} from "react";

function initialOnlineState() {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return true;
  }

  return navigator.onLine;
}

export function useBrowserConnectivity() {
  const [
    online,
    setOnline,
  ] = useState(
    initialOnlineState
  );

  useEffect(() => {
    const handleOnline =
      () => {
        setOnline(true);
      };

    const handleOffline =
      () => {
        setOnline(false);
      };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  return {
    online,
  };
}

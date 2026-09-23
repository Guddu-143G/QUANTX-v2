import { useState, useEffect } from "react";

/**
 * Client-safe hydration hook to prevent SSR hydration mismatches,
 * premature canvas/WebGL rendering, and local storage read crashes in serverless deployments.
 */
export const useIsMounted = (): boolean => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};

export default useIsMounted;

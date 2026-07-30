import { useEffect, useState } from 'react';

/**
 * useMediaQuery - returns whether the current viewport matches the given CSS media query.
 * Useful for responsive component logic without re-running CSS breakpoints everywhere.
 *
 * @param {string} query
 */
const useMediaQuery = (query) => {
  const getMatch = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);
    setMatches(mql.matches);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handleChange);
      return () => mql.removeEventListener('change', handleChange);
    }
    mql.addListener(handleChange);
    return () => mql.removeListener(handleChange);
  }, [query]);

  return matches;
};

export default useMediaQuery;

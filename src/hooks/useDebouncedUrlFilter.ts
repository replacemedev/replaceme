"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

interface FilterConfig {
  searchKey?: string;
  debounceMs?: number;
}

export function useDebouncedUrlFilter(config?: FilterConfig) {
  const searchKey = config?.searchKey ?? "q";
  const debounceMs = config?.debounceMs ?? 300;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlSearchValue = searchParams.get(searchKey) ?? "";
  const [searchValue, setSearchValue] = useState(urlSearchValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize local search input state when URL changes externally
  useEffect(() => {
    setSearchValue(urlSearchValue);
  }, [urlSearchValue]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value.trim() !== "" && value.trim() !== "all") {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        updateParam(searchKey, value);
      }, debounceMs);
    },
    [debounceMs, searchKey, updateParam]
  );

  const setParam = useCallback(
    (key: string, value: string) => {
      updateParam(key, value);
    },
    [updateParam]
  );

  const resetAllFilters = useCallback(() => {
    setSearchValue("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const getParam = useCallback(
    (key: string, defaultValue: string = "all") => {
      return searchParams.get(key) || defaultValue;
    },
    [searchParams]
  );

  return {
    searchValue,
    handleSearchChange,
    getParam,
    setParam,
    resetAllFilters,
    isPending,
    searchParams,
  };
}

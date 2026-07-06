"use client";

import React, { useEffect, useState } from "react";
import { formatDateTimeWithTimezone } from "@/utils/date";

interface ClientFormattedDateProps {
  date: string | Date | number | null | undefined;
  fallback?: string;
}

export function ClientFormattedDate({ date, fallback = "" }: ClientFormattedDateProps) {
  const [formatted, setFormatted] = useState<string>(fallback);

  useEffect(() => {
    if (date) {
      setFormatted(formatDateTimeWithTimezone(date));
    }
  }, [date]);

  return <>{formatted}</>;
}

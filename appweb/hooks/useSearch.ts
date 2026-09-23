"use client";

import { useState } from "react";

export function useSearch(initial = "") {
  const [query, setQuery] = useState(initial);
  return { query, setQuery };
}

"use client";

import { createContext, useContext, useState } from "react";
import type { AiAllowance } from "@/lib/ai/usage";

/**
 * The tenant's AI allowance, read once by the dashboard layout and kept
 * current from each AI action's response (so "2 rewrites left" updates
 * without a reload).
 */

const AllowanceContext = createContext<{ allowance: AiAllowance | null; setAllowance: (a: AiAllowance) => void }>({
  allowance: null,
  setAllowance: () => {},
});

function AiAllowanceProvider({ initial, children }: { initial: AiAllowance | null; children: React.ReactNode }) {
  const [allowance, setAllowance] = useState(initial);
  return <AllowanceContext.Provider value={{ allowance, setAllowance }}>{children}</AllowanceContext.Provider>;
}

const useAiAllowance = () => useContext(AllowanceContext);

export { AiAllowanceProvider, useAiAllowance };

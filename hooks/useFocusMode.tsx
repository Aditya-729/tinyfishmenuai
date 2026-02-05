import { createContext, useContext, useMemo, useState } from "react";

type FocusModeContextValue = {
  focusMode: boolean;
  toggleFocusMode: () => void;
};

const FocusModeContext = createContext<FocusModeContextValue | undefined>(
  undefined,
);

export function FocusModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [focusMode, setFocusMode] = useState(false);

  const value = useMemo(
    () => ({
      focusMode,
      toggleFocusMode: () => setFocusMode((prev) => !prev),
    }),
    [focusMode],
  );

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error("useFocusMode must be used within FocusModeProvider");
  }
  return context;
}

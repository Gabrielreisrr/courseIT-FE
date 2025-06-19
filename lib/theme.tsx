"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextThemes,
} from "next-themes";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <CustomThemeProvider>{children}</CustomThemeProvider>
    </NextThemesProvider>
  );
};

function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme: setNextTheme } = useNextThemes();
  const [currentTheme, setCurrentTheme] = useState<Theme>("system");

  useEffect(() => {
    setCurrentTheme((theme as Theme) || "system");
  }, [theme]);

  const toggleTheme = () => {
    if (currentTheme === "dark") {
      setNextTheme("light");
    } else {
      setNextTheme("dark");
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        setTheme: setNextTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);

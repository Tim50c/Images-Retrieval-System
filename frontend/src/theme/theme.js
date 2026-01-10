import { createTheme, alpha } from "@mui/material/styles";

// Modern color palette
const colors = {
  primary: {
    main: "#6366f1", // Indigo
    light: "#818cf8",
    dark: "#4f46e5",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#ec4899", // Pink
    light: "#f472b6",
    dark: "#db2777",
    contrastText: "#ffffff",
  },
  success: {
    main: "#10b981", // Emerald
    light: "#34d399",
    dark: "#059669",
  },
  error: {
    main: "#ef4444", // Red
    light: "#f87171",
    dark: "#dc2626",
  },
  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
  },
  background: {
    default: "#0f0f1a",
    paper: "#1a1a2e",
    elevated: "#252540",
  },
  text: {
    primary: "#f1f5f9",
    secondary: "#94a3b8",
    disabled: "#64748b",
  },
  divider: alpha("#ffffff", 0.08),
};

// Create the theme
const theme = createTheme({
  palette: {
    mode: "dark",
    ...colors,
    background: colors.background,
    text: colors.text,
    divider: colors.divider,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
      color: colors.text.secondary,
    },
    body1: {
      lineHeight: 1.7,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    `0 2px 4px ${alpha("#000", 0.1)}`,
    `0 4px 8px ${alpha("#000", 0.12)}`,
    `0 8px 16px ${alpha("#000", 0.14)}`,
    `0 12px 24px ${alpha("#000", 0.16)}`,
    `0 16px 32px ${alpha("#000", 0.18)}`,
    `0 20px 40px ${alpha("#000", 0.2)}`,
    `0 24px 48px ${alpha("#000", 0.22)}`,
    // Extended shadows for elevation
    ...Array(17).fill(`0 24px 48px ${alpha("#000", 0.24)}`),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${alpha("#ffffff", 0.2)} transparent`,
          "&::-webkit-scrollbar": {
            width: 8,
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: alpha("#ffffff", 0.2),
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: alpha("#ffffff", 0.3),
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 24px",
          fontSize: "0.95rem",
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: `0 8px 20px ${alpha(colors.primary.main, 0.3)}`,
            transform: "translateY(-1px)",
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.main} 100%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.secondary.dark} 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${colors.secondary.light} 0%, ${colors.secondary.main} 100%)`,
            boxShadow: `0 8px 20px ${alpha(colors.secondary.main, 0.3)}`,
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
            background: alpha(colors.primary.main, 0.08),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: colors.background.paper,
          border: `1px solid ${alpha("#ffffff", 0.05)}`,
        },
        elevation3: {
          boxShadow: `0 8px 32px ${alpha("#000", 0.24)}`,
        },
        elevation4: {
          boxShadow: `0 12px 40px ${alpha("#000", 0.28)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: colors.background.paper,
          border: `1px solid ${alpha("#ffffff", 0.08)}`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            border: `1px solid ${alpha(colors.primary.main, 0.3)}`,
            boxShadow: `0 20px 40px ${alpha("#000", 0.3)}, 0 0 0 1px ${alpha(
              colors.primary.main,
              0.1
            )}`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            background: alpha("#ffffff", 0.02),
            transition: "all 0.2s ease",
            "&:hover": {
              background: alpha("#ffffff", 0.04),
            },
            "&.Mui-focused": {
              background: alpha("#ffffff", 0.04),
              boxShadow: `0 0 0 3px ${alpha(colors.primary.main, 0.2)}`,
            },
            "& fieldset": {
              borderColor: alpha("#ffffff", 0.1),
              transition: "border-color 0.2s ease",
            },
            "&:hover fieldset": {
              borderColor: alpha("#ffffff", 0.2),
            },
            "&.Mui-focused fieldset": {
              borderColor: colors.primary.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.95rem",
          minHeight: 56,
          transition: "all 0.2s ease",
          "&:hover": {
            background: alpha("#ffffff", 0.05),
          },
          "&.Mui-selected": {
            color: colors.primary.main,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: "3px 3px 0 0",
          background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.secondary.main})`,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.1)",
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: colors.primary.main,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;

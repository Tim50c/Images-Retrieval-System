import { Box, CircularProgress, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

/**
 * Loading state component with animated progress indicator.
 * @param {Object} props
 * @param {string} props.message - Loading message to display
 */
const LoadingState = ({ message = "Processing..." }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 6, md: 10 },
        animation: "fadeIn 0.3s ease",
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      {/* Animated Progress */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        {/* Outer Glow */}
        <Box
          sx={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(
              "#6366f1",
              0.2
            )} 0%, transparent 70%)`,
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { transform: "scale(1)", opacity: 1 },
              "50%": { transform: "scale(1.2)", opacity: 0.5 },
            },
          }}
        />

        {/* Progress Circle */}
        <CircularProgress
          size={60}
          thickness={3}
          sx={{
            color: "primary.main",
          }}
        />

        {/* Secondary Progress */}
        <CircularProgress
          size={60}
          thickness={3}
          sx={{
            position: "absolute",
            color: "secondary.main",
            opacity: 0.3,
            animationDuration: "3s",
          }}
        />
      </Box>

      {/* Loading Text */}
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>

      {/* Animated Dots */}
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
              animation: "bounce 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
              "@keyframes bounce": {
                "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
                "40%": { transform: "scale(1)", opacity: 1 },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default LoadingState;

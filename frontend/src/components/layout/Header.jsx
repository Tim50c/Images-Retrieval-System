import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";

/**
 * Header component with animated logo and gradient title.
 */
const Header = () => {
  return (
    <Box
      component="header"
      sx={{
        textAlign: "center",
        py: { xs: 4, md: 6 },
        mb: { xs: 3, md: 5 },
        position: "relative",
      }}
    >
      {/* Decorative Glow */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Logo Icon */}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          borderRadius: "20px",
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          boxShadow: "0 8px 32px rgba(99, 102, 241, 0.35)",
          mb: 3,
          position: "relative",
          zIndex: 1,
          animation: "float 3s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-8px)" },
          },
        }}
      >
        <ImageSearchIcon sx={{ fontSize: 36, color: "white" }} />
      </Box>

      {/* Title */}
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
          background: "linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          mb: 1.5,
          position: "relative",
          zIndex: 1,
          letterSpacing: "-0.02em",
        }}
      >
        Interactive Image Search
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="subtitle1"
        sx={{
          color: alpha("#f1f5f9", 0.6),
          fontSize: { xs: "0.9rem", md: "1rem" },
          maxWidth: 500,
          mx: "auto",
          position: "relative",
          zIndex: 1,
          fontWeight: 400,
        }}
      >
        Search, provide feedback, and refine your results in real-time
      </Typography>
    </Box>
  );
};

export default Header;

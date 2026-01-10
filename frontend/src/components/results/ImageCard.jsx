import { useState } from "react";
import {
  Card,
  CardMedia,
  IconButton,
  Box,
  Typography,
  Skeleton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

/**
 * Image card component with feedback buttons.
 * @param {Object} props
 * @param {Object} props.item - Image item { id, url, filename, score }
 * @param {string|null} props.feedbackStatus - 'relevant', 'irrelevant', or null
 * @param {function} props.onFeedback - Feedback handler (id, type) => void
 * @param {number} props.index - Card index for staggered animation
 */
const ImageCard = ({ item, feedbackStatus, onFeedback, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determine visual state
  const isRelevant = feedbackStatus === "relevant";
  const isIrrelevant = feedbackStatus === "irrelevant";

  // Dynamic border color
  const getBorderColor = () => {
    if (isRelevant) return "#10b981";
    if (isIrrelevant) return "#ef4444";
    return "transparent";
  };

  // Dynamic overlay
  const getOverlayColor = () => {
    if (isRelevant) return alpha("#10b981", 0.1);
    if (isIrrelevant) return alpha("#ef4444", 0.1);
    return "transparent";
  };

  return (
    <Card
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        border: `3px solid ${getBorderColor()}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: "fadeIn 0.5s ease forwards",
        animationDelay: `${index * 0.05}s`,
        opacity: 0,
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(20px) scale(0.95)" },
          to: { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 20px 40px ${alpha("#000", 0.3)}`,
          "& .image-overlay": {
            opacity: 1,
          },
          "& .feedback-bar": {
            transform: "translateY(0)",
          },
        },
      }}
    >
      {/* Loading Skeleton */}
      {!imageLoaded && !imageError && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: alpha("#ffffff", 0.05),
          }}
        />
      )}

      {/* Image */}
      <CardMedia
        component="img"
        height="220"
        image={item.url}
        alt={item.filename || "Search result"}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
        sx={{
          objectFit: "cover",
          opacity: imageLoaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Feedback Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: getOverlayColor(),
          pointerEvents: "none",
          transition: "background-color 0.3s ease",
        }}
      />

      {/* Hover Gradient Overlay */}
      <Box
        className="image-overlay"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
          opacity: 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      />

      {/* Score Badge */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          bgcolor: alpha("#000", 0.7),
          backdropFilter: "blur(8px)",
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor:
              item.score > 0.7
                ? "#10b981"
                : item.score > 0.4
                ? "#f59e0b"
                : "#ef4444",
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: "white",
            fontSize: "0.75rem",
          }}
        >
          {(item.score * 100).toFixed(0)}%
        </Typography>
      </Box>

      {/* Feedback Bar */}
      <Box
        className="feedback-bar"
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          background: alpha("#0f0f1a", 0.9),
          backdropFilter: "blur(12px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          py: 1.5,
          transform: "translateY(100%)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Thumbs Up */}
        <IconButton
          onClick={() => onFeedback(item.id, "relevant")}
          aria-label="Mark as relevant"
          size="small"
          sx={{
            color: isRelevant ? "#10b981" : alpha("#ffffff", 0.7),
            bgcolor: isRelevant ? alpha("#10b981", 0.15) : "transparent",
            "&:hover": {
              bgcolor: alpha("#10b981", 0.2),
              color: "#10b981",
            },
          }}
        >
          <ThumbUpIcon fontSize="small" />
        </IconButton>

        {/* Divider Line */}
        <Box
          sx={{
            width: 1,
            height: 20,
            bgcolor: alpha("#ffffff", 0.1),
          }}
        />

        {/* Thumbs Down */}
        <IconButton
          onClick={() => onFeedback(item.id, "irrelevant")}
          aria-label="Mark as irrelevant"
          size="small"
          sx={{
            color: isIrrelevant ? "#ef4444" : alpha("#ffffff", 0.7),
            bgcolor: isIrrelevant ? alpha("#ef4444", 0.15) : "transparent",
            "&:hover": {
              bgcolor: alpha("#ef4444", 0.2),
              color: "#ef4444",
            },
          }}
        >
          <ThumbDownIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};

export default ImageCard;

import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  InputAdornment,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AddCommentIcon from "@mui/icons-material/AddComment";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

/**
 * Refinement bar for applying feedback to search results.
 * @param {Object} props
 * @param {string} props.extraText - Additional constraint text
 * @param {function} props.onExtraTextChange - Text change handler
 * @param {function} props.onRefine - Apply refinement handler
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.feedback - Current feedback state { [id]: 'relevant' | 'irrelevant' }
 */
const RefinementBar = ({
  extraText,
  onExtraTextChange,
  onRefine,
  loading,
  feedback,
}) => {
  // Count feedback stats
  const relevantCount = Object.values(feedback).filter(
    (v) => v === "relevant"
  ).length;
  const irrelevantCount = Object.values(feedback).filter(
    (v) => v === "irrelevant"
  ).length;
  const hasFeedback =
    relevantCount > 0 || irrelevantCount > 0 || extraText.trim();

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 4,
        borderRadius: 3,
        background: alpha("#1a1a2e", 0.8),
        backdropFilter: "blur(16px)",
        border: `1px solid ${alpha("#ffffff", 0.08)}`,
        borderLeft: `4px solid`,
        borderLeftColor: "secondary.main",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        alignItems: { xs: "stretch", lg: "center" },
        gap: 3,
        animation: "slideUp 0.5s ease forwards",
        "@keyframes slideUp": {
          from: { opacity: 0, transform: "translateY(15px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Left Section: Title & Feedback Stats */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          minWidth: 200,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 44,
            height: 44,
            borderRadius: 2,
            background: alpha("#ec4899", 0.15),
            flexShrink: 0,
          }}
        >
          <AutoFixHighIcon color="secondary" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 600 }}>
            Refine Results
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Select images below and add constraints
          </Typography>

          {/* Feedback Stats */}
          {(relevantCount > 0 || irrelevantCount > 0) && (
            <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
              {relevantCount > 0 && (
                <Chip
                  size="small"
                  icon={<ThumbUpIcon sx={{ fontSize: 16 }} />}
                  label={relevantCount}
                  sx={{
                    bgcolor: alpha("#10b981", 0.15),
                    color: "#10b981",
                    "& .MuiChip-icon": { color: "#10b981" },
                  }}
                />
              )}
              {irrelevantCount > 0 && (
                <Chip
                  size="small"
                  icon={<ThumbDownIcon sx={{ fontSize: 16 }} />}
                  label={irrelevantCount}
                  sx={{
                    bgcolor: alpha("#ef4444", 0.15),
                    color: "#ef4444",
                    "& .MuiChip-icon": { color: "#ef4444" },
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Middle: Extra Text Input */}
      <Box sx={{ flexGrow: 1 }}>
        <TextField
          fullWidth
          label="Add extra constraints"
          placeholder="e.g., 'make it night', 'add snow', 'no people'"
          variant="outlined"
          size="medium"
          value={extraText}
          onChange={(e) => onExtraTextChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AddCommentIcon
                  fontSize="small"
                  sx={{ color: "text.secondary" }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              background: alpha("#ffffff", 0.03),
            },
          }}
        />
      </Box>

      {/* Right: Apply Button */}
      <Button
        variant="contained"
        color="secondary"
        size="large"
        onClick={onRefine}
        disabled={loading || !hasFeedback}
        sx={{
          px: 4,
          py: 1.5,
          whiteSpace: "nowrap",
          minWidth: { xs: "100%", lg: "auto" },
        }}
      >
        Apply Feedback
      </Button>
    </Paper>
  );
};

export default RefinementBar;

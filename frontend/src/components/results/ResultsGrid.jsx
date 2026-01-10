import { Box, Grid, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";

import ImageCard from "./ImageCard";

/**
 * Grid display for search results.
 * @param {Object} props
 * @param {Array} props.results - Array of result items
 * @param {Object} props.feedback - Feedback state { [id]: 'relevant' | 'irrelevant' }
 * @param {function} props.onFeedback - Feedback handler (id, type) => void
 */
const ResultsGrid = ({ results, feedback, onFeedback }) => {
  if (results.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: { xs: 6, md: 10 },
          opacity: 0.8,
        }}
      >
        {/* Empty State Icon */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: alpha("#ffffff", 0.03),
            mb: 3,
          }}
        >
          <ImageSearchIcon
            sx={{
              fontSize: 40,
              color: "text.secondary",
            }}
          />
        </Box>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          No results yet
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Start a search above to discover images
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Results Count */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing <strong>{results.length}</strong> results
        </Typography>
      </Box>

      {/* Grid */}
      <Grid container spacing={3}>
        {results.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <ImageCard
              item={item}
              feedbackStatus={feedback[item.id]}
              onFeedback={onFeedback}
              index={index}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ResultsGrid;

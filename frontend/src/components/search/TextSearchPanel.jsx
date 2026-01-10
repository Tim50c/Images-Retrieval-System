import { Box, TextField, Button, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Text search input panel.
 * @param {Object} props
 * @param {string} props.query - Current search query
 * @param {function} props.onQueryChange - Query change handler
 * @param {function} props.onSearch - Search submit handler
 * @param {boolean} props.loading - Loading state
 */
const TextSearchPanel = ({ query, onQueryChange, onSearch, loading }) => {
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && query.trim()) {
      onSearch();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "stretch",
      }}
      role="search"
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Describe the scene (e.g., 'green forest', 'snowy mountain')..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
        aria-label="Search query"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: "100%",
          },
        }}
      />
      <Button
        variant="contained"
        size="large"
        onClick={onSearch}
        disabled={loading || !query.trim()}
        aria-label="Submit search"
        sx={{
          px: 4,
          minWidth: "auto",
          aspectRatio: "1",
        }}
      >
        <SearchIcon />
      </Button>
    </Box>
  );
};

export default TextSearchPanel;

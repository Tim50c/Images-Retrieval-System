import { useState } from "react";
import { Paper, Box } from "@mui/material";

import SearchTabs from "./SearchTabs";
import TextSearchPanel from "./TextSearchPanel";
import ImageUploadPanel from "./ImageUploadPanel";

/**
 * Main search box component combining tabs and search panels.
 * @param {Object} props
 * @param {function} props.onTextSearch - Text search handler (query) => void
 * @param {function} props.onImageSearch - Image search handler (file) => void
 * @param {boolean} props.loading - Loading state
 * @param {function} props.onModeChange - Optional callback when mode changes
 */
const SearchBox = ({ onTextSearch, onImageSearch, loading, onModeChange }) => {
  const [searchMode, setSearchMode] = useState(0); // 0: Text, 1: Image
  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleModeChange = (event, newValue) => {
    setSearchMode(newValue);
    onModeChange?.(newValue);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleTextSearch = () => {
    if (query.trim()) {
      onTextSearch(query);
    }
  };

  const handleImageSearch = () => {
    if (selectedFile) {
      onImageSearch(selectedFile);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 700,
        mx: "auto",
        mb: { xs: 3, md: 5 },
        borderRadius: 3,
        overflow: "hidden",
        animation: "slideUp 0.6s ease forwards",
        "@keyframes slideUp": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Tabs */}
      <SearchTabs value={searchMode} onChange={handleModeChange} />

      {/* Search Panels */}
      <Box sx={{ p: { xs: 3, md: 4 } }}>
        {searchMode === 0 && (
          <TextSearchPanel
            query={query}
            onQueryChange={setQuery}
            onSearch={handleTextSearch}
            loading={loading}
          />
        )}

        {searchMode === 1 && (
          <ImageUploadPanel
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            onFileSelect={handleFileSelect}
            onClear={handleFileClear}
            onSearch={handleImageSearch}
            loading={loading}
          />
        )}
      </Box>
    </Paper>
  );
};

export default SearchBox;

// Export search mode for parent component usage
export const SEARCH_MODE = {
  TEXT: 0,
  IMAGE: 1,
};

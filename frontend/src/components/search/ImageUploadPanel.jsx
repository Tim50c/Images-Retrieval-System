import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

/**
 * Image upload and preview panel.
 * @param {Object} props
 * @param {File|null} props.selectedFile - Currently selected file
 * @param {string|null} props.previewUrl - Preview URL for selected image
 * @param {function} props.onFileSelect - File selection handler
 * @param {function} props.onClear - Clear selection handler
 * @param {function} props.onSearch - Search submit handler
 * @param {boolean} props.loading - Loading state
 */
const ImageUploadPanel = ({
  selectedFile,
  previewUrl,
  onFileSelect,
  onClear,
  onSearch,
  loading,
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {/* Hidden File Input */}
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="image-upload-input"
        type="file"
        onChange={handleFileChange}
        aria-label="Upload image for search"
      />

      {/* Preview Area */}
      {previewUrl ? (
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              overflow: "hidden",
              borderRadius: 3,
              border: `1px solid ${alpha("#ffffff", 0.1)}`,
              position: "relative",
            }}
          >
            <Box
              component="img"
              src={previewUrl}
              alt="Selected preview"
              sx={{
                width: "100%",
                maxHeight: 280,
                objectFit: "contain",
                display: "block",
                background: alpha("#000", 0.2),
              }}
            />
          </Paper>

          {/* Clear Button */}
          <IconButton
            onClick={onClear}
            aria-label="Remove selected image"
            sx={{
              position: "absolute",
              top: -10,
              right: -10,
              bgcolor: "error.main",
              color: "white",
              boxShadow: 3,
              width: 32,
              height: 32,
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        /* Upload Dropzone */
        <Box
          component="label"
          htmlFor="image-upload-input"
          sx={{
            width: "100%",
            height: 180,
            border: `2px dashed ${alpha("#ffffff", 0.2)}`,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: alpha("#ffffff", 0.02),
            "&:hover": {
              borderColor: "primary.main",
              background: alpha("#6366f1", 0.05),
            },
          }}
        >
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: "text.secondary",
              transition: "color 0.2s ease",
            }}
          />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              Drop an image here or
            </Typography>
            <Typography
              variant="body1"
              color="primary"
              sx={{ fontWeight: 600 }}
            >
              click to browse
            </Typography>
          </Box>
        </Box>
      )}

      {/* Search Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={onSearch}
        disabled={!selectedFile || loading}
        startIcon={<ImageSearchIcon />}
        sx={{
          py: 1.5,
          maxWidth: 400,
        }}
      >
        Search Similar Images
      </Button>
    </Box>
  );
};

export default ImageUploadPanel;

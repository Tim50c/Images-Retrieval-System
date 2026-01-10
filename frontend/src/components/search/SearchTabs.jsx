import { Tabs, Tab, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";

/**
 * Search mode tabs component.
 * @param {Object} props
 * @param {number} props.value - Current tab index (0: Text, 1: Image)
 * @param {function} props.onChange - Tab change handler
 */
const SearchTabs = ({ value, onChange }) => {
  return (
    <Box
      sx={{
        borderBottom: `1px solid ${alpha("#ffffff", 0.08)}`,
        background: alpha("#ffffff", 0.02),
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        variant="fullWidth"
        aria-label="Search mode tabs"
        sx={{
          "& .MuiTab-root": {
            py: 2.5,
            gap: 1,
            flexDirection: "row",
            "& .MuiSvgIcon-root": {
              mb: 0,
              mr: 1,
            },
          },
        }}
      >
        <Tab
          icon={<TextFieldsIcon />}
          label="Text Search"
          id="search-tab-0"
          aria-controls="search-tabpanel-0"
        />
        <Tab
          icon={<ImageSearchIcon />}
          label="Image Upload"
          id="search-tab-1"
          aria-controls="search-tabpanel-1"
        />
      </Tabs>
    </Box>
  );
};

export default SearchTabs;

import { useState, useCallback } from "react";
import { Container, Box } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "./theme/theme";
import {
  Header,
  SearchBox,
  SEARCH_MODE,
  RefinementBar,
  ResultsGrid,
  LoadingState,
} from "./components";
import * as api from "./api/client";

function App() {
  // Search state
  const [searchMode, setSearchMode] = useState(SEARCH_MODE.TEXT);
  const [currentQuery, setCurrentQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Results state
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Feedback state
  const [feedback, setFeedback] = useState({});
  const [extraText, setExtraText] = useState("");

  // Text search handler
  const handleTextSearch = useCallback(async (query) => {
    setLoading(true);
    setFeedback({});
    setExtraText("");
    setCurrentQuery(query);

    try {
      const data = await api.searchByText(query);
      setResults(data);
    } catch (error) {
      console.error("Text search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Image search handler
  const handleImageSearch = useCallback(async (file) => {
    setLoading(true);
    setFeedback({});
    setExtraText("");
    setCurrentQuery("");
    setSelectedFile(file);

    try {
      const data = await api.searchByImage(file);
      setResults(data);
    } catch (error) {
      console.error("Image search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Feedback toggle handler
  const handleFeedback = useCallback((id, type) => {
    setFeedback((prev) => {
      const newState = { ...prev };
      if (newState[id] === type) {
        delete newState[id];
      } else {
        newState[id] = type;
      }
      return newState;
    });
  }, []);

  // Refinement handler
  const handleRefine = useCallback(async () => {
    setLoading(true);

    const relevantIds = Object.keys(feedback)
      .filter((id) => feedback[id] === "relevant")
      .map(Number);
    const irrelevantIds = Object.keys(feedback)
      .filter((id) => feedback[id] === "irrelevant")
      .map(Number);

    try {
      const textPayload = searchMode === SEARCH_MODE.TEXT ? currentQuery : null;
      const filePayload = searchMode === SEARCH_MODE.IMAGE ? selectedFile : null;

      const data = await api.refineSearch(
        textPayload,
        relevantIds,
        irrelevantIds,
        extraText,
        filePayload
      );
      setResults(data);
      setFeedback({});
      setExtraText("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Refinement failed:", error);
    } finally {
      setLoading(false);
    }
  }, [feedback, searchMode, currentQuery, extraText]);

  // Check if refinement should be shown
  const showRefinement = results.length > 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, md: 4 }, minHeight: "100vh" }}
      >
        <Header />

        <SearchBox
          onTextSearch={handleTextSearch}
          onImageSearch={handleImageSearch}
          loading={loading}
          onModeChange={setSearchMode}
        />

        {showRefinement && (
          <RefinementBar
            extraText={extraText}
            onExtraTextChange={setExtraText}
            onRefine={handleRefine}
            loading={loading}
            feedback={feedback}
          />
        )}

        <Box sx={{ flexGrow: 1 }}>
          {loading ? (
            <LoadingState message="Searching for images..." />
          ) : (
            <ResultsGrid
              results={results}
              feedback={feedback}
              onFeedback={handleFeedback}
            />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;

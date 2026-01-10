import axios from "axios";

const API_BASE = "http://localhost:8000";

export const searchByText = async (text) => {
  const response = await axios.post(`${API_BASE}/search/text`, null, {
    params: { query: text },
  });
  return response.data;
};

export const searchByImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`${API_BASE}/search/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const refineSearch = async (
  textQuery,
  relevantIds,
  irrelevantIds,
  feedbackText,
  imageFile
) => {
  const formData = new FormData();

  // Add text fields if they exist
  if (textQuery) formData.append("text_query", textQuery);
  if (feedbackText) formData.append("feedback_text", feedbackText);

  // Add arrays (stringify them for FormData)
  formData.append("relevant_images", JSON.stringify(relevantIds));
  formData.append("irrelevant_images", JSON.stringify(irrelevantIds));

  // Add Image File (The Fix)
  if (imageFile) {
    formData.append("file", imageFile);
  }

  const response = await axios.post(`${API_BASE}/refine`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

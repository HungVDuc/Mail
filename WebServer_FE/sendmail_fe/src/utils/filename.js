export const getOriginalFilename = (filename) => {
  const parts = filename.split("-");
  return parts.slice(0, -2).join("-") || filename;
};

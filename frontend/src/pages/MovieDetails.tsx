import { FC } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";

const MovieDetails: FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Movie Details
      </Typography>
      <Typography>Movie details page for ID: {id} coming soon...</Typography>
    </Box>
  );
};

export default MovieDetails;

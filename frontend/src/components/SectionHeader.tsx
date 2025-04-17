import { Box, Button, Typography } from "@mui/material";
import { FC } from "react";
import { Link } from "react-router-dom";
import { SectionHeaderProps } from "../utils/types";

const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  subtitle,
  viewAllLink,
  action,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        mb: 2,
      }}
    >
      <Box>
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box>
        {action
          ? action
          : viewAllLink && (
              <Button
                component={Link}
                to={viewAllLink}
                variant="text"
                size="small"
                sx={{ textTransform: "none" }}
              >
                Tümünü Gör
              </Button>
            )}
      </Box>
    </Box>
  );
};

export default SectionHeader;

import {
  StarBorder as StarBorderIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";

interface RatingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => Promise<void>;
  onDelete?: () => Promise<void>;
  movieTitle: string;
  initialRating?: number;
  existingRatingId?: number;
}

const RatingModal: FC<RatingModalProps> = ({
  open,
  onClose,
  onSubmit,
  onDelete,
  movieTitle,
  initialRating = 0,
  existingRatingId,
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    // Reset rating when modal opens
    if (open) {
      setRating(initialRating);
    }
  }, [open, initialRating]);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(rating);
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error("Error deleting rating:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getRatingLabel = (score: number): string => {
    switch (score) {
      case 1:
        return "Kötü";
      case 2:
        return "Vasat";
      case 3:
        return "Orta";
      case 4:
        return "İyi";
      case 5:
        return "Harika";
      default:
        return "Puanla";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Film Puanla
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {movieTitle}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bu filme kaç yıldız verirsiniz?
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <IconButton
              key={value}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              sx={{ color: "warning.main", fontSize: 40 }}
            >
              {value <= (hoveredRating || rating) ? (
                <StarIcon sx={{ fontSize: 40 }} />
              ) : (
                <StarBorderIcon sx={{ fontSize: 40 }} />
              )}
            </IconButton>
          ))}
        </Box>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" color="primary">
            {getRatingLabel(hoveredRating || rating)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {existingRatingId && onDelete && (
          <Button
            onClick={handleDelete}
            color="error"
            variant="outlined"
            disabled={isDeleting || isSubmitting}
          >
            {isDeleting ? "Siliniyor..." : "Puanı Sil"}
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={onClose}
          color="inherit"
          disabled={isSubmitting || isDeleting}
        >
          İptal
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={rating === 0 || isSubmitting || isDeleting}
        >
          {isSubmitting
            ? "Kaydediliyor..."
            : existingRatingId
            ? "Güncelle"
            : "Puanla"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingModal;

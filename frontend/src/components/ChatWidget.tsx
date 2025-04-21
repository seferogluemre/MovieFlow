import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardMedia,
  CircularProgress,
  Fab,
  Grid,
  IconButton,
  List,
  ListItem,
  Paper,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

// Define the actor structure
interface Actor {
  id: number;
  name: string;
  photo: string;
  biography?: string;
  birthYear?: number;
  nationality?: string;
}

// Define the movie structure
interface Movie {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  posterImage: string;
  director: string;
  rating: number;
  ageRating: string;
  genres?: {
    movieId: number;
    genreId: number;
    genre: {
      id: number;
      name: string;
    };
  }[];
  actors?: {
    movieId: number;
    actorId: number;
    role: string;
    actor: Actor;
  }[];
}

// Define the message structure
interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  movies?: Movie[]; // Optional movies to display with the message
  isStreaming?: boolean; // Flag for streaming messages
  partialText?: string; // For storing partial text during streaming
}

// Style for animated message appearance
const AnimatedListItem = styled(ListItem)<{ delay: number }>(({ delay }) => ({
  opacity: 0,
  animation: `fadeIn 0.3s ease forwards`,
  animationDelay: `${delay}ms`,
  "@keyframes fadeIn": {
    "0%": { opacity: 0, transform: "translateY(10px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
  },
}));

const ChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [streamingTimer, setStreamingTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all movies when component mounts
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get("/movies");
        if (response.data && response.data.results) {
          setAllMovies(response.data.results);
        } else if (Array.isArray(response.data)) {
          setAllMovies(response.data);
        } else {
          console.error("Unexpected movie data format:", response.data);
          // Use mock data if API fails
          setAllMovies([
            {
              id: 1,
              title: "Esaretin Bedeli",
              description:
                "İki mahkum yıllar içinde dostluk kurar ve ortak nezaket eylemleriyle teselli ve sonunda kurtuluş bulurlar.",
              releaseYear: 1994,
              duration: 142,
              posterImage:
                "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
              director: "Frank Darabont",
              rating: 4.9,
              ageRating: "MATURE",
              actors: [
                {
                  movieId: 1,
                  actorId: 1,
                  role: "Andy Dufresne",
                  actor: {
                    id: 1,
                    name: "Tim Robbins",
                    photo:
                      "https://m.media-amazon.com/images/M/MV5BMTI1OTYxNzAxOF5BMl5BanBnXkFtZTYwNTE5ODI4._V1_UY1200_CR151,0,630,1200_AL_.jpg",
                  },
                },
                {
                  movieId: 1,
                  actorId: 2,
                  role: "Ellis Boyd 'Red' Redding",
                  actor: {
                    id: 2,
                    name: "Morgan Freeman",
                    photo:
                      "https://m.media-amazon.com/images/M/MV5BMTc0MDMyMzI2OF5BMl5BanBnXkFtZTcwMzM2OTk1MQ@@._V1_.jpg",
                  },
                },
              ],
            },
            {
              id: 2,
              title: "Baba",
              description:
                "Yaşlanan bir organize suç hanedanının patriği, gizli imparatorluğunun kontrolünü isteksiz oğluna devreder.",
              releaseYear: 1972,
              duration: 175,
              posterImage:
                "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
              director: "Francis Ford Coppola",
              rating: 4.8,
              ageRating: "MATURE",
              actors: [
                {
                  movieId: 2,
                  actorId: 3,
                  role: "Don Vito Corleone",
                  actor: {
                    id: 3,
                    name: "Marlon Brando",
                    photo:
                      "https://m.media-amazon.com/images/M/MV5BMTg3MDYyMDE5OF5BMl5BanBnXkFtZTcwNjgyNTEzNA@@._V1_.jpg",
                  },
                },
                {
                  movieId: 2,
                  actorId: 4,
                  role: "Michael Corleone",
                  actor: {
                    id: 4,
                    name: "Al Pacino",
                    photo:
                      "https://m.media-amazon.com/images/M/MV5BMTQzMzg1ODAyNl5BMl5BanBnXkFtZTYwMjAxODQ1._V1_.jpg",
                  },
                },
              ],
            },
            {
              id: 3,
              title: "Kara Şövalye",
              description:
                "Joker olarak bilinen tehlike Gotham halkına yıkım ve kaos getirdiğinde, Batman adalete karşı savaşma yeteneğinin en büyük psikolojik ve fiziksel testlerinden birini kabul etmelidir.",
              releaseYear: 2008,
              duration: 152,
              posterImage:
                "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
              director: "Christopher Nolan",
              rating: 4.7,
              ageRating: "TEEN",
              actors: [
                {
                  movieId: 3,
                  actorId: 5,
                  role: "Bruce Wayne / Batman",
                  actor: {
                    id: 5,
                    name: "Christian Bale",
                    photo:
                      "https://m.media-amazon.com/images/M/MV5BMTkxMzk4MjQ4MF5BMl5BanBnXkFtZTcwMzExODQxOA@@._V1_.jpg",
                  },
                },
                {
                  movieId: 3,
                  actorId: 6,
                  role: "Joker",
                  actor: {
                    id: 6,
                    name: "Heath Ledger",
                    photo:
                      "https://m.media-amazon.com/images/M/MV5BMTI2NTY0NzA4MF5BMl5BanBnXkFtZTYwMjE1MDE0._V1_.jpg",
                  },
                },
              ],
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        // Use mock data if API fails
        setAllMovies([
          {
            id: 1,
            title: "Esaretin Bedeli",
            description:
              "İki mahkum yıllar içinde dostluk kurar ve ortak nezaket eylemleriyle teselli ve sonunda kurtuluş bulurlar.",
            releaseYear: 1994,
            duration: 142,
            posterImage:
              "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
            director: "Frank Darabont",
            rating: 4.9,
            ageRating: "MATURE",
            actors: [
              {
                movieId: 1,
                actorId: 1,
                role: "Andy Dufresne",
                actor: {
                  id: 1,
                  name: "Tim Robbins",
                  photo:
                    "https://m.media-amazon.com/images/M/MV5BMTI1OTYxNzAxOF5BMl5BanBnXkFtZTYwNTE5ODI4._V1_UY1200_CR151,0,630,1200_AL_.jpg",
                },
              },
              {
                movieId: 1,
                actorId: 2,
                role: "Ellis Boyd 'Red' Redding",
                actor: {
                  id: 2,
                  name: "Morgan Freeman",
                  photo:
                    "https://m.media-amazon.com/images/M/MV5BMTc0MDMyMzI2OF5BMl5BanBnXkFtZTcwMzM2OTk1MQ@@._V1_.jpg",
                },
              },
            ],
          },
          {
            id: 2,
            title: "Baba",
            description:
              "Yaşlanan bir organize suç hanedanının patriği, gizli imparatorluğunun kontrolünü isteksiz oğluna devreder.",
            releaseYear: 1972,
            duration: 175,
            posterImage:
              "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
            director: "Francis Ford Coppola",
            rating: 4.8,
            ageRating: "MATURE",
            actors: [
              {
                movieId: 2,
                actorId: 3,
                role: "Don Vito Corleone",
                actor: {
                  id: 3,
                  name: "Marlon Brando",
                  photo:
                    "https://m.media-amazon.com/images/M/MV5BMTg3MDYyMDE5OF5BMl5BanBnXkFtZTcwNjgyNTEzNA@@._V1_.jpg",
                },
              },
              {
                movieId: 2,
                actorId: 4,
                role: "Michael Corleone",
                actor: {
                  id: 4,
                  name: "Al Pacino",
                  photo:
                    "https://m.media-amazon.com/images/M/MV5BMTQzMzg1ODAyNl5BMl5BanBnXkFtZTYwMjAxODQ1._V1_.jpg",
                },
              },
            ],
          },
          {
            id: 3,
            title: "Kara Şövalye",
            description:
              "Joker olarak bilinen tehlike Gotham halkına yıkım ve kaos getirdiğinde, Batman adalete karşı savaşma yeteneğinin en büyük psikolojik ve fiziksel testlerinden birini kabul etmelidir.",
            releaseYear: 2008,
            duration: 152,
            posterImage:
              "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
            director: "Christopher Nolan",
            rating: 4.7,
            ageRating: "TEEN",
            actors: [
              {
                movieId: 3,
                actorId: 5,
                role: "Bruce Wayne / Batman",
                actor: {
                  id: 5,
                  name: "Christian Bale",
                  photo:
                    "https://m.media-amazon.com/images/M/MV5BMTkxMzk4MjQ4MF5BMl5BanBnXkFtZTcwMzExODQxOA@@._V1_.jpg",
                },
              },
              {
                movieId: 3,
                actorId: 6,
                role: "Joker",
                actor: {
                  id: 6,
                  name: "Heath Ledger",
                  photo:
                    "https://m.media-amazon.com/images/M/MV5BMTI2NTY0NzA4MF5BMl5BanBnXkFtZTYwMjE1MDE0._V1_.jpg",
                },
              },
            ],
          },
        ]);
      }
    };

    fetchMovies();
  }, []);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatHistory");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error("Error parsing saved messages", error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Navigate to movie details page
  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };

  // Improved actor search
  const findActorMovies = (
    query: string
  ): { movies: Movie[]; actorName: string } => {
    const normalizedQuery = query.toLowerCase().trim();

    // Extract actor name using regex
    const actorRegex =
      /(?:oyuncu|aktör|aktris|actor|oynayan|rol alan|başrol|filmler(?:i)?|movies?|neler).*?([a-zçğıöşüA-ZÇĞİÖŞÜ\s']+)(?:\s*(?:oyuncu|aktör|aktris|actor|oynayan|rol alan|başrol|filmler(?:i)?|movies?))?/i;
    const match = normalizedQuery.match(actorRegex);
    let actorName = "";

    if (match && match[1]) {
      actorName = match[1].trim();
    } else {
      // Remove common words and get what remains
      actorName = normalizedQuery
        .replace(
          /filmleri|filmler|film|movies|movie|neler|oyuncu|aktör|aktris|actor|oynayan|rol alan|başrol/g,
          ""
        )
        .trim();
    }

    console.log("Searching for actor:", actorName);

    if (actorName.length < 2) return { movies: [], actorName: "" };

    // Find movies with this actor
    const actorMovies = allMovies.filter((movie) => {
      if (!movie.actors || movie.actors.length === 0) return false;

      return movie.actors.some((actorData) => {
        const actorFullName = actorData.actor.name.toLowerCase();
        // Check both full name and parts of the name
        return (
          actorFullName.includes(actorName) ||
          actorName.includes(actorFullName) ||
          actorFullName
            .split(" ")
            .some(
              (namePart) => actorName.includes(namePart) && namePart.length > 2
            )
        );
      });
    });

    return { movies: actorMovies, actorName };
  };

  // Function to stream text word by word or character by character
  const streamText = (
    text: string,
    messageId: string,
    finalMovies?: Movie[]
  ) => {
    let index = 0;
    const words = text.split(" ");

    // Clear any existing timer
    if (streamingTimer) {
      clearInterval(streamingTimer);
    }

    // Create empty streaming message
    const streamingMessage: ChatMessage = {
      id: messageId,
      text: "",
      partialText: "",
      sender: "ai",
      timestamp: new Date(),
      isStreaming: true,
    };

    // Add initial empty message
    setMessages((prev) => [...prev, streamingMessage]);

    // Set timer to add words one by one
    const timer = setInterval(() => {
      if (index < words.length) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  partialText: [...words.slice(0, index + 1)].join(" "),
                }
              : msg
          )
        );
        index++;
      } else {
        // Streaming complete
        clearInterval(timer);
        setStreamingTimer(null);

        // Finalize message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  text: text,
                  partialText: undefined,
                  isStreaming: false,
                  movies: finalMovies,
                }
              : msg
          )
        );
      }
    }, 50); // Adjust speed of streaming

    setStreamingTimer(timer);
  };

  const filterMovies = (query: string): Movie[] => {
    const normalizedQuery = query.toLowerCase().trim();

    // Turkish keyword mapping to detect genres
    const genreKeywords: Record<string, string[]> = {
      aksiyon: ["aksiyon", "dövüş", "savaş", "macera"],
      komedi: ["komedi", "gülmek", "eğlence", "eğlenceli", "komik"],
      dram: ["dram", "drama", "dramatik"],
      korku: [
        "korku",
        "gerilim",
        "dehşet",
        "karanlık",
        "ürkütücü",
        "korkutucu",
      ],
      romantik: ["romantik", "aşk", "sevgi", "romantizm"],
      "bilim kurgu": [
        "bilim kurgu",
        "bilimkurgu",
        "sci-fi",
        "uzay",
        "gelecek",
        "teknoloji",
      ],
      tarihi: ["tarih", "tarihi", "eski çağlar", "historical"],
      belgesel: ["belgesel", "documentary", "gerçek olay"],
      biyografi: ["biyografi", "biography", "hayat hikayesi", "yaşam öyküsü"],
      suç: ["suç", "polisiye", "dedektif", "crime", "mafya", "gangster"],
    };

    // Check for actor keywords
    const actorKeywords = [
      "oyuncu",
      "aktör",
      "aktris",
      "actor",
      "oynayan",
      "rol alan",
      "başrol",
    ];
    const isActorQuery = actorKeywords.some((keyword) =>
      normalizedQuery.includes(keyword)
    );

    // If query is about actors
    if (isActorQuery) {
      // Remove actor-related words to isolate the actor name
      const actorName = normalizedQuery
        .replace(/oyuncu|aktör|aktris|actor|oynayan|rol alan|başrol/g, "")
        .replace(/filmleri|filmler|film|movies|movie/g, "")
        .trim();

      if (actorName.length < 3) return []; // Actor name too short to search

      return allMovies.filter((movie) => {
        // Check if actors data exists
        if (movie.actors && movie.actors.length > 0) {
          return movie.actors.some((actorData) =>
            actorData.actor.name.toLowerCase().includes(actorName)
          );
        }
        return false;
      });
    }

    // Check which genre keywords are present in the query
    const matchedGenres: string[] = [];
    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      if (keywords.some((keyword) => normalizedQuery.includes(keyword))) {
        matchedGenres.push(genre);
      }
    }

    // If we have matched genres, filter movies that have any of those genres
    if (matchedGenres.length > 0) {
      return allMovies.filter((movie) => {
        // If the movie has genres defined
        if (movie.genres && movie.genres.length > 0) {
          return movie.genres.some((g) =>
            matchedGenres.some((matchedGenre) =>
              g.genre.name.toLowerCase().includes(matchedGenre)
            )
          );
        }
        // If we don't have genres data, use title and description
        else {
          return matchedGenres.some(
            (genre) =>
              movie.title.toLowerCase().includes(genre) ||
              movie.description.toLowerCase().includes(genre)
          );
        }
      });
    }

    // If no genre keywords matched, search by movie title, director, or year
    return allMovies.filter((movie) => {
      return (
        movie.title.toLowerCase().includes(normalizedQuery) ||
        movie.director.toLowerCase().includes(normalizedQuery) ||
        movie.releaseYear.toString().includes(normalizedQuery)
      );
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Get user query in lowercase for easier matching
      const userQuery = inputValue.toLowerCase();
      const messageId = (Date.now() + 1).toString(); // Unique ID for AI message

      // Check if query is about actors
      const actorKeywords = [
        "oyuncu",
        "aktör",
        "aktris",
        "actor",
        "oynayan",
        "rol alan",
        "başrol",
        "filmler",
      ];
      const isActorQuery = actorKeywords.some((keyword) =>
        userQuery.includes(keyword)
      );

      // Process differently based on query type
      if (isActorQuery) {
        // Find actor movies with improved function
        const { movies: actorMovies, actorName } = findActorMovies(userQuery);

        // Prepare actor-specific response
        if (actorMovies.length > 0) {
          const actorInfo = actorMovies[0].actors?.find((a) =>
            a.actor.name.toLowerCase().includes(actorName)
          );

          let aiResponse = "";
          if (actorInfo) {
            aiResponse = `"${actorInfo.actor.name}" adlı oyuncunun rol aldığı şu filmleri önerebilirim:\n\n`;
            // Add movie names to response
            actorMovies.forEach((movie, index) => {
              aiResponse += `${index + 1}. ${movie.title} (${
                movie.releaseYear
              })\n`;
            });
            aiResponse +=
              "\nBu filmlerden birini seçmek için kart üzerine tıklayabilirsiniz.";
          } else {
            aiResponse = `"${actorName}" adlı oyuncunun rol aldığı şu filmleri sistemimizde buldum:\n\n`;
            // Add movie names to response
            actorMovies.forEach((movie, index) => {
              aiResponse += `${index + 1}. ${movie.title} (${
                movie.releaseYear
              })\n`;
            });
            aiResponse +=
              "\nBu filmlerden birini seçmek için kart üzerine tıklayabilirsiniz.";
          }

          // Stream the response
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Thinking time
          streamText(aiResponse, messageId, actorMovies.slice(0, 3));
        } else {
          const aiResponse = `Üzgünüm, "${actorName}" adlı oyuncunun rol aldığı filmleri sistemimizde bulamadım. Lütfen başka bir oyuncu adı ile tekrar deneyin.`;
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Thinking time
          streamText(aiResponse, messageId);
        }
      } else {
        // Existing genre/movie filtering logic
        const matchedMovies = filterMovies(userQuery);
        const moviesToShow = matchedMovies.slice(0, 3);

        let aiResponse = "";
        if (moviesToShow.length > 0) {
          aiResponse = `Size sistemimizde bulunan şu filmleri önerebilirim:\n\n`;
          // Add movie names to response
          moviesToShow.forEach((movie, index) => {
            aiResponse += `${index + 1}. ${movie.title} (${
              movie.releaseYear
            })\n`;
          });
          aiResponse +=
            "\nBu filmlerden birini seçmek için kart üzerine tıklayabilirsiniz.";
        } else {
          aiResponse =
            "Üzgünüm, aradığınız kriterlere uygun film sistemde bulamadım. Lütfen farklı bir tür, yönetmen veya yıl belirterek tekrar deneyin. Örneğin: 'Aksiyon filmi öner' veya 'Al Pacino'nun oynadığı filmler neler?'";
        }

        // Stream the response
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Thinking time
        streamText(
          aiResponse,
          messageId,
          moviesToShow.length > 0 ? moviesToShow : undefined
        );
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      const errorId = (Date.now() + 1).toString();
      const errorMessage =
        "Üzgünüm, isteğinizi işlerken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
      streamText(errorMessage, errorId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  // Component cleanup
  useEffect(() => {
    return () => {
      // Clear timer on unmount
      if (streamingTimer) {
        clearInterval(streamingTimer);
      }
    };
  }, [streamingTimer]);

  return (
    <>
      {/* Chat toggle button */}
      <Fab
        color="primary"
        aria-label="chat"
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
        onClick={toggleChat}
      >
        <ChatIcon />
      </Fab>

      {/* Chat window */}
      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: { xs: "95%", sm: 500, md: 600 }, // Larger width
            maxWidth: "95%",
            height: { xs: 600, sm: 650 }, // Larger height
            maxHeight: "80vh",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SmartToyIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Film Önerileri</Typography>
            </Box>
            <Box>
              <IconButton
                size="small"
                color="inherit"
                onClick={clearChat}
                sx={{ mr: 1 }}
                title="Sohbet geçmişini temizle"
              >
                <DeleteIcon />
              </IconButton>
              <IconButton
                size="small"
                color="inherit"
                onClick={toggleChat}
                title="Kapat"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Messages area */}
          <Box
            sx={{
              p: 2,
              overflowY: "auto",
              flexGrow: 1,
              bgcolor: "background.default",
            }}
          >
            <List>
              {messages.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    opacity: 0.7,
                    textAlign: "center",
                    p: 2,
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1">
                    Merhaba! Ben sizin film öneri asistanınızım. Benden film
                    türlerine, oyunculara veya temalara göre film önerilerinde
                    bulunmamı isteyebilirsiniz.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Örnek: "Bana bir aksiyon filmi öner" veya "Al Pacino'nun
                    oynadığı filmler nelerdir?"
                  </Typography>
                </Box>
              ) : (
                messages.map((message, index) => (
                  <AnimatedListItem
                    key={message.id}
                    delay={index * 100}
                    sx={{
                      flexDirection: "column",
                      alignItems:
                        message.sender === "user" ? "flex-end" : "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection:
                          message.sender === "user" ? "row-reverse" : "row",
                        alignItems: "flex-start",
                        width: "100%",
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor:
                            message.sender === "user"
                              ? "primary.main"
                              : "secondary.main",
                          width: 36,
                          height: 36,
                          mr: message.sender === "user" ? 0 : 1,
                          ml: message.sender === "user" ? 1 : 0,
                        }}
                      >
                        {message.sender === "user" ? (
                          <PersonIcon />
                        ) : (
                          <SmartToyIcon />
                        )}
                      </Avatar>

                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: "85%",
                          borderRadius: 2,
                          bgcolor:
                            message.sender === "user"
                              ? "primary.light"
                              : "background.paper",
                          color:
                            message.sender === "user"
                              ? "primary.contrastText"
                              : "text.primary",
                        }}
                      >
                        <Typography variant="body1" component="div">
                          {message.isStreaming && message.partialText
                            ? message.partialText
                            : message.text.split("\n").map((line, i) => (
                                <React.Fragment key={i}>
                                  {line}
                                  <br />
                                </React.Fragment>
                              ))}
                          {message.isStreaming && (
                            <Box
                              component="span"
                              sx={{
                                display: "inline-block",
                                width: "0.5em",
                                height: "1em",
                                bgcolor: "text.primary",
                                ml: 0.5,
                                animation: "blink 1s step-end infinite",
                                "@keyframes blink": {
                                  "0%": { opacity: 1 },
                                  "50%": { opacity: 0 },
                                  "100%": { opacity: 1 },
                                },
                              }}
                            />
                          )}
                        </Typography>
                      </Paper>
                    </Box>

                    {/* Show movies only after streaming is complete */}
                    {!message.isStreaming &&
                      message.movies &&
                      message.movies.length > 0 && (
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          {message.movies.map((movie) => (
                            <Grid item xs={12} key={movie.id}>
                              <Card sx={{ mb: 1 }}>
                                <CardActionArea
                                  onClick={() => handleMovieClick(movie.id)}
                                >
                                  <Box sx={{ display: "flex", height: 120 }}>
                                    <CardMedia
                                      component="img"
                                      sx={{ width: 80, objectFit: "cover" }}
                                      image={movie.posterImage}
                                      alt={movie.title}
                                    />
                                    <Box sx={{ p: 1, overflow: "hidden" }}>
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        noWrap
                                      >
                                        {movie.title} ({movie.releaseYear})
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        noWrap
                                      >
                                        {movie.director}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical",
                                        }}
                                      >
                                        {movie.description}
                                      </Typography>

                                      {/* Show actors if available */}
                                      {movie.actors &&
                                        movie.actors.length > 0 && (
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mt: 0.5 }}
                                          >
                                            Oyuncular:{" "}
                                            {movie.actors
                                              .slice(0, 2)
                                              .map((a) => a.actor.name)
                                              .join(", ")}
                                            {movie.actors.length > 2
                                              ? " vb."
                                              : ""}
                                          </Typography>
                                        )}
                                    </Box>
                                  </Box>
                                </CardActionArea>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}

                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        mt: 0.5,
                        alignSelf:
                          message.sender === "user" ? "flex-end" : "flex-start",
                        mr: message.sender === "user" ? 6 : 0,
                        ml: message.sender === "user" ? 0 : 6,
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </AnimatedListItem>
                ))
              )}
              {isLoading && (
                <Box
                  sx={{ display: "flex", alignItems: "center", mt: 1, ml: 1 }}
                >
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  <Typography variant="body2">Düşünüyor...</Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          {/* Input area */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <TextField
              fullWidth
              placeholder="Film önerileri iste... (örn: Al Pacino'nun filmleri)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              multiline
              maxRows={3}
              variant="outlined"
              size="small"
              disabled={isLoading}
              sx={{ mr: 1 }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="large"
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default ChatWidget;

// Helper icon components
const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

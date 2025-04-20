import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FriendshipProvider } from "./context/FriendshipContext";
import { ThemeProvider } from "./context/ThemeContext";
import routes from "./router/routes";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FriendshipProvider>
          <RouterProvider router={routes} />
        </FriendshipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

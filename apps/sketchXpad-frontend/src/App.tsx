import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { HomePage } from "./pages/HomePage.tsx";
import { AuthPage } from "./pages/authPage.tsx";
import Canvas from "./components/canvas/[roomId]/page.tsx";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const userType = localStorage.getItem("userType");

  if (!userType && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Wrapper component to provide routing inside AuthProvider
function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/canvas"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/canvas/:roomId"
          element={
            <ProtectedRoute>
              <Canvas />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

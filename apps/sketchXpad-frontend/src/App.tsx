import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage.tsx";
import { AuthPage } from "./pages/authPage.tsx";
import Canvas from "./components/canvas/[roomId]/page.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/canvas/:roomId" element={<Canvas />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import InboxPage from "./pages/InboxPage";
import SentPage from "./pages/SentPage";
import ComposePage from "./pages/ComposePage";
import LaoIDCallback from "./components/LaoIDCallback";
import Layout from "./components/Layout";
import Register from "./pages/RegisterPage"

function App() {
  const { token, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/laoid/auth/callback" element={<LaoIDCallback />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                <Layout logout={logout}>
                  <InboxPage />
                </Layout>
              }
            />
            <Route
              path="/sent"
              element={
                <Layout logout={logout}>
                  <SentPage />
                </Layout>
              }
            />
            <Route
              path="/compose"
              element={
                <Layout logout={logout}>
                  <ComposePage />
                </Layout>
              }
            />
            {/* <Route path="/search" element={<SearchPage />} /> */}

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

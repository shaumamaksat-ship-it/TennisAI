import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import MatchesPage from "./pages/MatchesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FavoritesPage from "./pages/FavoritesPage";
import PlayerPage from "./pages/PlayerPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileNotifications from "./pages/ProfileNotifications";
import ProfileLanguage from "./pages/ProfileLanguage";
import ProfileTheme from "./pages/ProfileTheme";
import ProfileHelp from "./pages/ProfileHelp";
import ProfileAbout from "./pages/ProfileAbout";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ToastHost from "./components/ToastHost";
import FavoritesWatcher from "./components/FavoritesWatcher";
import AutoTrainer from "./components/AutoTrainer";
import MatchPage from "./pages/MatchPage";

export default function App() {
  return (
    <BrowserRouter>
      <ToastHost />
      <AutoTrainer />
      <FavoritesWatcher />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/player/:playerKey" element={<PlayerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/notifications" element={<ProfileNotifications />} />
        <Route path="/profile/language" element={<ProfileLanguage />} />
        <Route path="/profile/theme" element={<ProfileTheme />} />
        <Route path="/profile/help" element={<ProfileHelp />} />
        <Route path="/profile/about" element={<ProfileAbout />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/match" element={<MatchPage />} />
        <Route path="/match/:id" element={<MatchPage />} />
      </Routes>
    </BrowserRouter>
  );
}

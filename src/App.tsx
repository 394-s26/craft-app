import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthGate } from './components/AuthGate';
import { NavBar } from './components/NavBar';
import { AuthProvider } from './context/AuthContext';
import { CraftProvider } from './context/CraftContext';
import { FriendProvider } from './context/FriendContext';
import { CraftDetailPage } from './pages/CraftDetailPage';
import { FolderPage } from './pages/FolderPage';
import { FriendsPage } from './pages/FriendsPage';
import { HomePage } from './pages/HomePage';
import { NewCraftPage } from './pages/NewCraftPage';
import { PublicCraftPage } from './pages/PublicCraftPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShoppingListPage } from './pages/ShoppingListPage';

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/public/:craftId" element={<PublicCraftPage />} />
        <Route path="*" element={
          <AuthGate>
            <CraftProvider>
              <FriendProvider>
                <div className="min-h-screen flex flex-col bg-ghibli-light text-stone-900">
                  <NavBar />

                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/inspiration" element={<FolderPage status={["inspiration"]} title="Inspiration" />} />
                      <Route path="/work" element={<FolderPage status={["work-in-progress", "completed"]} title="My Work" />} />
                      <Route path="/shopping-list" element={<ShoppingListPage />} />
                      <Route path="/friends" element={<FriendsPage />} />
                      <Route path="/new" element={<NewCraftPage />} />
                      <Route path="/crafts/:craftId" element={<CraftDetailPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>

                  <footer className="py-4 text-center text-sm text-stone-500">
                    Made with React.
                  </footer>
                </div>
              </FriendProvider>
            </CraftProvider>
          </AuthGate>
        } />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

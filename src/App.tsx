import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthGate } from './components/AuthGate';
import { NavBar } from './components/NavBar';
import { AuthProvider } from './context/AuthContext';
import { CraftProvider } from './context/CraftContext';
import { CraftDetailPage } from './pages/CraftDetailPage';
import { FolderPage } from './pages/FolderPage';
import { HomePage } from './pages/HomePage';
import { NewCraftPage } from './pages/NewCraftPage';
import { ShoppingListPage } from './pages/ShoppingListPage';

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AuthGate>
        <CraftProvider>
          <div className="min-h-screen bg-amber-50 text-stone-900">
            <NavBar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/inspiration" element={<FolderPage status={["inspiration"]} title="Inspiration" description="A private folder for ideas from Instagram, Etsy, patterns, blogs, photos, or anything else you want to make later." />} />
              {/* <Route path="/work-in-progress" element={<FolderPage status="work-in-progress" title="Work in Progress" description="All active projects with photos, descriptions, and materials you can update as you make progress." />} />
              <Route path="/completed" element={<FolderPage status="completed" title="Completed" description="A finished gallery of crafts you have completed and want to remember." />} /> */}
              <Route path="/work" element={<FolderPage status={["work-in-progress", "completed"]} title="My Work" description="All your projects with photos, descriptions, and materials you can update as you make progress."/> } />
              <Route path="/shopping-list" element={<ShoppingListPage />} />
              <Route path="/new" element={<NewCraftPage />} />
              <Route path="/crafts/:craftId" element={<CraftDetailPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </CraftProvider>
      </AuthGate>
    </AuthProvider>
  </BrowserRouter>
);

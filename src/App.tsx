import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Páginas
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Watchlist from "./pages/Watchlist";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Foro from "./pages/Foro";
import Amigos from "./pages/Amigos";
import DetallesJuego from "./pages/DetallesJuego";
import PerfilUsuario from "./pages/PerfilUsuario"; // <-- Nueva página importada

// Componentes de control
import { RutaPro } from "./components/RutaPro"; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/watchlist" element={<Watchlist />} />
          
          {/* RUTA DEL JUEGO: Para escribir tu reseña */}
          <Route 
            path="/game/:id" 
            element={
              <RutaPro>
                <DetallesJuego />
              </RutaPro>
            } 
          />

          {/* RUTA DE RESEÑA ESPECÍFICA: Para ver la reseña de otros */}
          <Route 
            path="/review/:reviewId" 
            element={
              <RutaPro>
                <DetallesJuego />
              </RutaPro>
            } 
          />
          
          {/* --- RUTAS PROTEGIDAS --- */}
          <Route 
            path="/profile" 
            element={
              <RutaPro>
                <Profile />
              </RutaPro>
            } 
          />

          {/* NUEVA RUTA: Perfil Público de otros usuarios */}
          <Route 
            path="/user/:userId" 
            element={
              <RutaPro>
                <PerfilUsuario />
              </RutaPro>
            } 
          />

          <Route 
            path="/forum" 
            element={
              <RutaPro>
                <Foro />
              </RutaPro>
            } 
          />

          <Route 
            path="/friends" 
            element={
              <RutaPro>
                <Amigos />
              </RutaPro>
            } 
          />
          
          {/* --- RUTA 404 --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
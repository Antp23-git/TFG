import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Por favor, rellena todos los campos");
    
    setLoading(true);
    
    if (isLogin) {
      // INTENTO DE LOGIN
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // ERROR PERSONALIZADO: Si el usuario no existe o los datos están mal
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Datos incorrectos", {
            description: "No encontramos esta cuenta. ¿Quizás querías registrarte?",
            action: {
              label: "Crear Cuenta",
              onClick: () => setIsLogin(false), // Le cambia el formulario a registro automáticamente
            },
          });
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("¡Hola de nuevo!");
        navigate("/");
      }
    } else {
      // INTENTO DE REGISTRO
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error("Error al registrarse: " + error.message);
      } else {
        toast.success("¡Cuenta creada! Ya puedes empezar tu diario.");
        navigate("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <motion.div 
        layout
        className="w-full max-w-md space-y-8 bg-muted/30 p-8 rounded-2xl border border-border shadow-2xl backdrop-blur-sm"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold font-display text-primary tracking-tighter italic uppercase">GAMEBOXD</h1>
          <p className="text-muted-foreground mt-2 text-sm italic">
            {isLogin ? "Inicia sesión para ver tu diario" : "Crea tu cuenta gratuita"}
          </p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2"
            >
              <Input 
                type="email" 
                placeholder="Email (ej: usuario@tfg.com)" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-muted focus:border-primary/50"
              />
              <Input 
                type="password" 
                placeholder="Contraseña (mín. 6 caracteres)" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-muted focus:border-primary/50"
              />
            </motion.div>
          </AnimatePresence>
          
          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" disabled={loading} className="w-full font-bold text-white shadow-lg shadow-primary/20">
              {loading ? "Cargando..." : (isLogin ? "Entrar" : "Unirse ahora")}
            </Button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f0f0f] px-2 text-muted-foreground font-mono">o</span>
              </div>
            </div>
            
            <Button 
              type="button"
              onClick={() => setIsLogin(!isLogin)} 
              variant="outline" 
              className="w-full border-muted-foreground/20 hover:bg-muted text-sm"
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entra aquí"}
            </Button>

            <button 
              type="button"
              onClick={() => navigate("/")}
              className="mt-2 text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 decoration-muted-foreground/30 mx-auto"
            >
              Seguir sin iniciar sesión
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
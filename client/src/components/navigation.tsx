import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuthQuery } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const { data: user } = useAuthQuery();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Header for desktop */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-primary/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity" data-testid="link-home">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                <span className="material-icons text-white text-lg">fitness_center</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Apaddicto</h1>
                <p className="text-sm text-muted-foreground">Thérapie par le mouvement</p>
              </div>
            </Link>
            
            {/* Desktop navigation - hidden on mobile */}
            <nav className="hidden md:flex items-center space-x-2">
              <Link to="/" className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all duration-200", 
                isActive("/") 
                  ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )} data-testid="nav-dashboard">
                Accueil
              </Link>
              <Link to="/exercises" className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive("/exercises") 
                  ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )} data-testid="nav-exercises">
                Exercices
              </Link>
              <Link to="/tracking" className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive("/tracking") 
                  ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )} data-testid="nav-tracking">
                Suivi
              </Link>
              <Link to="/education" className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive("/education") 
                  ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )} data-testid="nav-education">
                Éducation
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  isActive("/admin")
                    ? "bg-destructive text-destructive-foreground shadow-lg scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                )} data-testid="nav-admin">
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-2">
              <Link to="/profile" className="w-10 h-10 bg-gradient-to-r from-secondary to-primary rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110" data-testid="link-profile">
                <span className="material-icons text-sm">person</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom navigation for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-primary/10 z-40 shadow-lg">
        <div className={cn("grid h-16", user?.role === 'admin' ? 'grid-cols-6' : 'grid-cols-5')}>
          <Link to="/" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
            isActive("/") ? "text-primary" : "text-muted-foreground hover:text-primary"
          )} data-testid="nav-mobile-home">
            <span className="material-icons text-lg">dashboard</span>
            <span className="text-xs">Accueil</span>
          </Link>
          <Link to="/exercises" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
            isActive("/exercises") ? "text-primary" : "text-muted-foreground hover:text-primary"
          )} data-testid="nav-mobile-exercises">
            <span className="material-icons text-lg">fitness_center</span>
            <span className="text-xs">Exercices</span>
          </Link>
          <Link to="/tracking" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
            isActive("/tracking") ? "text-primary" : "text-muted-foreground hover:text-primary"
          )} data-testid="nav-mobile-tracking">
            <span className="material-icons text-lg">analytics</span>
            <span className="text-xs">Suivi</span>
          </Link>
          <Link to="/education" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
            isActive("/education") ? "text-primary" : "text-muted-foreground hover:text-primary"
          )} data-testid="nav-mobile-education">
            <span className="material-icons text-lg">school</span>
            <span className="text-xs">Éducation</span>
          </Link>
          <Link to="/profile" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
            isActive("/profile") ? "text-primary" : "text-muted-foreground hover:text-primary"
          )} data-testid="nav-mobile-profile">
            <span className="material-icons text-lg">person</span>
            <span className="text-xs">Profil</span>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={cn("flex flex-col items-center justify-center space-y-1 transition-colors",
              isActive("/admin") ? "text-destructive" : "text-muted-foreground hover:text-destructive"
            )} data-testid="nav-mobile-admin">
              <span className="material-icons text-lg">admin_panel_settings</span>
              <span className="text-xs">Admin</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLoginMutation, useRegisterMutation, useAuthQuery } from "@/hooks/use-auth";
import { Instagram } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: user, isLoading } = useAuthQuery();

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "patient",
  });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  // ✅ Redirection uniquement si l'utilisateur est connecté
  useEffect(() => {
    if (user && !isLoading) {
      // Petite delay pour éviter le flash
      const timer = setTimeout(() => {
        setLocation("/"); // Redirection vers la page d'accueil (Dashboard)
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation côté client
    const { email, password } = loginForm;
    
    if (!email.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Mot de passe requis",
        description: "Veuillez saisir votre mot de passe",
        variant: "destructive",
      });
      return;
    }

    try {
      await loginMutation.mutateAsync(loginForm);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans votre espace thérapeutique",
      });
      // Redirection immédiate après login réussi
      setLocation("/");
    } catch (error) {
      let errorMessage = "Vérifiez vos identifiants";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation côté client
    const { email, password, firstName, lastName } = registerForm;
    
    // Validation email
    if (!email.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Email invalide",
        description: "Veuillez saisir une adresse email valide",
        variant: "destructive",
      });
      return;
    }

    // Validation mot de passe
    if (!password) {
      toast({
        title: "Mot de passe requis",
        description: "Veuillez saisir un mot de passe",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 4) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 4 caractères",
        variant: "destructive",
      });
      return;
    }

    if (password.length > 100) {
      toast({
        title: "Mot de passe trop long",
        description: "Le mot de passe ne peut pas dépasser 100 caractères",
        variant: "destructive",
      });
      return;
    }

    // Validation des noms (optionnels mais limités)
    if (firstName && firstName.length > 50) {
      toast({
        title: "Prénom trop long",
        description: "Le prénom ne peut pas dépasser 50 caractères",
        variant: "destructive",
      });
      return;
    }

    if (lastName && lastName.length > 50) {
      toast({
        title: "Nom trop long",
        description: "Le nom ne peut pas dépasser 50 caractères",
        variant: "destructive",
      });
      return;
    }

    try {
      await registerMutation.mutateAsync(registerForm);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Bienvenue !",
      });
      // Redirection immédiate après inscription réussie
      setLocation("/");
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de l'inscription";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Apaddicto</h1>
          <p className="text-gray-600">Votre parcours de bien-être commence ici</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Accès à votre espace</CardTitle>
            <CardDescription>
              Connectez-vous ou créez votre compte pour accéder à vos exercices et contenus personnalisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>

              {/* ✅ FORMULAIRE DE CONNEXION */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>

              {/* ✅ FORMULAIRE D'INSCRIPTION */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstName">Prénom</Label>
                      <Input
                        id="register-firstName"
                        type="text"
                        value={registerForm.firstName}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-lastName">Nom</Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        value={registerForm.lastName}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mot de passe</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-role">Rôle (patient ou admin)</Label>
                    <Input
                      id="register-role"
                      type="text"
                      value={registerForm.role}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, role: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? "Création..." : "Créer mon compte"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ✅ LIEN INSTAGRAM */}
        <div className="mt-6 text-center">
          <a
            href="https://instagram.com/apaperigueux"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <Instagram size={20} />
            <span>Suivez-nous sur Instagram @apaperigueux</span>
          </a>
        </div>
      </div>
    </div>
  );
}

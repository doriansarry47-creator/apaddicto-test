import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Search, Filter, Grid, List, Star, TrendingUp, Heart, Brain, Target, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { PsychoEducationContent, Exercise } from "../../../shared/schema";

// Catégories avec icônes et couleurs
const CATEGORIES = [
  { 
    value: "addiction", 
    label: "Addiction & Dépendance", 
    icon: Brain, 
    color: "bg-red-50 text-red-700 border-red-200",
    description: "Comprendre les mécanismes de l'addiction"
  },
  { 
    value: "coping", 
    label: "Stratégies d'Adaptation", 
    icon: Heart, 
    color: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Techniques pour gérer stress et émotions"
  },
  { 
    value: "motivation", 
    label: "Motivation & Objectifs", 
    icon: Target, 
    color: "bg-green-50 text-green-700 border-green-200",
    description: "Maintenir la motivation et atteindre ses buts"
  },
  { 
    value: "relapse_prevention", 
    label: "Prévention des Rechutes", 
    icon: Shield, 
    color: "bg-orange-50 text-orange-700 border-orange-200",
    description: "Anticiper et éviter les rechutes"
  },
  { 
    value: "stress_management", 
    label: "Gestion du Stress", 
    icon: TrendingUp, 
    color: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Techniques avancées de gestion du stress"
  },
  { 
    value: "emotional_regulation", 
    label: "Régulation Émotionnelle", 
    icon: Heart, 
    color: "bg-pink-50 text-pink-700 border-pink-200",
    description: "Maîtriser ses émotions au quotidien"
  }
];

const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800", 
  advanced: "bg-red-100 text-red-800"
};

const DIFFICULTY_LABELS = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé"
};

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: content = [], isLoading: contentLoading } = useQuery<PsychoEducationContent[]>({
    queryKey: ["psycho-education"],
    queryFn: async () => apiRequest("GET", "/api/psycho-education").then(res => res.json()),
    initialData: [],
  });

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: async () => apiRequest("GET", "/api/exercises").then(res => res.json()),
    initialData: [],
  });

  // Filtrer le contenu
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || item.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty && item.isActive;
  });

  // Filtrer les exercices
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "all" || exercise.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty && exercise.isActive;
  });

  // Regrouper par catégorie
  const contentByCategory = CATEGORIES.reduce((acc, category) => {
    acc[category.value] = filteredContent.filter(item => item.category === category.value);
    return acc;
  }, {} as Record<string, PsychoEducationContent[]>);

  const ContentCard = ({ item }: { item: PsychoEducationContent }) => {
    const category = CATEGORIES.find(cat => cat.value === item.category);
    const IconComponent = category?.icon || BookOpen;

    return (
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-100'}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {category?.label}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={DIFFICULTY_COLORS[item.difficulty as keyof typeof DIFFICULTY_COLORS]}>
                {DIFFICULTY_LABELS[item.difficulty as keyof typeof DIFFICULTY_LABELS]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.description || item.content?.substring(0, 120) + "..."}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              <span>{item.estimatedReadTime || 5} min</span>
            </div>
            <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
              Lire
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ExerciseCard = ({ exercise }: { exercise: Exercise }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base group-hover:text-primary transition-colors">
            {exercise.title}
          </CardTitle>
          <Badge className={DIFFICULTY_COLORS[exercise.difficulty as keyof typeof DIFFICULTY_COLORS]}>
            {DIFFICULTY_LABELS[exercise.difficulty as keyof typeof DIFFICULTY_LABELS]}
          </Badge>
        </div>
        <CardDescription>{exercise.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>{exercise.duration} min</span>
          </div>
          <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
            Commencer
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (contentLoading || exercisesLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Bibliothèque de Contenus</h1>
        </div>
        <p className="text-muted-foreground">
          Découvrez nos ressources pour votre parcours de rétablissement
        </p>
      </div>

      {/* Filtres et recherche */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher du contenu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Difficulté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{filteredContent.length}</div>
            <div className="text-sm text-muted-foreground">Articles disponibles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{filteredExercises.length}</div>
            <div className="text-sm text-muted-foreground">Exercices pratiques</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(filteredContent.reduce((acc, item) => acc + (item.estimatedReadTime || 5), 0))}
            </div>
            <div className="text-sm text-muted-foreground">Minutes de lecture</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{CATEGORIES.length}</div>
            <div className="text-sm text-muted-foreground">Catégories</div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Par Catégories</TabsTrigger>
          <TabsTrigger value="exercises">Exercices</TabsTrigger>
          <TabsTrigger value="all">Tout le Contenu</TabsTrigger>
        </TabsList>

        {/* Vue par catégories */}
        <TabsContent value="categories">
          <div className="space-y-8">
            {CATEGORIES.map(category => {
              const categoryContent = contentByCategory[category.value];
              if (!categoryContent?.length) return null;

              const IconComponent = category.icon;
              
              return (
                <div key={category.value}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{category.label}</h2>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <Badge variant="outline">{categoryContent.length}</Badge>
                  </div>
                  
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {categoryContent.map(item => (
                      <ContentCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Vue exercices */}
        <TabsContent value="exercises">
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredExercises.map(exercise => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </TabsContent>

        {/* Vue tout le contenu */}
        <TabsContent value="all">
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredContent.map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Message si aucun résultat */}
      {filteredContent.length === 0 && filteredExercises.length === 0 && (
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun contenu trouvé</h3>
            <p className="text-muted-foreground">
              Essayez d'ajuster vos filtres ou votre terme de recherche.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPsychoEducationContentSchema } from "../../../shared/schema";
import type { PsychoEducationContent, InsertPsychoEducationContent, QuickResource, InsertQuickResource } from "../../../shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, Clock, BookOpen, Video, Headphones, Gamepad2, Zap, Pin, Settings } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";

type FormData = InsertPsychoEducationContent;

// Catégories prédéfinies pour le contenu psycho-éducationnel
const PSYCHO_EDUCATION_CATEGORIES = [
  { value: "addiction", label: "Addiction et Dépendance" },
  { value: "motivation", label: "Motivation et Objectifs" },
  { value: "coping", label: "Stratégies d'Adaptation" },
  { value: "relapse_prevention", label: "Prévention des Rechutes" },
  { value: "stress_management", label: "Gestion du Stress" },
  { value: "emotional_regulation", label: "Régulation Émotionnelle" },
  { value: "mindfulness", label: "Pleine Conscience" },
  { value: "cognitive_therapy", label: "Thérapie Cognitive" },
  { value: "social_support", label: "Soutien Social" },
  { value: "lifestyle", label: "Mode de Vie Sain" },
];

// Types de contenu
const CONTENT_TYPES = [
  { value: "article", label: "Article" },
  { value: "video", label: "Vidéo" },
  { value: "audio", label: "Audio" },
  { value: "interactive", label: "Interactif" },
];

// Niveaux de difficulté
const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
];

export default function ManageContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: content, isLoading } = useQuery<PsychoEducationContent[]>({
    queryKey: ["admin", "psycho-education"],
    queryFn: async () => apiRequest("GET", "/api/admin/psycho-education").then(res => res.json()),
    initialData: [],
  });

  const mutation = useMutation({
    mutationFn: async (newContent: InsertPsychoEducationContent) => {
      // Si une image est sélectionnée, l'uploader d'abord
      let imageUrl = newContent.imageUrl;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        try {
          const uploadResponse = await fetch('/api/admin/media/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            imageUrl = uploadResult.url;
          }
        } catch (error) {
          console.warn('Image upload failed, proceeding without image');
        }
      }
      
      return apiRequest("POST", "/api/psycho-education", { ...newContent, imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "psycho-education"] });
      toast({ title: "Succès", description: "Contenu créé avec succès." });
      reset();
      setSelectedImage(null);
      setImagePreview(null);
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: (contentId: string) => apiRequest("DELETE", `/api/admin/psycho-education/${contentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "psycho-education"] });
      toast({ title: "Succès", description: "Contenu supprimé avec succès." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredContent = content?.filter(item => {
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesCategory && matchesType;
  }) || [];

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(insertPsychoEducationContentSchema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion du Contenu Psycho-Éducationnel</h1>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Contenu Éducatif</span>
          </TabsTrigger>
          <TabsTrigger value="quick-resources" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Ressources Rapides</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Gestion du Contenu</h2>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nouveau Contenu</span>
            </Button>
          </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category-filter">Catégorie</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {PSYCHO_EDUCATION_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Type de contenu</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{filteredContent.length}</div>
            <div className="text-sm text-muted-foreground">Contenus affichés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {content?.filter(c => c.type === 'article').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Articles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {content?.filter(c => c.type === 'video').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Vidéos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {content?.filter(c => c.type === 'interactive').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Interactifs</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire de création */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Créer du Contenu</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input id="title" {...register("title")} placeholder="Titre du contenu" />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {PSYCHO_EDUCATION_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <Label htmlFor="type">Type de contenu</Label>
                  <Select onValueChange={(value) => setValue("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <Select onValueChange={(value) => setValue("difficulty", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.difficulty && <p className="text-red-500 text-xs mt-1">{errors.difficulty.message}</p>}
                </div>

                <div>
                  <Label htmlFor="estimatedReadTime">Temps de lecture estimé (minutes)</Label>
                  <Input 
                    id="estimatedReadTime" 
                    type="number" 
                    {...register("estimatedReadTime", { valueAsNumber: true })} 
                    placeholder="10"
                  />
                  {errors.estimatedReadTime && <p className="text-red-500 text-xs mt-1">{errors.estimatedReadTime.message}</p>}
                </div>

                <div>
                  <Label htmlFor="content">Contenu (Markdown)</Label>
                  <Textarea 
                    id="content" 
                    {...register("content")} 
                    placeholder="Rédigez votre contenu en Markdown..."
                    rows={8}
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </div>

                <div>
                  <Label htmlFor="videoUrl">URL Vidéo (optionnel)</Label>
                  <Input 
                    id="videoUrl" 
                    {...register("videoUrl")} 
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <Label htmlFor="audioUrl">URL Audio (optionnel)</Label>
                  <Input 
                    id="audioUrl" 
                    {...register("audioUrl")} 
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>

                <div>
                  <Label htmlFor="image">Image</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    {imagePreview && (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Aperçu" 
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={mutation.isPending} className="w-full">
                  {mutation.isPending ? "Création..." : "Créer le Contenu"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Liste du contenu */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contenu Existant</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Chargement du contenu...</p>
              ) : (
                <div className="space-y-4">
                  {filteredContent.map((item) => (
                    <div key={item.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <Badge variant="outline">
                              {PSYCHO_EDUCATION_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                            </Badge>
                            <Badge variant="secondary">
                              {CONTENT_TYPES.find(t => t.value === item.type)?.label || item.type}
                            </Badge>
                            <Badge variant={
                              item.difficulty === 'beginner' ? 'default' :
                              item.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                            }>
                              {DIFFICULTY_LEVELS.find(d => d.value === item.difficulty)?.label || item.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {item.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            {item.estimatedReadTime && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{item.estimatedReadTime} min</span>
                              </span>
                            )}
                            {item.imageUrl && (
                              <span className="flex items-center space-x-1">
                                <Image className="h-4 w-4" />
                                <span>Image</span>
                              </span>
                            )}
                            {item.videoUrl && (
                              <span className="text-blue-600">Vidéo</span>
                            )}
                            {item.audioUrl && (
                              <span className="text-green-600">Audio</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer le contenu "{item.title}" ?
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteContentMutation.mutate(item.id)}
                                  disabled={deleteContentMutation.isPending}
                                >
                                  {deleteContentMutation.isPending ? "Suppression..." : "Supprimer"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {item.imageUrl && (
                        <div className="mt-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        <TabsContent value="quick-resources" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Gestion des Ressources Rapides</h2>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nouvelle Ressource</span>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Ressources Rapides</span>
              </CardTitle>
              <CardDescription>
                Gérez les ressources rapides et conseils instantanés disponibles pour les patients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fonctionnalité en cours de développement</p>
                <p className="text-sm">Les ressources rapides seront bientôt disponibles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

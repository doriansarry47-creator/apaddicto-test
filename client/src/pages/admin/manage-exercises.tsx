import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Exercise, InsertExercise } from "@shared/schema";
import { insertExerciseSchema } from "@shared/schema";
import { Dumbbell, Plus, Edit, Trash2, Image, Filter } from "lucide-react";

type FormData = InsertExercise;

// Catégories prédéfinies
const EXERCISE_CATEGORIES = [
  { value: "debutant", label: "Débutant" },
  { value: "cardio", label: "Cardio Training" },
  { value: "relaxation", label: "Relaxation" },
  { value: "respiration", label: "Exercices de Respiration" },
  { value: "meditation", label: "Méditation" },
  { value: "etirement", label: "Étirement" },
  { value: "renforcement", label: "Renforcement Musculaire" },
  { value: "mindfulness", label: "Pleine Conscience" },
];

// Niveaux de difficulté
const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" },
];

export default function ManageExercises() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["admin", "exercises"],
    queryFn: async () => apiRequest("GET", "/api/admin/exercises").then(res => res.json()),
    initialData: [],
  });

  const mutation = useMutation({
    mutationFn: async (newExercise: InsertExercise) => {
      // Si une image est sélectionnée, l'uploader d'abord
      let imageUrl = newExercise.imageUrl;
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
      
      return apiRequest("POST", "/api/exercises", { ...newExercise, imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] });
      toast({ title: "Succès", description: "Exercice créé avec succès." });
      reset();
      setSelectedImage(null);
      setImagePreview(null);
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: (exerciseId: string) => apiRequest("DELETE", `/api/admin/exercises/${exerciseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] });
      toast({ title: "Succès", description: "Exercice supprimé avec succès." });
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

  const filteredExercises = exercises?.filter(exercise => {
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
    return matchesCategory && matchesDifficulty;
  }) || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(insertExerciseSchema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion des Exercices</h1>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouvel Exercice</span>
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
                  {EXERCISE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty-filter">Difficulté</Label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
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
            <div className="text-2xl font-bold text-primary">{filteredExercises.length}</div>
            <div className="text-sm text-muted-foreground">Exercices affichés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {exercises?.filter(e => e.difficulty === 'beginner').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Débutant</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {exercises?.filter(e => e.difficulty === 'intermediate').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Intermédiaire</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {exercises?.filter(e => e.difficulty === 'advanced').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Avancé</div>
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
                <span>Créer un Exercice</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input id="title" {...register("title")} placeholder="Nom de l'exercice" />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select onValueChange={(value) => register("category").onChange({ target: { value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXERCISE_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <Select onValueChange={(value) => register("difficulty").onChange({ target: { value } })}>
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
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input 
                    id="duration" 
                    type="number" 
                    {...register("duration", { valueAsNumber: true })} 
                    placeholder="15"
                  />
                  {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    {...register("description")} 
                    placeholder="Description de l'exercice"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea 
                    id="instructions" 
                    {...register("instructions")} 
                    placeholder="Instructions détaillées"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="benefits">Bénéfices</Label>
                  <Textarea 
                    id="benefits" 
                    {...register("benefits")} 
                    placeholder="Bénéfices de cet exercice"
                    rows={3}
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
                  {mutation.isPending ? "Création..." : "Créer l'Exercice"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Liste des exercices */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Exercices Existants</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Chargement des exercices...</p>
              ) : (
                <div className="space-y-4">
                  {filteredExercises.map((exercise) => (
                    <div key={exercise.id} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-bold text-lg">{exercise.title}</h3>
                            <Badge variant="outline">
                              {EXERCISE_CATEGORIES.find(c => c.value === exercise.category)?.label || exercise.category}
                            </Badge>
                            <Badge variant={
                              exercise.difficulty === 'beginner' ? 'default' :
                              exercise.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                            }>
                              {DIFFICULTY_LEVELS.find(d => d.value === exercise.difficulty)?.label || exercise.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {exercise.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{exercise.duration} minutes</span>
                            {exercise.imageUrl && (
                              <span className="flex items-center space-x-1">
                                <Image className="h-4 w-4" />
                                <span>Image</span>
                              </span>
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
                                  Êtes-vous sûr de vouloir supprimer l'exercice "{exercise.title}" ?
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteExerciseMutation.mutate(exercise.id)}
                                  disabled={deleteExerciseMutation.isPending}
                                >
                                  {deleteExerciseMutation.isPending ? "Suppression..." : "Supprimer"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {exercise.imageUrl && (
                        <div className="mt-3">
                          <img 
                            src={exercise.imageUrl} 
                            alt={exercise.title}
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
      </div>
    </div>
  );
}

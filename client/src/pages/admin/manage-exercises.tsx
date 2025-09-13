import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExerciseSchema } from "../../../../shared/schema";
import type { Exercise, InsertExercise, EmergencyRoutine, InsertEmergencyRoutine } from "../../../../shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, Activity, AlertTriangle, Filter, Image, Clock, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type FormData = InsertExercise;

// Catégories prédéfinies (alignées avec la base de données)
const EXERCISE_CATEGORIES = [
  { value: "cardio", label: "Cardio Training" },
  { value: "strength", label: "Renforcement Musculaire" },
  { value: "flexibility", label: "Étirement & Flexibilité" },
  { value: "mindfulness", label: "Pleine Conscience & Méditation" },
  { value: "relaxation", label: "Relaxation" },
  { value: "respiration", label: "Exercices de Respiration" },
  { value: "meditation", label: "Méditation" },
  { value: "debutant", label: "Exercices Débutant" },
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
  const [emergencyRoutineSteps, setEmergencyRoutineSteps] = useState<string[]>(['']);

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["admin", "exercises"],
    queryFn: async () => apiRequest("GET", "/api/admin/exercises").then(res => res.json()),
    initialData: [],
  });

  const { data: emergencyRoutines, isLoading: isLoadingRoutines } = useQuery<EmergencyRoutine[]>({
    queryKey: ["admin", "emergency-routines"],
    queryFn: async () => apiRequest("GET", "/api/admin/emergency-routines").then(res => res.json()),
    initialData: [],
  });

  const mutation = useMutation({
    mutationFn: async (newExercise: InsertExercise) => {
      let imageUrl = newExercise.imageUrl;
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);

        try {
          const uploadResponse = await fetch("/api/admin/media/upload", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            imageUrl = uploadResult.url;
          }
        } catch (error) {
          console.warn("Image upload failed, proceeding without image");
        }
      }

      return apiRequest("POST", "/api/exercises", { ...newExercise, imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] });
      toast({
        title: "Succès",
        description: "Exercice créé avec succès.",
      });
      reset();
      setSelectedImage(null);
      setImagePreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: (exerciseId: string) => apiRequest("DELETE", `/api/admin/exercises/${exerciseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] });
      toast({
        title: "Succès",
        description: "Exercice supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const createRoutineMutation = useMutation({
    mutationFn: async (newRoutine: InsertEmergencyRoutine) => {
      return apiRequest("POST", "/api/admin/emergency-routines", newRoutine);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "emergency-routines"] });
      toast({
        title: "Succès",
        description: "Routine d'urgence créée avec succès.",
      });
      setEmergencyRoutineSteps(['']);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: (routineId: string) => apiRequest("DELETE", `/api/admin/emergency-routines/${routineId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "emergency-routines"] });
      toast({
        title: "Succès",
        description: "Routine d'urgence supprimée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const setDefaultRoutineMutation = useMutation({
    mutationFn: (routineId: string) => apiRequest("PUT", `/api/admin/emergency-routines/${routineId}/set-default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "emergency-routines"] });
      toast({
        title: "Succès",
        description: "Routine d'urgence définie comme routine par défaut.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Une erreur est survenue",
        variant: "destructive",
      });
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

  const filteredExercises =
    exercises?.filter((exercise) => {
      const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
      return matchesCategory && matchesDifficulty;
    }) || [];

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(insertExerciseSchema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  const addRoutineStep = () => {
    setEmergencyRoutineSteps([...emergencyRoutineSteps, '']);
  };

  const removeRoutineStep = (index: number) => {
    if (emergencyRoutineSteps.length > 1) {
      setEmergencyRoutineSteps(emergencyRoutineSteps.filter((_, i) => i !== index));
    }
  };

  const updateRoutineStep = (index: number, value: string) => {
    const newSteps = [...emergencyRoutineSteps];
    newSteps[index] = value;
    setEmergencyRoutineSteps(newSteps);
  };

  const handleCreateRoutine = (formData: FormData) => {
    const title = formData.get('routine-title') as string;
    const description = formData.get('routine-description') as string;
    const durationStr = formData.get('routine-duration') as string;
    const duration = durationStr ? parseInt(durationStr) : undefined;
    const category = formData.get('routine-category') as string;

    if (!title || emergencyRoutineSteps.filter(step => step.trim()).length === 0) {
      toast({
        title: "Erreur",
        description: "Le titre et au moins une étape sont requis.",
        variant: "destructive",
      });
      return;
    }

    const routine: InsertEmergencyRoutine = {
      title,
      description: description || undefined,
      duration: duration,
      category: category || 'general',
      steps: emergencyRoutineSteps.filter(step => step.trim()),
      isActive: true,
      isDefault: false
    };

    createRoutineMutation.mutate(routine);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion des Exercices</h1>
        </div>
      </div>

      <Tabs defaultValue="exercises" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercises" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Exercices</span>
          </TabsTrigger>
          <TabsTrigger value="emergency-routines" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Routines d\'Urgence</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet exercices */}
        <TabsContent value="exercises" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Gestion des Exercices</h2>
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
                  {exercises?.filter(e => e.difficulty === "beginner").length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Débutant</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {exercises?.filter(e => e.difficulty === "intermediate").length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Intermédiaire</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {exercises?.filter(e => e.difficulty === "advanced").length || 0}
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
                      <Input id="title" {...register("title")} placeholder="Nom de l\'exercice" />
                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <Select onValueChange={(value) => setValue("category", value)}>
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
                        placeholder="Description de l\'exercice"
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
                      {mutation.isPending ? "Création..." : "Créer l\'Exercice"}
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
                                <Badge
                                  variant={
                                    exercise.difficulty === "beginner"
                                      ? "default"
                                      : exercise.difficulty === "intermediate"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {DIFFICULTY_LEVELS.find(d => d.value === exercise.difficulty)?.label || exercise.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {exercise.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{exercise.duration} min</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Target className="h-4 w-4" />
                                  <span>{exercise.instructions}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Modifier l\'exercice</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action ne peut pas être annulée. Cela modifiera
                                      définitivement l\'exercice.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <form
                                    onSubmit={handleSubmit((data) => {
                                      // Logic for updating exercise
                                      console.log("Update data:", data);
                                    })}
                                    className="space-y-4"
                                  >
                                    <div>
                                      <Label htmlFor="edit-title">Titre</Label>
                                      <Input
                                        id="edit-title"
                                        defaultValue={exercise.title}
                                        {...register("title")}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-category">Catégorie</Label>
                                      <Select
                                        defaultValue={exercise.category}
                                        onValueChange={(value) => setValue("category", value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {EXERCISE_CATEGORIES.map((category) => (
                                            <SelectItem
                                              key={category.value}
                                              value={category.value}
                                            >
                                              {category.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-difficulty">Difficulté</Label>
                                      <Select
                                        defaultValue={exercise.difficulty}
                                        onValueChange={(value) => setValue("difficulty", value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {DIFFICULTY_LEVELS.map((level) => (
                                            <SelectItem
                                              key={level.value}
                                              value={level.value}
                                            >
                                              {level.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-duration">Durée (minutes)</Label>
                                      <Input
                                        id="edit-duration"
                                        type="number"
                                        defaultValue={exercise.duration}
                                        {...register("duration", { valueAsNumber: true })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-description">Description</Label>
                                      <Textarea
                                        id="edit-description"
                                        defaultValue={exercise.description}
                                        {...register("description")}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-instructions">Instructions</Label>
                                      <Textarea
                                        id="edit-instructions"
                                        defaultValue={exercise.instructions}
                                        {...register("instructions")}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="edit-benefits">Bénéfices</Label>
                                      <Textarea
                                        id="edit-benefits"
                                        defaultValue={exercise.benefits}
                                        {...register("benefits")}
                                      />
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <Button type="submit">Sauvegarder</Button>
                                    </AlertDialogFooter>
                                  </form>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action ne peut pas être annulée. Cela supprimera
                                      définitivement cet exercice de nos serveurs.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteExerciseMutation.mutate(exercise.id)}
                                    >
                                      Continuer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Onglet routines d\'urgence */}
        <TabsContent value="emergency-routines" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Gestion des Routines d\'Urgence</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire de création de routine */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Créer une Routine d\'Urgence</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    handleCreateRoutine(formData);
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="routine-title">Titre</Label>
                      <Input id="routine-title" name="routine-title" placeholder="Nom de la routine" required />
                    </div>

                    <div>
                      <Label htmlFor="routine-description">Description</Label>
                      <Textarea
                        id="routine-description"
                        name="routine-description"
                        placeholder="Description de la routine"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="routine-category">Catégorie</Label>
                      <Select name="routine-category" defaultValue="general">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Général</SelectItem>
                          <SelectItem value="breathing">Respiration</SelectItem>
                          <SelectItem value="grounding">Ancrage</SelectItem>
                          <SelectItem value="distraction">Distraction</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="routine-duration">Durée (minutes)</Label>
                      <Input
                        id="routine-duration"
                        name="routine-duration"
                        type="number"
                        placeholder="5"
                        min="1"
                        max="30"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Étapes de la routine</Label>
                        <Button type="button" size="sm" onClick={addRoutineStep}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {emergencyRoutineSteps.map((step, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={step}
                              onChange={(e) => updateRoutineStep(index, e.target.value)}
                              placeholder={`Étape ${index + 1}`}
                            />
                            {emergencyRoutineSteps.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeRoutineStep(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" disabled={createRoutineMutation.isPending} className="w-full">
                      {createRoutineMutation.isPending ? "Création..." : "Créer la Routine"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Liste des routines existantes */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Routines d\'Urgence Existantes</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingRoutines ? (
                    <p>Chargement des routines...</p>
                  ) : (
                    <div className="space-y-4">
                      {emergencyRoutines.map((routine) => (
                        <div key={routine.id} className="border p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-bold text-lg">{routine.title}</h3>
                                {routine.isDefault && (
                                  <Badge variant="default">
                                    Par défaut
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {routine.category === 'general' ? 'Général' : 
                                   routine.category === 'breathing' ? 'Respiration' :
                                   routine.category === 'grounding' ? 'Ancrage' : 
                                   routine.category === 'distraction' ? 'Distraction' : routine.category}
                                </Badge>
                              </div>
                              {routine.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {routine.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                {routine.duration && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{routine.duration} min</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Target className="h-4 w-4" />
                                  <span>{Array.isArray(routine.steps) ? routine.steps.length : 0} étape{Array.isArray(routine.steps) && routine.steps.length > 1 ? 's' : ''}</span>
                                </div>
                              </div>
                              <div className="text-sm">
                                <strong>Étapes :</strong>
                                <ol className="list-decimal list-inside mt-1 space-y-1">
                                  {Array.isArray(routine.steps) && routine.steps.map((step: string, index: number) => (
                                    <li key={index} className="text-muted-foreground">{step}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!routine.isDefault && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDefaultRoutineMutation.mutate(routine.id)}
                                >
                                  Définir par défaut
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action ne peut pas être annulée. Cela supprimera
                                      définitivement cette routine d\'urgence de nos serveurs.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteRoutineMutation.mutate(routine.id)}
                                    >
                                      Continuer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                      {emergencyRoutines.length === 0 && (
                        <div className="text-center py-8">
                          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Aucune routine d\'urgence créée. Créez-en une pour aider les patients en cas de craving intense.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


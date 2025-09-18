import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  exerciseId?: string;
  createdAt: string;
}

interface Exercise {
  id: string;
  title: string;
  category: string;
}

export default function ManageMedia() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const { data: mediaFiles, isLoading: mediaLoading } = useQuery<MediaFile[]>({
    queryKey: ["admin", "media"],
    queryFn: async () => apiRequest("GET", "/api/admin/media").then(res => res.json()),
    initialData: [],
  });

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ["admin", "exercises"],
    queryFn: async () => apiRequest("GET", "/api/admin/exercises").then(res => res.json()),
    initialData: [],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      toast({ title: "Succès", description: "Fichier téléchargé avec succès." });
      setSelectedFile(null);
      setSelectedExercise("");
      setDescription("");
      setIsUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => apiRequest("DELETE", `/api/admin/media/${mediaId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      toast({ title: "Succès", description: "Fichier supprimé avec succès." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Type de fichier non supporté",
          description: "Seuls les images (JPEG, PNG, GIF) et vidéos (MP4, WebM) sont acceptées.",
          variant: "destructive"
        });
        return;
      }
      
      // Vérifier la taille (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximale autorisée est de 50MB.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedExercise) {
      formData.append('exerciseId', selectedExercise);
    }
    if (description) {
      formData.append('description', description);
    }

    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');
  const isVideo = (mimeType: string) => mimeType.startsWith('video/');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Médias</h1>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <span className="material-icons mr-2">cloud_upload</span>
              Télécharger un fichier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Télécharger un nouveau fichier</DialogTitle>
              <DialogDescription>
                Ajoutez une image ou une vidéo pour les exercices.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="file">Fichier</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="exercise">Exercice associé (optionnel)</Label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un exercice" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises?.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.title} ({exercise.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du fichier..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Téléchargement..." : "Télécharger"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{mediaFiles?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total fichiers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mediaFiles?.filter(f => isImage(f.mimeType)).length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Images</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {mediaFiles?.filter(f => isVideo(f.mimeType)).length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Vidéos</div>
          </CardContent>
        </Card>
      </div>

      {/* Galerie de médias */}
      <Card>
        <CardHeader>
          <CardTitle>Galerie de Médias</CardTitle>
        </CardHeader>
        <CardContent>
          {mediaLoading ? (
            <p>Chargement des médias...</p>
          ) : mediaFiles?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun fichier média téléchargé.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaFiles?.map((media) => (
                <Card key={media.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {isImage(media.mimeType) ? (
                      <img
                        src={media.url}
                        alt={media.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : isVideo(media.mimeType) ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <div className="text-center">
                        <span className="material-icons text-4xl text-muted-foreground">
                          insert_drive_file
                        </span>
                        <p className="text-sm text-muted-foreground mt-2">
                          {media.mimeType}
                        </p>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate">{media.originalName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(media.size)} • {new Date(media.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    {media.exerciseId && (
                      <p className="text-sm text-blue-600 mt-1">
                        Associé à un exercice
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(media.url, '_blank')}
                      >
                        <span className="material-icons mr-1">open_in_new</span>
                        Voir
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(media.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <span className="material-icons mr-1">delete</span>
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


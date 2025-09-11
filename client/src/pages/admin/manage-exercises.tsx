import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Exercise, InsertExercise } from "@shared/schema";
import { insertExerciseSchema } from "@shared/schema";

type FormData = InsertExercise;

export default function ManageExercises() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["admin", "exercises"],
    queryFn: async () => apiRequest("GET", "/api/admin/exercises").then(res => res.json()),
    initialData: [],
  });

  const mutation = useMutation({
    mutationFn: (newExercise: InsertExercise) => apiRequest("POST", "/api/exercises", newExercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "exercises"] });
      toast({ title: "Success", description: "Exercise created successfully." });
      reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(insertExerciseSchema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Manage Exercises</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create New Exercise</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" {...register("category")} />
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register("description")} />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" {...register("duration", { valueAsNumber: true })} />
                </div>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating..." : "Create Exercise"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading exercises...</p>
              ) : (
                <div className="space-y-2">
                  {exercises?.map((exercise) => (
                    <div key={exercise.id} className="border p-4 rounded-lg">
                      <h3 className="font-bold">{exercise.title}</h3>
                      <p className="text-sm text-muted-foreground">{exercise.category} - {exercise.duration} mins</p>
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

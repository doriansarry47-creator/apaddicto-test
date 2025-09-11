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
import type { PsychoEducationContent, InsertPsychoEducationContent } from "@shared/schema";
import { insertPsychoEducationContentSchema } from "@shared/schema";

type FormData = InsertPsychoEducationContent;

export default function ManageContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery<PsychoEducationContent[]>({
    queryKey: ["admin", "psycho-education"],
    queryFn: async () => apiRequest("GET", "/api/admin/psycho-education").then(res => res.json()),
    initialData: [],
  });

  const mutation = useMutation({
    mutationFn: (newContent: InsertPsychoEducationContent) => apiRequest("POST", "/api/psycho-education", newContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "psycho-education"] });
      toast({ title: "Success", description: "Content created successfully." });
      reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(insertPsychoEducationContentSchema),
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Manage Psycho-Educational Content</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create New Content</CardTitle>
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
                  <Label htmlFor="content">Content (Markdown)</Label>
                  <Textarea id="content" {...register("content")} rows={10} />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </div>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating..." : "Create Content"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Content</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading content...</p>
              ) : (
                <div className="space-y-2">
                  {content?.map((item) => (
                    <div key={item.id} className="border p-4 rounded-lg">
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
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

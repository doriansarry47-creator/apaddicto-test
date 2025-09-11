import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Create, edit, and manage exercises and psycho-educational articles.
            </p>
            <div className="flex flex-col space-y-2">
              <Link to="/admin/manage-exercises">
                <Button variant="outline" className="w-full">Manage Exercises</Button>
              </Link>
              <Link to="/admin/manage-content">
                <Button variant="outline" className="w-full">Manage Content</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Patient Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Review patient progress and data. (Coming soon)
            </p>
            <Button disabled className="w-full">View Patients</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

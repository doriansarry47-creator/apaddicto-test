import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Calendar,
  User,
  TrendingUp,
  BarChart3
} from "lucide-react";

interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  lastLoginAt: string | null;
  exerciseCount: number;
  cravingCount: number;
}

interface ProfessionalReport {
  id: string;
  patientId: string;
  patient?: Patient;
  therapistId: string;
  reportType: 'weekly' | 'monthly' | 'session' | 'progress';
  title: string;
  content: string;
  data?: any;
  startDate?: string;
  endDate?: string;
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ProfessionalReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [reportType, setReportType] = useState<string>("weekly");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ProfessionalReport | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    reportType: 'weekly' as const,
    patientId: '',
    startDate: '',
    endDate: '',
    isPrivate: true,
    tags: [] as string[],
  });

  // Fetch patients
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      const allUsers = await response.json();
      return allUsers.filter((user: any) => user.role === 'patient');
    },
  });

  // Fetch reports
  const { data: reports, isLoading, refetch } = useQuery<ProfessionalReport[]>({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/professional-reports");
      return response.json();
    },
    initialData: [],
  });

  // Create/Update report mutation
  const saveReportMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingReport) {
        return apiRequest("PUT", `/api/admin/professional-reports/${editingReport.id}`, data);
      } else {
        return apiRequest("POST", "/api/admin/professional-reports", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      toast({ 
        title: "Succès", 
        description: editingReport ? "Rapport mis à jour" : "Rapport créé avec succès" 
      });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) => apiRequest("DELETE", `/api/admin/professional-reports/${reportId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      toast({ title: "Succès", description: "Rapport supprimé avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const filteredReports = reports?.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.patient?.firstName + ' ' + report.patient?.lastName).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || report.reportType === filterType;
    return matchesSearch && matchesType;
  }) || [];

  const handleSubmit = () => {
    if (!formData.title || !formData.content || !formData.patientId) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs requis", variant: "destructive" });
      return;
    }

    saveReportMutation.mutate(formData);
  };

  const handleEdit = (report: ProfessionalReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      content: report.content,
      reportType: report.reportType,
      patientId: report.patientId,
      startDate: report.startDate?.split('T')[0] || '',
      endDate: report.endDate?.split('T')[0] || '',
      isPrivate: report.isPrivate,
      tags: report.tags || [],
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReport(null);
    setFormData({
      title: '',
      content: '',
      reportType: 'weekly',
      patientId: '',
      startDate: '',
      endDate: '',
      isPrivate: true,
      tags: [],
    });
  };

  const generateAutomaticReport = async (patientId: string, type: string) => {
    try {
      const response = await apiRequest("POST", "/api/admin/generate-report", {
        patientId,
        reportType: type
      });
      const generatedReport = await response.json();
      
      setFormData({
        ...formData,
        title: generatedReport.title,
        content: generatedReport.content,
        patientId: patientId,
        reportType: type as any,
      });
      
      toast({ title: "Succès", description: "Rapport généré automatiquement" });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de générer le rapport automatiquement", variant: "destructive" });
    }
  };

  const reportTypeConfig = {
    weekly: { name: 'Hebdomadaire', color: 'bg-blue-500', icon: '📅' },
    monthly: { name: 'Mensuel', color: 'bg-green-500', icon: '📊' },
    session: { name: 'Session', color: 'bg-orange-500', icon: '🎯' },
    progress: { name: 'Progrès', color: 'bg-purple-500', icon: '📈' },
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Rapports Professionnels</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Rapport
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReport ? 'Modifier le rapport' : 'Créer un nouveau rapport'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient">Patient *</Label>
                  <Select value={formData.patientId} onValueChange={(value) => setFormData({...formData, patientId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName} ({patient.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reportType">Type de rapport *</Label>
                  <Select value={formData.reportType} onValueChange={(value: any) => setFormData({...formData, reportType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(reportTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.icon} {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                {formData.patientId && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAutomaticReport(formData.patientId, formData.reportType)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Générer automatiquement
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre du rapport *</Label>
                  <Input
                    placeholder="Ex: Rapport hebdomadaire - Semaine 12"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Contenu du rapport *</Label>
                  <Textarea
                    placeholder="Décrivez les observations, progrès, recommandations..."
                    className="min-h-[200px]"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                  />
                  <Label htmlFor="isPrivate">Rapport confidentiel</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit} disabled={saveReportMutation.isPending}>
                    {saveReportMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(reportTypeConfig).map(([type, config]) => {
          const count = reports?.filter(r => r.reportType === type).length || 0;
          return (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    <span className="text-lg">{config.icon}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">{config.name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Rechercher</Label>
              <Input
                placeholder="Titre ou nom du patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Type de rapport</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.entries(reportTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exporter les rapports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des rapports */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports existants ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement des rapports...</p>
          ) : filteredReports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun rapport trouvé. Créez votre premier rapport professionnel.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.title}</div>
                        {report.isPrivate && (
                          <Badge variant="outline" className="mt-1">
                            Confidentiel
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>
                          {report.patient?.firstName} {report.patient?.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={reportTypeConfig[report.reportType].color + " text-white"}>
                        {reportTypeConfig[report.reportType].icon} {reportTypeConfig[report.reportType].name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.startDate && report.endDate ? (
                        <div className="text-sm">
                          <div>{new Date(report.startDate).toLocaleDateString('fr-FR')}</div>
                          <div>→ {new Date(report.endDate).toLocaleDateString('fr-FR')}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(report.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(report)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteReportMutation.mutate(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
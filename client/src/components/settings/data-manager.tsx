import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, RefreshCw, Globe, HardDrive, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface XMLStatus {
  hasLocalFile: boolean;
  localFileDate: Date | null;
  isOutdated: boolean;
  supabaseFile: {
    exists: boolean;
    lastModified?: Date;
    size?: number;
  };
}

export function DataManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [useLocalData, setUseLocalData] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  const { data: xmlStatus, refetch: refetchStatus } = useQuery<XMLStatus>({
    queryKey: ["/api/stations/xml-status"],
  });

  const handleLoadStations = async (useLocal: boolean) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/stations/load-xml", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ useLocal }),
      });

      toast({
        title: "Données mises à jour",
        description: `${response.count} stations chargées depuis ${response.source === 'local' ? 'fichier local' : 'internet'}`,
      });

      // Actualiser la page pour recharger les stations
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des stations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadXML = async () => {
    setIsLoading(true);
    try {
      await apiRequest("/api/stations/download-xml", {
        method: "POST",
      });

      toast({
        title: "Téléchargement terminé",
        description: "Fichier XML sauvegardé pour utilisation hors ligne",
      });

      refetchStatus();
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier XML",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadToSupabase = async () => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/stations/upload-supabase");

      toast({
        title: "Upload terminé",
        description: "Fichier XML uploadé sur Supabase avec succès",
      });

      refetchStatus();
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier vers Supabase",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        localStorage.setItem("notifications-enabled", "true");
        toast({
          title: "Notifications activées",
          description: "Vous recevrez des alertes pour les prix bas dans un rayon de 30km",
        });
      } else {
        toast({
          title: "Notifications refusées",
          description: "Activez les notifications dans les paramètres du navigateur",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">CarbuGo - Gestion des données</h2>
        <p className="text-gray-600 mt-2">
          Gérez vos sources de données et vos préférences de notification
        </p>
      </div>

      {/* Statut des données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Statut des données</span>
          </CardTitle>
          <CardDescription>
            Informations sur vos fichiers de données locaux et distants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Supabase Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              {xmlStatus?.supabaseFile.exists ? (
                <>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                  {xmlStatus.supabaseFile.lastModified && (
                    <span className="text-xs text-gray-500">
                      {formatDate(xmlStatus.supabaseFile.lastModified)}
                    </span>
                  )}
                </>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Non disponible
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-green-500" />
              <span className="text-sm">Fichier local</span>
            </div>
            <div className="flex items-center space-x-2">
              {xmlStatus?.hasLocalFile ? (
                <>
                  <Badge variant={xmlStatus.isOutdated ? "destructive" : "default"}>
                    {xmlStatus.isOutdated ? (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Obsolète
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        À jour
                      </>
                    )}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDate(xmlStatus.localFileDate)}
                  </span>
                </>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Non disponible
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions sur les données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Mise à jour des données</span>
          </CardTitle>
          <CardDescription>
            Chargez les dernières données depuis internet ou utilisez vos données locales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleLoadStations(false)}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Globe className="h-4 w-4" />
              <span>Charger depuis internet</span>
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </Button>

            <Button
              onClick={() => handleLoadStations(true)}
              disabled={isLoading || !xmlStatus?.hasLocalFile}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <HardDrive className="h-4 w-4" />
              <span>Utiliser données locales</span>
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </Button>
          </div>

          <Button
            onClick={handleDownloadXML}
            disabled={isLoading}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Télécharger pour utilisation hors ligne</span>
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </Button>

          <Button
            onClick={handleUploadToSupabase}
            disabled={isLoading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Globe className="h-4 w-4" />
            <span>Uploader vers Supabase</span>
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Notifications de prix</span>
          </CardTitle>
          <CardDescription>
            Recevez des alertes pour les stations les moins chères dans un rayon de 30km
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications" className="text-sm font-medium">
                Notifications push activées
              </Label>
              <p className="text-xs text-gray-500">
                Recevez des alertes même quand l'application est fermée
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  requestNotificationPermission();
                } else {
                  setNotificationsEnabled(false);
                  localStorage.setItem("notifications-enabled", "false");
                }
              }}
            />
          </div>

          {notificationsEnabled && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Notifications activées - Vous recevrez des alertes pour les prix bas
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
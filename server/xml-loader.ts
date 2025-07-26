import xml2js from 'xml2js';
import fs from 'fs/promises';
import path from 'path';
import type { Station } from '@shared/schema';

// URL du fichier XML officiel des stations-service françaises
const XML_URL = 'https://donnees.roulez-eco.fr/opendata/instantane';
const LOCAL_XML_PATH = path.join(process.cwd(), 'data', 'stations.xml');

// Configuration Supabase pour le stockage du fichier XML
const SUPABASE_BUCKET = 'carbugo-data';
const SUPABASE_XML_FILE = 'stations-data.xml';

// Interface pour les données XML brutes
interface XMLStation {
  $: {
    id: string;
    latitude: string;
    longitude: string;
    cp?: string;
    pop?: string;
  };
  adresse: string[];
  ville: string[];
  horaires?: Array<{ jour: Array<{ $: { id: string; nom: string; ferme?: string } }> }>;
  services?: Array<{ service: string[] }>;
  prix?: Array<{ $: { nom: string; id: string; maj: string; valeur: string } }>;
}

interface XMLRoot {
  pdv_liste: {
    pdv: XMLStation[];
  };
}

// Mapping des noms de carburants XML vers nos champs
const FUEL_MAPPING: Record<string, keyof Pick<Station, 'prixGazole' | 'prixSP95' | 'prixSP98' | 'prixE10' | 'prixE85' | 'prixGPLc'>> = {
  'Gazole': 'prixGazole',
  'SP95': 'prixSP95', 
  'SP98': 'prixSP98',
  'E10': 'prixE10',
  'E85': 'prixE85',
  'GPLc': 'prixGPLc'
};

export class XMLStationLoader {
  private parser = new xml2js.Parser();
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    this.supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  }

  /**
   * Télécharge le fichier XML depuis l'API officielle et le sauvegarde sur Supabase
   */
  async downloadAndUploadToSupabase(): Promise<void> {
    try {
      console.log('Téléchargement du fichier XML depuis l\'API officielle...');
      const response = await fetch(XML_URL);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP lors du téléchargement: ${response.status}`);
      }
      
      const xmlData = await response.text();
      
      // Upload vers Supabase Storage
      await this.uploadToSupabase(xmlData);
      
      console.log('Fichier XML téléchargé et uploadé sur Supabase avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement et upload:', error);
      throw error;
    }
  }

  /**
   * Upload le fichier XML vers Supabase Storage
   */
  private async uploadToSupabase(xmlData: string): Promise<void> {
    try {
      const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${SUPABASE_BUCKET}/${SUPABASE_XML_FILE}`;
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/xml',
          'x-upsert': 'true' // Remplace le fichier s'il existe
        },
        body: xmlData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Erreur upload Supabase: ${uploadResponse.status} - ${errorText}`);
      }

      console.log('Fichier XML uploadé sur Supabase avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload vers Supabase:', error);
      throw error;
    }
  }

  /**
   * Télécharge le fichier XML depuis Supabase Storage
   */
  async loadFromSupabase(): Promise<Station[]> {
    try {
      console.log('Chargement du fichier XML depuis Supabase...');
      
      const downloadUrl = `${this.supabaseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/${SUPABASE_XML_FILE}`;
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement depuis Supabase: ${response.status}`);
      }
      
      const xmlData = await response.text();
      return await this.parseXMLData(xmlData);
    } catch (error) {
      console.error('Erreur lors du chargement depuis Supabase:', error);
      throw error;
    }
  }

  /**
   * Vérifie si le fichier XML existe sur Supabase et récupère ses métadonnées
   */
  async getSupabaseFileInfo(): Promise<{ exists: boolean; lastModified?: Date; size?: number }> {
    try {
      const infoUrl = `${this.supabaseUrl}/storage/v1/object/info/public/${SUPABASE_BUCKET}/${SUPABASE_XML_FILE}`;
      
      const response = await fetch(infoUrl, {
        headers: {
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      });

      if (response.status === 404) {
        return { exists: false };
      }

      if (!response.ok) {
        throw new Error(`Erreur lors de la vérification du fichier: ${response.status}`);
      }

      const info = await response.json();
      return {
        exists: true,
        lastModified: info.updated_at ? new Date(info.updated_at) : undefined,
        size: info.metadata?.size
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du fichier Supabase:', error);
      return { exists: false };
    }
  }

  async downloadXMLFile(): Promise<void> {
    try {
      console.log('Téléchargement du fichier XML des stations...');
      const response = await fetch(XML_URL);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const xmlData = await response.text();
      
      // Créer le dossier data s'il n'existe pas
      await fs.mkdir(path.dirname(LOCAL_XML_PATH), { recursive: true });
      
      // Sauvegarder le fichier localement
      await fs.writeFile(LOCAL_XML_PATH, xmlData, 'utf-8');
      
      console.log(`Fichier XML téléchargé et sauvegardé : ${LOCAL_XML_PATH}`);
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier XML:', error);
      throw error;
    }
  }

  async loadFromLocal(): Promise<Station[]> {
    try {
      console.log('Chargement du fichier XML local...');
      const xmlData = await fs.readFile(LOCAL_XML_PATH, 'utf-8');
      return await this.parseXMLData(xmlData);
    } catch (error) {
      console.error('Erreur lors du chargement du fichier XML local:', error);
      throw error;
    }
  }

  async loadFromURL(): Promise<Station[]> {
    try {
      console.log('Chargement du fichier XML depuis l\'URL...');
      const response = await fetch(XML_URL);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const xmlData = await response.text();
      return await this.parseXMLData(xmlData);
    } catch (error) {
      console.error('Erreur lors du chargement du fichier XML depuis l\'URL:', error);
      throw error;
    }
  }

  /**
   * Charge les stations avec priorité : Supabase > URL officielle > Local
   */
  async loadStations(useLocal = false): Promise<Station[]> {
    if (useLocal) {
      try {
        return await this.loadFromLocal();
      } catch (error) {
        console.log('Fichier local non disponible, essai depuis Supabase...');
        return await this.loadFromSupabase();
      }
    } else {
      try {
        // Essaie d'abord Supabase
        const fileInfo = await this.getSupabaseFileInfo();
        
        if (fileInfo.exists && fileInfo.lastModified) {
          // Vérifie si le fichier Supabase est récent (moins de 6 heures)
          const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
          
          if (fileInfo.lastModified > sixHoursAgo) {
            console.log('Utilisation du fichier Supabase récent');
            return await this.loadFromSupabase();
          }
        }
        
        // Sinon, télécharge depuis l'API officielle et upload sur Supabase
        console.log('Téléchargement depuis l\'API officielle et mise à jour Supabase...');
        const stations = await this.loadFromURL();
        
        // Upload en arrière-plan (ne bloque pas le retour des données)
        this.downloadAndUploadToSupabase().catch(error => {
          console.error('Erreur lors de l\'upload en arrière-plan:', error);
        });
        
        return stations;
      } catch (error) {
        console.log('Erreur avec Supabase/API, essai du fichier local...');
        return await this.loadFromLocal();
      }
    }
  }

  private async parseXMLData(xmlData: string): Promise<Station[]> {
    try {
      const result = await this.parser.parseStringPromise(xmlData) as XMLRoot;
      const stations: Station[] = [];

      if (!result.pdv_liste?.pdv) {
        console.warn('Aucune station trouvée dans le fichier XML');
        return [];
      }

      for (const xmlStation of result.pdv_liste.pdv) {
        try {
          const station = this.convertXMLToStation(xmlStation);
          if (station) {
            stations.push(station);
          }
        } catch (error) {
          console.warn(`Erreur lors de la conversion de la station ${xmlStation.$.id}:`, error);
        }
      }

      console.log(`${stations.length} stations chargées depuis le fichier XML`);
      return stations;
    } catch (error) {
      console.error('Erreur lors du parsing XML:', error);
      throw error;
    }
  }

  private convertXMLToStation(xmlStation: XMLStation): Station | null {
    const lat = parseFloat(xmlStation.$.latitude);
    const lon = parseFloat(xmlStation.$.longitude);

    if (isNaN(lat) || isNaN(lon)) {
      console.warn(`Coordonnées invalides pour la station ${xmlStation.$.id}`);
      return null;
    }

    // Extraire les prix des carburants
    const prices: Partial<Station> = {};
    if (xmlStation.prix) {
      for (const prixInfo of xmlStation.prix) {
        const fuelName = prixInfo.$.nom;
        const fuelField = FUEL_MAPPING[fuelName];
        if (fuelField) {
          const price = parseFloat(prixInfo.$.valeur);
          if (!isNaN(price)) {
            (prices as any)[fuelField] = price;
          }
        }
      }
    }

    // Extraire les horaires
    let horaires = '{}';
    if (xmlStation.horaires?.[0]?.jour) {
      const horaireData: Record<string, any> = {};
      for (const jour of xmlStation.horaires[0].jour) {
        horaireData[jour.$.id] = {
          nom: jour.$.nom,
          ferme: jour.$.ferme === '1'
        };
      }
      horaires = JSON.stringify(horaireData);
    }

    // Extraire les services
    let services = '[]';
    if (xmlStation.services?.[0]?.service) {
      services = JSON.stringify(xmlStation.services[0].service);
    }

    const station: Station = {
      id: xmlStation.$.id,
      nom: xmlStation.adresse?.[0] || 'Station inconnue',
      adresse: xmlStation.adresse?.[0] || '',
      ville: xmlStation.ville?.[0] || '',
      codePostal: xmlStation.$.cp || null,
      lat,
      lon,
      prixGazole: prices.prixGazole || null,
      prixSP95: prices.prixSP95 || null,
      prixSP98: prices.prixSP98 || null,
      prixE10: prices.prixE10 || null,
      prixE85: prices.prixE85 || null,
      prixGPLc: prices.prixGPLc || null,
      horaires,
      services,
      derniereMiseAJour: new Date(),
    };

    return station;
  }

  async checkLocalFileExists(): Promise<boolean> {
    try {
      await fs.access(LOCAL_XML_PATH);
      return true;
    } catch {
      return false;
    }
  }

  async getLocalFileDate(): Promise<Date | null> {
    try {
      const stats = await fs.stat(LOCAL_XML_PATH);
      return stats.mtime;
    } catch {
      return null;
    }
  }
}

export const xmlLoader = new XMLStationLoader();
import { type Station, type InsertStation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getStations(): Promise<Station[]>;
  getStation(id: string): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;
  searchStations(query: string): Promise<Station[]>;
  getStationsByPriceRange(maxPrice: number): Promise<Station[]>;
}

export class MemStorage implements IStorage {
  private stations: Map<string, Station>;

  constructor() {
    this.stations = new Map();
    this.initializeStations();
  }

  private initializeStations() {
    const initialStations: InsertStation[] = [
      // Paris - Centre
      {
        nom: "Total Access",
        adresse: "12 rue de la République",
        ville: "Paris",
        lat: 48.8566,
        lon: 2.3522,
        prixGazole: 1.629,
        prixSP95: 1.729,
      },
      {
        nom: "Shell Station",
        adresse: "25 avenue des Champs-Élysées",
        ville: "Paris",
        lat: 48.8738,
        lon: 2.2950,
        prixGazole: 1.749,
        prixSP95: 1.819,
      },
      {
        nom: "BP Express",
        adresse: "45 boulevard Saint-Germain",
        ville: "Paris",
        lat: 48.8530,
        lon: 2.3490,
        prixGazole: 1.849,
        prixSP95: 1.899,
      },
      {
        nom: "Esso Louvre",
        adresse: "8 rue de Rivoli",
        ville: "Paris",
        lat: 48.8580,
        lon: 2.3470,
        prixGazole: 1.639,
        prixSP95: 1.739,
      },
      {
        nom: "Intermarché République",
        adresse: "15 avenue de la République",
        ville: "Paris",
        lat: 48.8620,
        lon: 2.3580,
        prixGazole: 1.719,
        prixSP95: 1.789,
      },
      
      // Paris - Nord
      {
        nom: "Total Montmartre",
        adresse: "123 rue de la Chapelle",
        ville: "Paris",
        lat: 48.8900,
        lon: 2.3600,
        prixGazole: 1.679,
        prixSP95: 1.779,
      },
      {
        nom: "Carrefour Barbès",
        adresse: "67 boulevard de la Chapelle",
        ville: "Paris",
        lat: 48.8850,
        lon: 2.3520,
        prixGazole: 1.695,
        prixSP95: 1.795,
      },
      {
        nom: "Avia Gare du Nord",
        adresse: "45 rue de Dunkerque",
        ville: "Paris",
        lat: 48.8810,
        lon: 2.3550,
        prixGazole: 1.659,
        prixSP95: 1.759,
      },
      
      // Paris - Sud
      {
        nom: "Shell Montparnasse",
        adresse: "89 avenue du Maine",
        ville: "Paris",
        lat: 48.8420,
        lon: 2.3200,
        prixGazole: 1.735,
        prixSP95: 1.835,
      },
      {
        nom: "BP Denfert",
        adresse: "156 avenue Denfert-Rochereau",
        ville: "Paris",
        lat: 48.8340,
        lon: 2.3340,
        prixGazole: 1.689,
        prixSP95: 1.789,
      },
      {
        nom: "Leclerc Porte d'Orléans",
        adresse: "234 avenue du Général Leclerc",
        ville: "Paris",
        lat: 48.8220,
        lon: 2.3260,
        prixGazole: 1.645,
        prixSP95: 1.745,
      },
      
      // Paris - Est
      {
        nom: "Total Bastille",
        adresse: "78 rue du Faubourg Saint-Antoine",
        ville: "Paris",
        lat: 48.8520,
        lon: 2.3750,
        prixGazole: 1.669,
        prixSP95: 1.769,
      },
      {
        nom: "Esso Nation",
        adresse: "145 cours de Vincennes",
        ville: "Paris",
        lat: 48.8480,
        lon: 2.4020,
        prixGazole: 1.699,
        prixSP95: 1.799,
      },
      
      // Paris - Ouest
      {
        nom: "Shell Trocadéro",
        adresse: "67 avenue Kléber",
        ville: "Paris",
        lat: 48.8700,
        lon: 2.2850,
        prixGazole: 1.759,
        prixSP95: 1.859,
      },
      {
        nom: "Total Étoile",
        adresse: "123 avenue de la Grande Armée",
        ville: "Paris",
        lat: 48.8760,
        lon: 2.2820,
        prixGazole: 1.779,
        prixSP95: 1.879,
      },
      
      // Lyon
      {
        nom: "Leclerc Part-Dieu",
        adresse: "30 rue de la Paix",
        ville: "Lyon",
        lat: 45.7640,
        lon: 4.8357,
        prixGazole: 1.659,
        prixSP95: 1.759,
      },
      {
        nom: "Carrefour Confluence",
        adresse: "22 cours Lafayette",
        ville: "Lyon",
        lat: 45.7578,
        lon: 4.8320,
        prixGazole: 1.689,
        prixSP95: 1.779,
      },
      {
        nom: "Total Bellecour",
        adresse: "45 rue de la République",
        ville: "Lyon",
        lat: 45.7576,
        lon: 4.8351,
        prixGazole: 1.719,
        prixSP95: 1.819,
      },
      {
        nom: "Shell Presqu'île",
        adresse: "89 rue Mercière",
        ville: "Lyon",
        lat: 45.7640,
        lon: 4.8370,
        prixGazole: 1.675,
        prixSP95: 1.775,
      },
      {
        nom: "Intermarché Villeurbanne",
        adresse: "156 cours Émile Zola",
        ville: "Lyon",
        lat: 45.7730,
        lon: 4.8790,
        prixGazole: 1.649,
        prixSP95: 1.749,
      },
      
      // Marseille
      {
        nom: "Total Vieux Port",
        adresse: "34 quai du Port",
        ville: "Marseille",
        lat: 43.2965,
        lon: 5.3698,
        prixGazole: 1.685,
        prixSP95: 1.785,
      },
      {
        nom: "Shell Canebière",
        adresse: "123 La Canebière",
        ville: "Marseille",
        lat: 43.2955,
        lon: 5.3753,
        prixGazole: 1.709,
        prixSP95: 1.809,
      },
      {
        nom: "Esso Prado",
        adresse: "67 avenue du Prado",
        ville: "Marseille",
        lat: 43.2730,
        lon: 5.3950,
        prixGazole: 1.695,
        prixSP95: 1.795,
      },
      
      // Stations avec prix très bas
      {
        nom: "Super U Discount",
        adresse: "234 route de Flandre",
        ville: "Paris",
        lat: 48.8950,
        lon: 2.3680,
        prixGazole: 1.599,
        prixSP95: 1.699,
      },
      {
        nom: "Leclerc Express",
        adresse: "89 avenue Jean Jaurès",
        ville: "Lyon",
        lat: 45.7690,
        lon: 4.8420,
        prixGazole: 1.619,
        prixSP95: 1.719,
      },
      {
        nom: "Carrefour Market",
        adresse: "45 boulevard National",
        ville: "Marseille",
        lat: 43.2850,
        lon: 5.3850,
        prixGazole: 1.629,
        prixSP95: 1.729,
      },
    ];

    initialStations.forEach(station => {
      const id = randomUUID();
      const fullStation: Station = {
        ...station,
        id,
        maj: new Date(),
      };
      this.stations.set(id, fullStation);
    });
  }

  async getStations(): Promise<Station[]> {
    return Array.from(this.stations.values());
  }

  async getStation(id: string): Promise<Station | undefined> {
    return this.stations.get(id);
  }

  async createStation(insertStation: InsertStation): Promise<Station> {
    const id = randomUUID();
    const station: Station = {
      ...insertStation,
      id,
      maj: new Date(),
    };
    this.stations.set(id, station);
    return station;
  }

  async searchStations(query: string): Promise<Station[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.stations.values()).filter(
      station =>
        station.nom.toLowerCase().includes(lowerQuery) ||
        station.ville.toLowerCase().includes(lowerQuery) ||
        station.adresse.toLowerCase().includes(lowerQuery)
    );
  }

  async getStationsByPriceRange(maxPrice: number): Promise<Station[]> {
    return Array.from(this.stations.values()).filter(
      station => station.prixGazole && station.prixGazole <= maxPrice
    );
  }
}

export const storage = new MemStorage();

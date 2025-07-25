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
        nom: "Esso",
        adresse: "8 rue de Rivoli",
        ville: "Paris",
        lat: 48.8580,
        lon: 2.3470,
        prixGazole: 1.639,
        prixSP95: 1.739,
      },
      {
        nom: "Intermarché",
        adresse: "15 avenue de la République",
        ville: "Paris",
        lat: 48.8620,
        lon: 2.3580,
        prixGazole: 1.719,
        prixSP95: 1.789,
      },
      {
        nom: "Leclerc",
        adresse: "30 rue de la Paix",
        ville: "Lyon",
        lat: 45.7640,
        lon: 4.8357,
        prixGazole: 1.659,
        prixSP95: 1.759,
      },
      {
        nom: "Carrefour",
        adresse: "22 cours Lafayette",
        ville: "Lyon",
        lat: 45.7578,
        lon: 4.8320,
        prixGazole: 1.689,
        prixSP95: 1.779,
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

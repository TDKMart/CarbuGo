import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { stations } from "@shared/schema";
import { eq, ilike, and, lte, desc, asc } from "drizzle-orm";
import type { Station, InsertStation } from "@shared/schema";

export interface IStorage {
  getStations(): Promise<Station[]>;
  getStation(id: string): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;
  addStation(station: Station): Promise<Station>;
  clearStations(): Promise<void>;
  searchStations(query: string): Promise<Station[]>;
  getStationsByPriceRange(maxPrice: number): Promise<Station[]>;
  getStationsInBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<Station[]>;
  getNearbyStations(lat: number, lon: number, radiusKm: number): Promise<Station[]>;
}

class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getStations(): Promise<Station[]> {
    try {
      return await this.db.select().from(stations).orderBy(asc(stations.prixGazole));
    } catch (error) {
      console.error("Error fetching stations:", error);
      throw new Error("Failed to fetch stations");
    }
  }

  async getStation(id: string): Promise<Station | undefined> {
    try {
      const result = await this.db.select().from(stations).where(eq(stations.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching station:", error);
      throw new Error("Failed to fetch station");
    }
  }

  async createStation(insertStation: InsertStation): Promise<Station> {
    try {
      const result = await this.db.insert(stations).values({
        ...insertStation,
        id: crypto.randomUUID(),
        derniereMiseAJour: new Date(),
      }).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating station:", error);
      throw new Error("Failed to create station");
    }
  }

  async addStation(station: Station): Promise<Station> {
    try {
      const result = await this.db.insert(stations).values(station)
        .onConflictDoUpdate({
          target: stations.id,
          set: {
            nom: station.nom,
            adresse: station.adresse,
            ville: station.ville,
            codePostal: station.codePostal,
            lat: station.lat,
            lon: station.lon,
            prixGazole: station.prixGazole,
            prixSP95: station.prixSP95,
            prixSP98: station.prixSP98,
            prixE10: station.prixE10,
            prixE85: station.prixE85,
            prixGPLc: station.prixGPLc,
            horaires: station.horaires,
            services: station.services,
            derniereMiseAJour: new Date(),
          }
        }).returning();
      return result[0];
    } catch (error) {
      console.error("Error adding station:", error);
      throw new Error("Failed to add station");
    }
  }

  async clearStations(): Promise<void> {
    try {
      await this.db.delete(stations);
    } catch (error) {
      console.error("Error clearing stations:", error);
      throw new Error("Failed to clear stations");
    }
  }

  async searchStations(query: string): Promise<Station[]> {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      return await this.db.select().from(stations)
        .where(
          and(
            ilike(stations.nom, searchTerm),
            ilike(stations.ville, searchTerm),
            ilike(stations.adresse, searchTerm)
          )
        )
        .orderBy(asc(stations.prixGazole));
    } catch (error) {
      console.error("Error searching stations:", error);
      throw new Error("Failed to search stations");
    }
  }

  async getStationsByPriceRange(maxPrice: number): Promise<Station[]> {
    try {
      return await this.db.select().from(stations)
        .where(lte(stations.prixGazole, maxPrice))
        .orderBy(asc(stations.prixGazole));
    } catch (error) {
      console.error("Error fetching stations by price range:", error);
      throw new Error("Failed to fetch stations by price range");
    }
  }

  async getStationsInBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<Station[]> {
    try {
      return await this.db.select().from(stations)
        .where(
          and(
            lte(stations.lat, bounds.north),
            lte(bounds.south, stations.lat),
            lte(stations.lon, bounds.east),
            lte(bounds.west, stations.lon)
          )
        )
        .orderBy(asc(stations.prixGazole));
    } catch (error) {
      console.error("Error fetching stations in bounds:", error);
      throw new Error("Failed to fetch stations in bounds");
    }
  }

  async getNearbyStations(lat: number, lon: number, radiusKm: number): Promise<Station[]> {
    try {
      // Using Haversine formula approximation for nearby stations
      // This is a simplified version - for production, consider using PostGIS
      const latRange = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
      const lonRange = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
      
      return await this.db.select().from(stations)
        .where(
          and(
            lte(stations.lat, lat + latRange),
            lte(lat - latRange, stations.lat),
            lte(stations.lon, lon + lonRange),
            lte(lon - lonRange, stations.lon)
          )
        )
        .orderBy(asc(stations.prixGazole));
    } catch (error) {
      console.error("Error fetching nearby stations:", error);
      throw new Error("Failed to fetch nearby stations");
    }
  }
}

// Fallback to memory storage for development
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
        prixSP98: 1.789,
        prixE10: 1.709,
        prixE85: null,
        prixGPLc: 0.919,
      },
      {
        nom: "Shell Station",
        adresse: "25 avenue des Champs-Élysées",
        ville: "Paris",
        lat: 48.8738,
        lon: 2.2950,
        prixGazole: 1.749,
        prixSP95: 1.819,
        prixSP98: null,
        prixE10: 1.799,
        prixE85: 1.249,
        prixGPLc: null,
      },
      // Add more sample stations...
    ];

    initialStations.forEach(station => {
      const id = crypto.randomUUID();
      const fullStation: Station = {
        ...station,
        id,
        codePostal: null,
        horaires: null,
        services: null,
        derniereMiseAJour: new Date(),
        prixGazole: station.prixGazole ?? null,
        prixSP95: station.prixSP95 ?? null,
        prixSP98: station.prixSP98 ?? null,
        prixE10: station.prixE10 ?? null,
        prixE85: station.prixE85 ?? null,
        prixGPLc: station.prixGPLc ?? null,
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
    const id = crypto.randomUUID();
    const station: Station = {
      ...insertStation,
      id,
      codePostal: null,
      horaires: null,
      services: null,
      derniereMiseAJour: new Date(),
      prixGazole: insertStation.prixGazole ?? null,
      prixSP95: insertStation.prixSP95 ?? null,
      prixSP98: insertStation.prixSP98 ?? null,
      prixE10: insertStation.prixE10 ?? null,
      prixE85: insertStation.prixE85 ?? null,
      prixGPLc: insertStation.prixGPLc ?? null,
    };
    this.stations.set(id, station);
    return station;
  }

  async addStation(station: Station): Promise<Station> {
    this.stations.set(station.id, station);
    return station;
  }

  async clearStations(): Promise<void> {
    this.stations.clear();
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

  async getStationsInBounds(bounds: { north: number; south: number; east: number; west: number }): Promise<Station[]> {
    return Array.from(this.stations.values()).filter(station => 
      station.lat >= bounds.south &&
      station.lat <= bounds.north &&
      station.lon >= bounds.west &&
      station.lon <= bounds.east
    );
  }

  async getNearbyStations(lat: number, lon: number, radiusKm: number): Promise<Station[]> {
    return Array.from(this.stations.values()).filter(station => {
      const distance = this.calculateDistance(lat, lon, station.lat, station.lon);
      return distance <= radiusKm;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Export the appropriate storage based on environment
export const storage: IStorage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
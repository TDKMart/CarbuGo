import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStationSchema } from "@shared/schema";
import { xmlLoader } from "./xml-loader";
import { z } from "zod";

// Cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all stations
  app.get("/api/stations", async (req, res) => {
    try {
      const cacheKey = "all-stations";
      const cachedStations = getCachedData(cacheKey);
      
      if (cachedStations) {
        return res.json(cachedStations);
      }
      
      const stations = await storage.getStations();
      setCachedData(cacheKey, stations);
      res.json(stations);
    } catch (error) {
      console.error("Error fetching stations:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des stations" });
    }
  });

  // Get stations in bounds (for map optimization)
  app.get("/api/stations/bounds", async (req, res) => {
    try {
      const { north, south, east, west } = req.query;
      
      if (!north || !south || !east || !west) {
        return res.status(400).json({ message: "Paramètres de limites requis" });
      }
      
      const bounds = {
        north: parseFloat(north as string),
        south: parseFloat(south as string),
        east: parseFloat(east as string),
        west: parseFloat(west as string),
      };
      
      const cacheKey = `bounds-${north}-${south}-${east}-${west}`;
      const cachedStations = getCachedData(cacheKey);
      
      if (cachedStations) {
        return res.json(cachedStations);
      }
      
      const stations = await storage.getStationsInBounds(bounds);
      setCachedData(cacheKey, stations);
      res.json(stations);
    } catch (error) {
      console.error("Error fetching stations in bounds:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des stations" });
    }
  });

  // Get nearby stations
  app.get("/api/stations/nearby", async (req, res) => {
    try {
      const { lat, lon, radius = 10 } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Coordonnées requises" });
      }
      
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const radiusKm = parseFloat(radius as string);
      
      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
        return res.status(400).json({ message: "Coordonnées invalides" });
      }
      
      const stations = await storage.getNearbyStations(latitude, longitude, radiusKm);
      res.json(stations);
    } catch (error) {
      console.error("Error fetching nearby stations:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des stations proches" });
    }
  });

  // Get station by ID
  app.get("/api/stations/:id", async (req, res) => {
    try {
      const station = await storage.getStation(req.params.id);
      if (!station) {
        return res.status(404).json({ message: "Station non trouvée" });
      }
      res.json(station);
    } catch (error) {
      console.error("Error fetching station:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la station" });
    }
  });

  // Search stations
  app.get("/api/stations/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      if (!query || query.trim() === "") {
        return res.status(400).json({ message: "Requête de recherche requise" });
      }
      
      const cacheKey = `search-${query}`;
      const cachedResults = getCachedData(cacheKey);
      
      if (cachedResults) {
        return res.json(cachedResults);
      }
      
      const stations = await storage.searchStations(query);
      setCachedData(cacheKey, stations);
      res.json(stations);
    } catch (error) {
      console.error("Error searching stations:", error);
      res.status(500).json({ message: "Erreur lors de la recherche" });
    }
  });

  // Get stations with low prices
  app.get("/api/stations/low-price/:maxPrice", async (req, res) => {
    try {
      const maxPrice = parseFloat(req.params.maxPrice);
      if (isNaN(maxPrice)) {
        return res.status(400).json({ message: "Prix maximum invalide" });
      }
      const stations = await storage.getStationsByPriceRange(maxPrice);
      res.json(stations);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la recherche par prix" });
    }
  });

  // Create station
  app.post("/api/stations", async (req, res) => {
    try {
      const validatedData = insertStationSchema.parse(req.body);
      const station = await storage.createStation(validatedData);
      res.status(201).json(station);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur lors de la création de la station" });
    }
  });

  // Get price statistics
  app.get("/api/stations/stats/prices", async (req, res) => {
    try {
      const cacheKey = "price-stats";
      const cachedStats = getCachedData(cacheKey);
      
      if (cachedStats) {
        return res.json(cachedStats);
      }
      
      const stations = await storage.getStations();
      const gazolePrices = stations
        .map(s => s.prixGazole)
        .filter((price): price is number => price !== null);
      
      if (gazolePrices.length === 0) {
        const emptyStats = { minGazole: null, maxGazole: null, avgGazole: null };
        return res.json(emptyStats);
      }

      const minGazole = Math.min(...gazolePrices);
      const maxGazole = Math.max(...gazolePrices);
      const avgGazole = gazolePrices.reduce((a, b) => a + b, 0) / gazolePrices.length;

      const stats = {
        minGazole: parseFloat(minGazole.toFixed(3)),
        maxGazole: parseFloat(maxGazole.toFixed(3)),
        avgGazole: parseFloat(avgGazole.toFixed(3)),
      };
      
      setCachedData(cacheKey, stats);
      res.json(stats);
    } catch (error) {
      console.error("Error calculating price statistics:", error);
      res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
    }
  });

  // Load stations from XML (online or offline)
  app.post("/api/stations/load-xml", async (req, res) => {
    try {
      const { useLocal = false } = req.body;
      
      console.log(`Chargement des stations depuis ${useLocal ? 'fichier local' : 'URL'}...`);
      const xmlStations = await xmlLoader.loadStations(useLocal);
      
      // Vider la base de données et insérer les nouvelles stations
      await storage.clearStations();
      
      // Clear cache when data is updated
      cache.clear();
      
      for (const station of xmlStations) {
        await storage.addStation(station);
      }
      
      res.json({ 
        message: `${xmlStations.length} stations chargées avec succès`,
        source: useLocal ? 'local' : 'online',
        count: xmlStations.length
      });
    } catch (error) {
      console.error('Erreur lors du chargement XML:', error);
      res.status(500).json({ 
        message: "Erreur lors du chargement des stations depuis XML",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Download XML file for offline use
  app.post("/api/stations/download-xml", async (req, res) => {
    try {
      await xmlLoader.downloadXMLFile();
      const fileDate = await xmlLoader.getLocalFileDate();
      
      res.json({ 
        message: "Fichier XML téléchargé avec succès",
        date: fileDate,
        available: true
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement XML:', error);
      res.status(500).json({ 
        message: "Erreur lors du téléchargement du fichier XML",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Check XML file status
  app.get("/api/stations/xml-status", async (req, res) => {
    try {
      const hasLocal = await xmlLoader.checkLocalFileExists();
      const localDate = await xmlLoader.getLocalFileDate();
      
      res.json({
        hasLocalFile: hasLocal,
        localFileDate: localDate,
        isOutdated: localDate ? (Date.now() - localDate.getTime()) > 24 * 60 * 60 * 1000 : true
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la vérification du statut XML" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all stations
  app.get("/api/stations", async (req, res) => {
    try {
      const stations = await storage.getStations();
      res.json(stations);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des stations" });
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
      const stations = await storage.searchStations(query);
      res.json(stations);
    } catch (error) {
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
      const stations = await storage.getStations();
      const gazolePrices = stations
        .map(s => s.prixGazole)
        .filter((price): price is number => price !== null);
      
      if (gazolePrices.length === 0) {
        return res.json({ minGazole: null, maxGazole: null, avgGazole: null });
      }

      const minGazole = Math.min(...gazolePrices);
      const maxGazole = Math.max(...gazolePrices);
      const avgGazole = gazolePrices.reduce((a, b) => a + b, 0) / gazolePrices.length;

      res.json({
        minGazole: parseFloat(minGazole.toFixed(3)),
        maxGazole: parseFloat(maxGazole.toFixed(3)),
        avgGazole: parseFloat(avgGazole.toFixed(3)),
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

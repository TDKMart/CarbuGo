import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stations = pgTable("stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nom: text("nom").notNull(),
  adresse: text("adresse").notNull(),
  ville: text("ville").notNull(),
  lat: real("lat").notNull(),
  lon: real("lon").notNull(),
  prixGazole: real("prix_gazole"),
  prixSP95: real("prix_sp95"),
  maj: timestamp("maj").defaultNow().notNull(),
});

export const insertStationSchema = createInsertSchema(stations).omit({
  id: true,
  maj: true,
});

export type InsertStation = z.infer<typeof insertStationSchema>;
export type Station = typeof stations.$inferSelect;

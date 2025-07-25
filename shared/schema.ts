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
  prixSP98: real("prix_sp98"),
  prixE10: real("prix_e10"),
  prixE85: real("prix_e85"),
  prixGPLc: real("prix_gplc"),
  maj: timestamp("maj").defaultNow().notNull(),
});

export const insertStationSchema = createInsertSchema(stations).omit({
  id: true,
  maj: true,
}).extend({
  prixGazole: z.number().nullable().optional(),
  prixSP95: z.number().nullable().optional(),
  prixSP98: z.number().nullable().optional(),
  prixE10: z.number().nullable().optional(),
  prixE85: z.number().nullable().optional(),
  prixGPLc: z.number().nullable().optional(),
});

export type InsertStation = z.infer<typeof insertStationSchema>;
export type Station = typeof stations.$inferSelect;

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const executiveOrdersTable = pgTable("executive_orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  president: text("president").notNull(),
  presidentKey: text("president_key").notNull(),
  dilemma: text("dilemma").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExecutiveOrderSchema = createInsertSchema(executiveOrdersTable);
export type InsertExecutiveOrder = z.infer<typeof insertExecutiveOrderSchema>;
export type ExecutiveOrder = typeof executiveOrdersTable.$inferSelect;

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const records = sqliteTable("records", {
  id: text("id").primaryKey(), kind: text("kind").notNull(), data: text("data").notNull(), version: integer("version").notNull().default(1), updatedAt: text("updated_at").notNull(),
}, table => [index("records_kind_idx").on(table.kind)]);
export const audit = sqliteTable("audit", { id: text("id").primaryKey(), action: text("action").notNull(), recordId: text("record_id").notNull(), actor: text("actor").notNull(), time: text("time").notNull() });

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("patterns", {
    id: {
      type: "serial",
      primaryKey: true
    },
    name: {
      type: "varchar(255)",
      notNull: true,
      unique: true
    },
    description: {
      type: "text",
      notNull: true
    },
    display_order: {
      type: "integer",
      unique: true,
      notNull: true
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("patterns")
};

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
  pgm.dropConstraint("patterns", "patterns_display_order_key");
  
    pgm.sql(`
      ALTER TABLE patterns
      ADD CONSTRAINT patterns_display_order_key
      UNIQUE (display_order)
      DEFERRABLE INITIALLY DEFERRED;
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint("patterns", "patterns_display_order_key");
  
    pgm.addConstraint("patterns", "patterns_display_order_key", {
      unique: ["display_order"],
    });
};

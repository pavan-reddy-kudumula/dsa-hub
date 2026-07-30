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
  pgm.dropConstraint("questions", "questions_pattern_display_order_unique");

  pgm.sql(`
    ALTER TABLE questions
    ADD CONSTRAINT questions_pattern_display_order_unique
    UNIQUE (pattern_id, display_order)
    DEFERRABLE INITIALLY DEFERRED;
  `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint("questions", "questions_pattern_display_order_unique");

  pgm.addConstraint(
    "questions",
    "questions_pattern_display_order_unique",
    {
      unique: ["pattern_id", "display_order"]
    }
  );
};

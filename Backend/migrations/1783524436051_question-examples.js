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
  pgm.createTable("question_examples", {
    id: {
      type: "serial",
      primaryKey: true
    },
    question_id: {
      type: "integer",
      references: "questions",
      notNull: true,
      onDelete: "CASCADE"
    },
    input: {
      type: "text",
      notNull: true
    },
    output: {
      type: "text",
      notNull: true
    },
    explanation: {
      type: "text"
    }
  })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("question_examples");
};

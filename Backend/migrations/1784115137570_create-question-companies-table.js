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
  pgm.createTable("question_companies", {
    question_id: {
      type: "integer",
      references: "questions",
      notNull: true,
      onDelete: "CASCADE"
    },
    company_id: {
      type: "integer",
      references: "companies",
      notNull: true,
      onDelete: "CASCADE"
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  }, {
    constraints: {
      primaryKey: ["question_id", "company_id"]
    }
  })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("question_companies");
};

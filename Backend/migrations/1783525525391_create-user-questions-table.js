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
  pgm.createTable("user_questions", {
    user_id: {
      type: "integer",
      references: "users",
      notNull: true,
      onDelete: "CASCADE"
    },
    question_id: {
      type: "integer",
      references: "questions",
      notNull: true,
      onDelete: "CASCADE"
    },
    status: {
      type: "status_enum",
      notNull: true,
      default: "not_attempted"
    },
    attempts: {
      type: "integer",
      notNull: true,
      default: 0,
      check: "attempts >= 0"
    },
    solved_at: {
      type: "timestamptz",
      notNull: true
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  }, {
    constraints: {
      primaryKey: ["user_id", "question_id"]
    }
  })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("user_questions");
};

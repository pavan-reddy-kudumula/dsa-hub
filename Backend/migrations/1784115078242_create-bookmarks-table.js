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
  pgm.createTable("bookmarks", {
    id: {
      type: "serial",
      primaryKey: true
    },
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
    }
  }, {
    constraints: {
      unique: ["user_id", "question_id"]
    }
  })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("bookmarks");
};

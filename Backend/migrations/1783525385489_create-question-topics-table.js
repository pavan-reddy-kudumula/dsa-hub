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
  pgm.createTable("question_topics", {
    question_id: {
      type: "integer",
      references: "questions",
      notNull: true,
      onDelete: "CASCADE"
    },
    topic_id: {
      type: "integer",
      references: "topics",
      notNull: true,
      onDelete: "CASCADE"
    }
  }, {
    constraints: {
      primaryKey: ["question_id", "topic_id"]
    }
  })
}

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("question_topics");
}
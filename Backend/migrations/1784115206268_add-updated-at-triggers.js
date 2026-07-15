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
  const tables = [
    "users",
    "questions",
    "question_platform_links",
    "user_questions",
    "question_solutions",
    "notes"
  ];

  for (const table of tables) {
    pgm.createTrigger(table, `${table}_set_updated_at`, {
      when: "BEFORE",
      operation: "UPDATE",
      level: "ROW",
      function: "set_updated_at"
    });
  }
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  const tables = [
      "users",
      "questions",
      "question_platform_links",
      "user_questions",
      "question_solutions",
      "notes"
    ];
  
    for (const table of tables) {
      pgm.dropTrigger(table, `${table}_set_updated_at`);
    }
};

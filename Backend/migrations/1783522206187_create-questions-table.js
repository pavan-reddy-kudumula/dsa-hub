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
  pgm.createTable("questions", {
    id: {
      type:"serial",
      primaryKey: true
    },
    pattern_id: {
      type: "integer",
      references: "patterns",
      notNull: true
    },
    title: {
      type: "varchar(255)",
      notNull: true
    },
    problem_statement: {
      type: "text",
      notNull: true
    },
    notes: {
      type: "text"
    },
    difficulty: {
      type: "difficulty_enum",
      notNull: true
    },
    display_order: {
      type: "integer",
      notNull: true
    },
    estimated_time: {
      type: "smallint",
      check: "estimated_time > 0"
    },
    xp: {
      type: "integer",
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
  })

  pgm.addConstraint(
    "questions",
    "questions_pattern_display_order_unique",
    {
      unique: ["pattern_id", "display_order"]
    }
  );
  
  pgm.addConstraint(
    "questions",
    "questions_pattern_title_unique",
    {
      unique: ["pattern_id", "title"]
    }
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("questions");
};

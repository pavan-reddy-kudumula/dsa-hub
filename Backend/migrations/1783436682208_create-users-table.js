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
  pgm.createTable("users", {
    id: {
      type: "serial",
      primaryKey: true
    },
    username: {
      type: "varchar(255)",
      unique: true,
      notNull: true
    },
    email: {
      type: "varchar(255)",
      unique: true,
      notNull: true
    },
    password_hash: {
      type: "varchar(255)",
      notNull: true
    },
    profile_pic: {
      type: "text"
    },
    about: {
      type: "text",
    },
    address: {
      type: "text"
    },
    questions_solved: {
      type: "integer",
      notNull: true,
      default: 0
    },
    total_xp: {
      type: "integer",
      notNull: true,
      default: 0
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
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("users");
};

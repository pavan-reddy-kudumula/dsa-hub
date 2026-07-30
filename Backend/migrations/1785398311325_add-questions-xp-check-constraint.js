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
   pgm.addConstraint("questions", "questions_xp_check", {
     check: "xp > 0",
   });
 };
/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
 export const down = (pgm) => {
   pgm.dropConstraint("questions", "questions_xp_check");
 };
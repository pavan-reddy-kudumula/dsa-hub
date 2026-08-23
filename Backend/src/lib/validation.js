export const toNumberOrUndefined = (value) => (value !== undefined) ? Number(value) : undefined;

export const isValidInteger = (value) => Number.isInteger(value) && value > 0;

export const isValidString = (value) => typeof value === "string" && value.trim() !== "";
export const toNumberOrUndefined = (value) => (value !== undefined) ? Number(value) : undefined;

export const isValidInteger = (value) => Number.isInteger(value) && value > 0;

export const isValidString = (value) => typeof value === "string" && value.trim() !== "";

export const isValidArray = (Ids) => {
  if (!Array.isArray(Ids)) {
    const err = new Error("IDs must be an array.");
    err.statusCode = 400;
    throw err;
  }
  
  if (Ids.length === 0 || !Ids.every((id) => Number.isInteger(id) && id > 0)) {
    const err = new Error("All IDs must be integers and there must be atleast one ID.");
    err.statusCode = 400;
    throw err;
  }

  const uniqueIds = new Set(Ids);
  
  if (uniqueIds.size !== Ids.length) {
    const err = new Error("IDs must be unique.");
    err.statusCode = 400;
    throw err;
  }

  return Ids;
}

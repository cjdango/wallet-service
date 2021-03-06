export const paginateResults = ({ after: cursor, pageSize = 20, results }) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);
  const cursorIndex = results.findIndex((item) => {
    let itemCursor = toCursor(item._id);
    // if there's still not a cursor, return false by default
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1 // don't let us overflow
      ? []
      : results.slice(cursorIndex + 1, Math.min(results.length, cursorIndex + 1 + pageSize))
    : results.slice(0, pageSize);
};

export const toCursor = (value) => Buffer.from(value.toString()).toString('base64');
export const fromCursor = (value) => Buffer.from(value).toString('ascii');

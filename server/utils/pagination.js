const maximumPageSize = 50;

export const parsePagination = (
  query,
  { defaultLimit = 10, maxLimit = maximumPageSize } = {},
) => ({
  page: query.page ?? 1,
  limit: Math.min(query.limit ?? defaultLimit, maxLimit),
});
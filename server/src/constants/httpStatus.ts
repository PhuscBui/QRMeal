const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  PARTIAL_CONTENT: 206,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
} as const

export default HTTP_STATUS

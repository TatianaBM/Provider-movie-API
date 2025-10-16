import type { Request, Response, NextFunction } from 'express'

// in Express, a Middleware is a function that has access to the request and response objects, it sits between
// the request and the response
// it checks or modifies the request or response objects as it moves along
// Think of it as a checkpoint where the request stops briefly, get processed and then moves on to the next step

// define a type for the token's structure, which contains the issuedAt date
type Token = {
  issuedAt: Date // token contains an issuedAt date
}

// function that checks if the token's timestamp is within one hour
const isValidAuthTimeStamp = (token: Token): boolean => {
  const tokenTime = token.issuedAt.getTime() // get the time in milliseconds from the issuedAt date
  const currentTime = new Date().getTime() // get the current time in milliseconds
  const diff = (currentTime - tokenTime) / 1000 // difference in seconds

  return diff >= 0 && diff <= 3600 // check if the difference is between 0 and 3600 seconds (1 hour)
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Response<any, Record<string, any>> | undefined {
  const authHeader = req.headers['authorization'] // get the Authorization header from the request
  if (!authHeader) {
    return res
      .status(401)
      .json({ error: 'Unauthorized, no Authorization header.', status: 401 }) // if no header, respond with 401 Unauthorized
  }
  const tokenStr = authHeader.replace('Bearer ', '') // extract the token from the header (assuming format "Bearer <token>")
  const token: Token = { issuedAt: new Date(tokenStr) } // create a token object with issuedAt date from the token string

  if (!isValidAuthTimeStamp(token)) {
    // check if the token's timestamp is valid
    return res
      .status(401)
      .json({ error: 'Unauthorized, invalid token timestamp.', status: 401 }) // if not valid, respond with 401 Unauthorized
  }

  next() // if everything is fine, proceed to the next middleware or route handler
}

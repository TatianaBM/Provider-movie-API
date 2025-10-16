import type { Request, Response, NextFunction } from 'express'

//*
// Middleware to validate movie ID in the request parameters
//*/
export function validateId(
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Response<any, Record<string, any>> | undefined {
  const movieId = parseInt(req.params.id!)

  if (isNaN(movieId)) {
    return res.status(400).json({ error: 'Invalid movie ID provided' })
  }
  req.params.id = movieId.toString()

  next()
}

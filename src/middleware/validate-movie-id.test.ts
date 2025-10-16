import type { Request, Response, NextFunction } from 'express'
import { validateId } from './validate-movie-id'

describe('validateId Middleware', (): void => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: NextFunction = jest.fn()

  beforeEach(() => {
    mockRequest = {
      headers: {}
    }
    mockResponse = {
      // returns 'this' to allow method chaining
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    nextFunction = jest.fn()
  })

  it('should pass for a valid movie ID', (): void => {
    mockRequest.params = { id: '123' }
    validateId(mockRequest as Request, mockResponse as Response, nextFunction)

    expect(mockRequest.params.id).toBe('123')
    expect(nextFunction).toHaveBeenCalled()
    expect(mockResponse.status).not.toHaveBeenCalled()
    expect(mockResponse.json).not.toHaveBeenCalled()
  })

  it('should return 400 for an invalid movie ID', (): void => {
    mockRequest.params = { id: 'abc' }
    validateId(mockRequest as Request, mockResponse as Response, nextFunction)

    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid movie ID provided'
    })
    expect(nextFunction).not.toHaveBeenCalled()
    expect(mockRequest.params.id).toBe('abc')
  })

  it('should handle missing movie ID', (): void => {
    validateId(mockRequest as Request, mockResponse as Response, nextFunction)

    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid movie ID provided'
    })
    expect(nextFunction).not.toHaveBeenCalled()
    expect(mockRequest.params!.id).toBeUndefined()
  })
})

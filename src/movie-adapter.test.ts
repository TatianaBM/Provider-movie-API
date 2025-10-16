import type { Movie } from '@prisma/client'
import { Prisma, PrismaClient } from '@prisma/client'
import type { DeepMockProxy } from 'jest-mock-extended'
import { mockDeep } from 'jest-mock-extended'
import { MovieAdapter } from './movie-adapter'
import {
  generateMovieWithId,
  generateMovieWithoutId
} from './test-helpers/factories'

//in this test suite we are testing the adapter
//which is responsible for interacting with the data source (Prisma)
//since this is an adapter in hexagonal architecture (ports & adapters)
//its primary role is handling data percistence and retrieval
//and the tests here will ensure that it behaves correctly in terms of data handling and error management
//By mocking PrismaClient we can isolate the tests to focus solely on the adapter's logic and its interactions with Prisma API
//this allows us to test how the adapter handles different scenarios
//like successful data retrieval, data creation, and how it manages errors (e.g. database connection issues)
//these tests do not touch real database, making them init tests that ensure correctness
//of the adapter's interaction with the mocked data layer

//mock prisma client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock('@prisma/client', (): any => {
  const actualPrisma = jest.requireActual('@prisma/client')
  return {
    ...actualPrisma,
    PrismaClient: jest.fn(
      (): DeepMockProxy<PrismaClient> => mockDeep<PrismaClient>()
    )
  }
})

describe('MovieAdapter', (): void => {
  let prismaMock: DeepMockProxy<PrismaClient>
  let movieAdapter: MovieAdapter

  const mockMovie: Movie = generateMovieWithId()

  //create an instance of movie adapter and prisma client before each test
  beforeEach((): void => {
    prismaMock = new PrismaClient() as DeepMockProxy<PrismaClient>
    movieAdapter = new MovieAdapter(prismaMock)
  })

  describe('getMovies', (): void => {
    it('should get all movies', async (): Promise<void> => {
      //mock first
      prismaMock.movie.findMany.mockResolvedValue([mockMovie])

      const data = await movieAdapter.getMovies()
      expect(data).toEqual(mockMovie)
      expect(prismaMock.movie.findMany()).toHaveBeenCalledTimes(1)
    })

    it('should get all movies or empty array', async (): Promise<void> => {
      //mock first
      prismaMock.movie.findMany.mockResolvedValue([])

      const data = await movieAdapter.getMovies()
      expect(data).toEqual([])
      expect(prismaMock.movie.findMany()).toHaveBeenCalledTimes(1)
    })

    it('should handle errors in getMovies', async (): Promise<void> => {
      prismaMock.movie.findMany.mockRejectedValue(
        new Error('Error fetching all movies')
      )
      const result = await movieAdapter.getMovies()
      expect(result.data).toBeNull()
      expect(prismaMock.movie.findMany()).toHaveBeenCalledTimes(1)
    })
  })

  describe('getMovieById', (): void => {
    it('should get a movie by ID', async (): Promise<void> => {
      prismaMock.movie.findUnique.mockResolvedValue(mockMovie)
      //@ts-expect-error Typescript should chill for tests here
      const { data } = await movieAdapter.getMovieById(mockMovie.id)
      expect(data).toEqual(mockMovie)
      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: { id: mockMovie.id }
      })
    })

    it('should return null if movie id is not found', async (): Promise<void> => {
      prismaMock.movie.findUnique.mockResolvedValue(null)
      const id = 999
      //@ts-expect-error Typescript should chill for tests here
      const { data } = await movieAdapter.getMovieById(id)
      expect(data).toBeNull()
      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: { id }
      })
    })

    it('should handle errors in getMovieById', async (): Promise<void> => {
      prismaMock.movie.findUnique.mockRejectedValue(
        new Error('Error fetching movie by ID')
      )
      //@ts-expect-error Typescript should chill for tests here
      const { data } = await movieAdapter.getMovieById()
      expect(data).toBeNull()
      expect(prismaMock.movie.findUnique).toHaveBeenCalledTimes(1)
    })
  })

  describe('getMovieByName', (): void => {
    it('should get a movie by name', async (): Promise<void> => {
      //mock first
      prismaMock.movie.findFirst.mockResolvedValue(mockMovie)
      const result = await movieAdapter.getMovieByName(mockMovie.name)
      expect('data' in result ? result.data : null).toEqual(mockMovie)
      expect(prismaMock.movie.findFirst).toHaveBeenCalledWith({
        where: { name: mockMovie.name }
      })
    })

    it('should return null if movie by name is not found', async (): Promise<void> => {
      //mock first
      prismaMock.movie.findFirst.mockResolvedValue(null)
      const name = 'Non-existent movie'

      const result = await movieAdapter.getMovieByName(name)
      expect('data' in result ? result.data : null).toBeNull()
      expect(prismaMock.movie.findFirst).toHaveBeenCalledWith({
        where: { name }
      })
    })

    it('should handle errors in getMovieByName', async (): Promise<void> => {
      //mock first
      prismaMock.movie.findFirst.mockRejectedValue(
        new Error('Error fetching movie by name')
      )

      const result = await movieAdapter.getMovieByName('Inception')
      expect('data' in result ? result.data : null).toBeNull()
      expect(prismaMock.movie.findFirst).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteMovieById', (): void => {
    it('should delete a movie by ID', async (): Promise<void> => {
      prismaMock.movie.delete.mockResolvedValue({} as Movie)

      const result = await movieAdapter.deleteMovieById(mockMovie.id)
      const expectedResult = {
        status: 200,
        message: `Movie ${mockMovie.id} has been deleted`
      }
      expect(result).toStrictEqual(expectedResult)
      expect(prismaMock.movie.delete).toHaveBeenCalledWith({
        where: { id: mockMovie.id }
      })
    })

    it('should delete a movie and return false if movie is not found', async (): Promise<void> => {
      prismaMock.movie.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Movie not found', {
          code: 'P2025',
          clientVersion: '1'
        })
      )
      const id = 999
      const result = await movieAdapter.deleteMovieById(id)
      const expectedResult = {
        status: 404,
        message: `Movie with id ${id} not found`
      }
      expect(result).toStrictEqual(expectedResult)
      expect(prismaMock.movie.delete).toHaveBeenCalledWith({
        where: { id }
      })
    })

    it('should call handleError and rethrow unexpected errors in deleteMovieById', async (): Promise<void> => {
      const unExpectedError = new Error('Unexpected error')
      prismaMock.movie.delete.mockRejectedValue(unExpectedError)
      const id = 999
      //spy on the handleError method to ensure it is called

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleErrorSpy = jest.spyOn(movieAdapter as any, 'handleError')

      // expect the method to throw the error
      await expect(movieAdapter.deleteMovieById(id)).rejects.toThrow(
        'Unexpected error'
      )
      expect(handleErrorSpy).toHaveBeenCalledWith(unExpectedError)
      expect(prismaMock.movie.delete).toHaveBeenCalledTimes(1)
    })
  })

  describe('addMovie', (): void => {
    //generate movie data and overwrite name
    const movieData = { ...generateMovieWithoutId(), name: 'Inception' }
    const id = 1
    const movie = { id, ...movieData }
    it('should successfully add a movie without specifying ID', async (): Promise<void> => {
      prismaMock.movie.findFirst.mockResolvedValue(null) //no existing movie
      prismaMock.movie.create.mockResolvedValue(movie)

      const result = await movieAdapter.addMovie(movieData)
      expect(result).toEqual({
        status: 200,
        data: movie
      })
      expect(prismaMock.movie.create).toHaveBeenCalledWith({
        data: movieData
      })
    })

    it('should successfully add a movie specifing ID', async (): Promise<void> => {
      prismaMock.movie.findFirst.mockResolvedValue(null) //no existing movie
      prismaMock.movie.create.mockResolvedValue(movie)

      const result = await movieAdapter.addMovie(movieData, id)
      expect(result).toEqual(
        expect.objectContaining({
          status: 200,
          data: movie
        })
      )
      expect(prismaMock.movie.create).toHaveBeenCalledWith({
        data: movie
      })
    })

    it('should return 409 if movie already exists', async (): Promise<void> => {
      prismaMock.movie.findFirst.mockResolvedValue(movie)
      const result = await movieAdapter.addMovie(movieData)
      expect(result).toEqual(
        expect.objectContaining({
          status: 409,
          error: `Movie ${movie.name} already exists`
        })
      )
    })

    it('should return 500 if unexpected error occurs', async (): Promise<void> => {
      prismaMock.movie.findFirst.mockResolvedValue(null)
      const error = 'Unexpected error'
      prismaMock.movie.create.mockRejectedValue(new Error(error))

      //spy on the handleError method to ensure it is called

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleErrorSpy = jest.spyOn(movieAdapter as any, 'handleError')

      const result = await movieAdapter.addMovie(movieData)
      expect(result).toEqual(
        expect.objectContaining({ status: 500, error: 'Internal server error' })
      )
      expect(handleErrorSpy).toHaveBeenCalledWith(new Error(error))
    })
  })

  describe('updateMovie', (): void => {
    const id = 1
    const existingMovie = { name: 'Inception', year: 2020, id, rating: 7.5 }
    const updateMovieData = { name: 'The Dark Knight', year: 2008, rating: 7.5 }
    const updatedMovie = { id, ...updateMovieData }

    it('should successfully update movie', async (): Promise<void> => {
      //set up
      prismaMock.movie.findUnique.mockResolvedValue(existingMovie)
      prismaMock.movie.update.mockResolvedValue(updatedMovie)
      //action
      const result = await movieAdapter.updateMovie(updateMovieData, id)
      //assertion
      expect(result).toEqual({
        status: 200,
        data: updatedMovie
      })
      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: { id }
      })
      expect(prismaMock.movie.update).toHaveBeenCalledWith({
        where: { id },
        data: updateMovieData
      })
    })

    it('should return 404 if movie is not found', async (): Promise<void> => {
      prismaMock.movie.findUnique.mockResolvedValue(null)

      const result = await movieAdapter.updateMovie(updateMovieData, id)
      expect(result).toEqual({
        status: 404,
        error: `Movie with id ${id} not found`
      })
      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: { id }
      })
      expect(prismaMock.movie.update).not.toHaveBeenCalled()
    })

    it('should return 500 if an unexpected error occurs', async (): Promise<void> => {
      //mock the movie to be found in the database
      prismaMock.movie.findUnique.mockResolvedValue(existingMovie)

      //mock an unexpected error during the update
      const error = new Error('Unexpected error')
      prismaMock.movie.update.mockRejectedValue(error)

      //spy on the handleError method to ensure it is called

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleErrorSpy = jest.spyOn(movieAdapter as any, 'handleError')

      const result = await movieAdapter.updateMovie(updateMovieData, id)

      //assertions
      expect(result).toEqual({
        status: 500,
        error: 'Internal server error'
      })
      expect(handleErrorSpy).toHaveBeenCalledWith(error)
    })
  })
})

import { MovieService } from './movie-service'
import type { MovieRepository } from './movie-repositoty'
import type { Movie } from '@prisma/client'
import { generateMovieWithoutId } from './test-helpers/factories'

// because we use parts and adapters / hex patern architecture
// the data layer (MovieREpository) is dependency we can mock
// this ensured we test only business logic and not database

// in this s^test suite we are focusing on the Service, which encapsulates the business logic
// Since we are following  the ports and adapters (hexagonal) architecture pattern
// the service depends on port/interface/contract, defined by the Repository

// We mock the data layer (MovieRepository) to isolate the service logic, and test only business login int he service
// By mocking the data layer, we ensure that tests focus purely on how the service behaves
// handlicg input, interacting with the repositora, returnign the appropriate responses output and error handling
// This approach alows us to write unit tests that are fast, isolated, and independent of any external systems or databases

describe('MovieService', (): void => {
  let movieService: MovieService
  let mockMovieRepository: jest.Mocked<MovieRepository>

  const id = 1
  const mockMovie: Movie = { ...generateMovieWithoutId(), id }
  const mockMovieResponse = { status: 200, data: mockMovie, error: null }
  const mockMoviesResponse = { status: 200, data: [mockMovie], error: null }
  const notFoundResponse = { status: 404, data: null, error: null }

  beforeEach((): void => {
    mockMovieRepository = {
      getMovies: jest.fn(),
      getMovieById: jest.fn(),
      getMovieByName: jest.fn(),
      deleteMovieById: jest.fn(),
      addMovie: jest.fn(),
      updateMovie: jest.fn()
    } as jest.Mocked<MovieRepository>

    movieService = new MovieService(mockMovieRepository)
  })

  it('should get all movies', async (): Promise<void> => {
    mockMovieRepository.getMovies.mockResolvedValue(mockMoviesResponse)

    const { data } = await movieService.getMovies()

    expect(data).toEqual([mockMovie])
    expect(mockMovieRepository.getMovies).toHaveBeenCalledTimes(1)
  })

  it('should get a movie by ID', async (): Promise<void> => {
    mockMovieRepository.getMovieById.mockResolvedValue(mockMovieResponse)

    //@ts-expect-error Typescript should chill for tests here
    const { data } = await movieService.getMovieById(id)

    expect(data).toEqual(mockMovie)
    expect(mockMovieRepository.getMovieById).toHaveBeenCalledWith(id)
  })

  it('should return null when movie by ID is not found', async (): Promise<void> => {
    mockMovieRepository.getMovieById.mockResolvedValue(notFoundResponse)
    const id = 999

    //@ts-expect-error Typescript should chill for tests here
    const { data } = await movieService.getMovieById(notFoundResponse)

    expect(data).toBeNull()
    expect(mockMovieRepository.getMovieById).toHaveBeenCalledWith(id)
  })

  it('should get a movie by name', async (): Promise<void> => {
    mockMovieRepository.getMovieByName.mockResolvedValue(mockMovieResponse)

    //@ts-expect-error Typescript should chill for tests here
    const { data } = await movieService.getMovieByName(mockMovie.name)

    expect(data).toEqual(mockMovie)
    expect(mockMovieRepository.getMovieByName).toHaveBeenCalledWith(
      mockMovie.name
    )
  })

  it('should return null when movie by name is not found', async (): Promise<void> => {
    mockMovieRepository.getMovieByName.mockResolvedValue(notFoundResponse)
    const name = 'Nonexistent Movie'

    //@ts-expect-error Typescript should chill for tests here
    const { data } = await movieService.getMovieByName(name)

    expect(data).toBeNull()
    expect(mockMovieRepository.getMovieByName).toHaveBeenCalledWith(name)
  })

  it('should add a new movie', async (): Promise<void> => {
    const expectedResult = { status: 200, data: mockMovie, error: undefined }

    mockMovieRepository.addMovie.mockResolvedValue(expectedResult)

    const result = await movieService.addMovie(mockMovie)
    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.addMovie).toHaveBeenCalledWith(
      mockMovie,
      undefined
    )
  })

  it('should update a movie', async (): Promise<void> => {
    const expectedResult = { status: 200, data: mockMovie, error: undefined }

    mockMovieRepository.updateMovie.mockResolvedValue(expectedResult)

    const result = await movieService.updateMovie(
      { name: mockMovie.name, year: mockMovie.year },
      id
    )
    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.updateMovie).toHaveBeenCalledWith(
      { name: mockMovie.name, year: mockMovie.year },
      id
    )
  })

  it('should delete a movie by ID', async (): Promise<void> => {
    const expectedResult = { status: 200, message: 'Movie deleted' }
    mockMovieRepository.deleteMovieById.mockResolvedValue(expectedResult)

    const result = await movieService.deleteMovieById(id)
    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.deleteMovieById).toHaveBeenCalledWith(id)
  })

  it('should return 400 if addMovie validation fails', async (): Promise<void> => {
    const invalidMovieData = { name: '', year: 1899, rating: 7.5 } // Invalid data

    const result = await movieService.addMovie(invalidMovieData)
    expect(result).toEqual(
      expect.objectContaining({
        status: 400,
        error:
          'String must contain at least 1 character(s), Number must be greater than or equal to 1900'
      })
    )
  })

  it('should return 400 if updateMovie validation fails', async (): Promise<void> => {
    const invalidUpdateData = { name: '', year: 2300 } // Invalid data

    const result = await movieService.updateMovie(invalidUpdateData, id)
    expect(result).toEqual(
      expect.objectContaining({
        status: 400,
        error:
          'String must contain at least 1 character(s), Number must be greater than or equal to 1900'
      })
    )
  })

  it('should try to delete and not find a movie', async (): Promise<void> => {
    const expectedResult = { status: 404, error: 'Movie not found' }
    mockMovieRepository.deleteMovieById.mockResolvedValue(expectedResult)
    const id = 999
    const result = await movieService.deleteMovieById(id)
    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.deleteMovieById).toHaveBeenCalledWith(id)
  })
})

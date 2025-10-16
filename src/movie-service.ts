import type { MovieRepository } from './movie-repositoty'
import type {
  CreateMovieRequest,
  CreateMovieResponse,
  ConflictMovieResponse,
  GetMovieResponse,
  MovieNotFoundResponse,
  DeleteMovieResponse,
  UpdateMovieRequest,
  UpdatedMovieResponse
} from './@types'
import type { ZodSchema } from 'zod'
import { CreateMovieSchema, UpdateMovieSchema } from './@types/schemas'

// in the context of the movie service what we care about is the contract/interface
// i.g the methods defined in the movieRepository interface
// the service does not care if it is using prisma, a REST api, or an in-memory database
// it only cares that the object implements the MovieRepository interface
// it is only business logic

export class MovieService {
  constructor(private readonly movieRepository: MovieRepository) {
    this.movieRepository = movieRepository
  }

  async getMovies(): Promise<GetMovieResponse> {
    return this.movieRepository.getMovies()
  }

  async getMovieById(
    id: number
  ): Promise<GetMovieResponse | MovieNotFoundResponse> {
    return this.movieRepository.getMovieById(id)
  }

  async getMovieByName(
    name: string
  ): Promise<GetMovieResponse | MovieNotFoundResponse> {
    return this.movieRepository.getMovieByName(name)
  }

  async deleteMovieById(
    id: number
  ): Promise<DeleteMovieResponse | MovieNotFoundResponse> {
    return this.movieRepository.deleteMovieById(id)
  }

  async addMovie(
    data: CreateMovieRequest,
    id?: number
  ): Promise<CreateMovieResponse | ConflictMovieResponse> {
    //Zod third key feature : safeParse
    //Zod note: if you have frontend you can use the scema + safeParse there
    //in order to perform form validation before sending data to the serverconst parsedData = this.validateData(data, CreateMovieSchema)
    const validationResult = validateSchema(CreateMovieSchema, data)
    if (!validationResult.success) {
      return {
        status: 400,
        error: validationResult.error
      }
    }
    return this.movieRepository.addMovie(data, id)
  }

  async updateMovie(
    data: UpdateMovieRequest,
    id: number
  ): Promise<
    UpdatedMovieResponse | MovieNotFoundResponse | ConflictMovieResponse
  > {
    const validationResult = validateSchema(UpdateMovieSchema, data)
    if (!validationResult.success) {
      return {
        status: 400,
        error: validationResult.error
      }
    }
    return this.movieRepository.updateMovie(data, id)
  }
}
//helper function for schema validation
function validateSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
):
  | {
      success: true
      data: T
    }
  | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    const errorMessages = result.error.errors
      .map((err): string => err.message)
      .join(', ')
    return { success: false, error: errorMessages }
  }
}

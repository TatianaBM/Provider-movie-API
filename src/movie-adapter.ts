import { Prisma } from '@prisma/client'
import { type PrismaClient } from '../prisma/client'
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
import type { MovieRepository } from './movie-repositoty'

export class MovieAdapter implements MovieRepository {
  private readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }
  // const movieAdapter = new MovieAdapter(new PrismaClient())

  private handleError(error: unknown): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code, 'Message', error.message)
    } else if (error instanceof Error) {
      console.error('Error: ', error.message)
    } else {
      console.error('An unknown error occurred:', error)
    }
  }

  // get all movies
  async getMovies(): Promise<GetMovieResponse> {
    try {
      const movies = await this.prisma.movie.findMany()
      if (movies.length > 0) {
        return {
          status: 200,
          data: movies,
          error: null
        }
      } else {
        return {
          status: 200,
          data: [],
          error: null
        }
      }
    } catch (error) {
      this.handleError(error)
      return {
        status: 500,
        data: null,
        error: 'Failed to retrieve movies'
      }
    }
  }

  // get a movies by its id
  async getMovieById(
    id: number
  ): Promise<GetMovieResponse | MovieNotFoundResponse> {
    try {
      const movie = await this.prisma.movie.findUnique({
        where: { id }
      })
      if (movie) {
        return {
          status: 200,
          data: movie,
          error: null
        }
      } else {
        return {
          status: 404,
          data: null,
          error: `Movie with ${id} not found`
        }
      }
    } catch (error) {
      this.handleError(error)
      return {
        status: 500,
        data: null,
        error: 'Internal server error'
      }
    }
  }

  // get movie by it name
  async getMovieByName(
    name: string
  ): Promise<GetMovieResponse | MovieNotFoundResponse> {
    try {
      const movie = await this.prisma.movie.findFirst({
        where: { name }
      })
      if (movie) {
        return {
          status: 200,
          data: movie,
          error: null
        }
      } else {
        return {
          status: 404,
          data: null,
          error: `Movie with name ${name} not found`
        }
      }
    } catch (error) {
      this.handleError(error)
      return {
        status: 500,
        data: null,
        error: 'Internal server error'
      }
    }
  }

  //delete a movie by its id
  async deleteMovieById(
    id: number
  ): Promise<DeleteMovieResponse | MovieNotFoundResponse> {
    try {
      await this.prisma.movie.delete({
        where: { id }
      })
      return {
        status: 200,
        message: `Movie ${id} has been deleted`
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return {
          status: 404,
          message: `Movie with id ${id} not found`
        }
      }
      this.handleError(error)
      throw error // rethrow other errors
    }
  }

  // add a new movie
  async addMovie(
    data: CreateMovieRequest,
    id?: number
  ): Promise<CreateMovieResponse | ConflictMovieResponse> {
    try {
      // Check if a movie with the same name already exists
      const existingMovie = await this.prisma.movie.findFirst({
        where: { name: data.name }
      })
      if (existingMovie) {
        return {
          status: 409,
          error: `Movie ${data.name} already exists`
        }
      }
      // create a new movie
      const movie = await this.prisma.movie.create({
        data: id ? { ...data, id } : data
      })
      return {
        status: 200,
        data: movie
      }
    } catch (error) {
      this.handleError(error)
      return {
        status: 500,
        error: 'Internal server error'
      }
    }
  }

  // update a movie
  async updateMovie(
    data: UpdateMovieRequest,
    id: number
  ): Promise<
    UpdatedMovieResponse | MovieNotFoundResponse | ConflictMovieResponse
  > {
    try {
      const existingMovie = await this.prisma.movie.findUnique({
        where: { id }
      })
      if (!existingMovie) {
        return {
          status: 404,
          error: `Movie with id ${id} not found`
        }
      }
      const updatedMovie = await this.prisma.movie.update({
        where: { id },
        data
      })
      return {
        status: 200,
        data: updatedMovie
      }
    } catch (error) {
      this.handleError(error)
      return {
        status: 500,
        error: 'Internal server error'
      }
    }
  }
}

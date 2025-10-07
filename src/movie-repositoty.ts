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

// MovieRepository: this is the interface/contract that defined the methods
//for interacting with the datat layer

export interface MovieRepository {
  getMovies(): Promise<GetMovieResponse>
  getMovieById(id: number): Promise<GetMovieResponse | MovieNotFoundResponse>
  getMovieByName(
    name: string
  ): Promise<GetMovieResponse | MovieNotFoundResponse>
  deleteMovieById(
    id: number
  ): Promise<DeleteMovieResponse | MovieNotFoundResponse>
  addMovie(
    data: CreateMovieRequest,
    id?: number
  ): Promise<CreateMovieResponse | ConflictMovieResponse>
  updateMovie(
    data: UpdateMovieRequest,
    id: number
  ): Promise<
    UpdatedMovieResponse | MovieNotFoundResponse | ConflictMovieResponse
  >
}

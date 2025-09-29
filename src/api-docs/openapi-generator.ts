//this file registers the schemas and generates the OpenApi document
//it is the logic responsible for OpenApi structure
//based in the zod schemas
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31
} from '@asteasolutions/zod-to-openapi'

import {
  CreateMovieSchema,
  CreateMovieResponseSchema,
  ConflictMovieResponseSchema,
  GetMovieResponseUnionSchema,
  MovieNotFoundResponseSchema,
  DeleteMovieResponseSchema,
  UpdateMovieSchema,
  UpdateMovieResponseSchema
} from '../@types/schemas'

import type { ParameterObject } from 'openapi3-ts/oas31'

//register the schemas with OpenAPI registry
const registry = new OpenAPIRegistry()
registry.register('CreateMovieRequest', CreateMovieSchema)
registry.register('CreateMovieResponse', CreateMovieResponseSchema)
registry.register('GetMovieResponse', GetMovieResponseUnionSchema)
registry.register('MovieNotFound', MovieNotFoundResponseSchema)
registry.register('DeleteMovieResponse', DeleteMovieResponseSchema)
registry.register('ConflictMovieResponse', ConflictMovieResponseSchema)
registry.register('UpdateMovieRequest', UpdateMovieSchema)
registry.register('UpdatedMovieResponse', UpdateMovieResponseSchema)

//constants to avoid repetitions

// specify what the movie ID will look like
const MOVIE_ID_PARAM: ParameterObject = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: 'Movie ID'
}
// specify what the movie name will look like
const MOVIE_NAME_PARAM: ParameterObject = {
  name: 'name',
  in: 'query',
  required: false,
  schema: { type: 'string' },
  description: 'Movie name to search for'
}

//register the paths with OpenAPI generator
registry.registerPath({
  method: 'get',
  path: '/', //flat path
  summary: 'Health check',
  responses: {
    200: {
      description: 'Server is running',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Server is running'
              }
            }
          }
        }
      }
    }
  }
})

//register path for filtering movies via query parameter
registry.registerPath({
  method: 'get',
  path: '/movies',
  summary: 'Get all movies or filter by name',
  description:
    'Retrieve a list of all movies. optionally provide a query parameter "name" to filter by a specific movie name',
  parameters: [MOVIE_NAME_PARAM], //query param for filtering by name
  responses: {
    200: {
      description:
        'List of all movies or a specific movie if query parameter "name" is provided',
      content: {
        'application/json': {
          schema: GetMovieResponseUnionSchema
        }
      }
    },
    404: {
      description:
        'Movie not found id the nem is provided and does not match any movie',
      content: {
        'application/json': {
          schema: MovieNotFoundResponseSchema
        }
      }
    }
  }
})

//register path for getting amovie by ID
registry.registerPath({
  method: 'get',
  path: '/movies/{id}',
  summary: 'Get a movie by ID',
  description: 'Retrieve a single movie by its unique ID',
  parameters: [MOVIE_ID_PARAM],
  responses: {
    200: {
      description: 'Movie found',
      content: {
        'application/json': {
          schema: GetMovieResponseUnionSchema
        }
      }
    },
    404: {
      description: 'Movie not found',
      content: {
        'application/json': {
          schema: MovieNotFoundResponseSchema
        }
      }
    }
  }
})

//register a path for add movie
registry.registerPath({
  method: 'post',
  path: '/movies',
  summary: 'Create a new movie',
  description: 'Create a new movie in the system',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateMovieSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Movie created successfully',
      content: {
        'application/json': {
          schema: CreateMovieResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid request body or validation error'
    },
    409: {
      description: 'Movie already exist',
      content: {
        'application/json': {
          schema: ConflictMovieResponseSchema
        }
      }
    },
    500: {
      description: 'Unexpected error occurred'
    }
  }
})

//delete movie
registry.registerPath({
  method: 'delete',
  path: '/movies/{id}',
  summary: 'Delete a movie by ID',
  description: 'Delete a movie by its ID',
  parameters: [MOVIE_ID_PARAM],
  responses: {
    200: {
      description: 'Movie {id} has been deleted',
      content: {
        'application/json': {
          schema: DeleteMovieResponseSchema
        }
      }
    },
    404: {
      description: 'Movie not found',
      content: {
        'application/json': {
          schema: MovieNotFoundResponseSchema
        }
      }
    }
  }
})

//update movie
registry.registerPath({
  method: 'put',
  path: '/movies/{id}',
  summary: 'Update a movie by ID',
  description: 'Update a movie b its ID',
  parameters: [MOVIE_ID_PARAM],
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateMovieSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Movie has been updated succesfully',
      content: {
        'application/json': {
          schema: UpdateMovieResponseSchema
        }
      }
    },
    404: {
      description: 'Movie not found',
      content: {
        'application/json': {
          schema: MovieNotFoundResponseSchema
        }
      }
    },
    500: {
      description: 'Internal server error'
    }
  }
})

// generate openApi document
const generator = new OpenApiGeneratorV31(registry.definitions)

export const openApiDoc = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Movies API',
    version: '0.0.1',
    description: 'API for managing movies'
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Local development server'
    },
    {
      url: 'https://movies-api.example.com',
      description: 'Production server'
    }
  ]
})

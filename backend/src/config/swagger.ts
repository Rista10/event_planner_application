import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Planner API',
      version: '1.0.0',
      description: 'API documentation for the Event Planning Application',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check',
          description: 'Returns API health status',
          tags: ['Health'],
          responses: {
            200: {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          status: { type: 'string', example: 'ok' },
                        },
                      },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/signup': {
        post: {
          summary: 'Register a new user',
          description: 'Creates a new user account and returns auth tokens',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', minLength: 1, maxLength: 255 },
                    email: { type: 'string', format: 'email', maxLength: 255 },
                    password: { type: 'string', minLength: 8, maxLength: 128 },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            400: { description: 'Validation error' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Login',
          description: 'Authenticate and receive access tokens. Sets refresh token as HTTP-only cookie.',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            400: { description: 'Validation error' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/refresh': {
        post: {
          summary: 'Refresh access token',
          description: 'Exchange refresh token (from cookie) for a new access token',
          tags: ['Auth'],
          responses: {
            200: {
              description: 'Token refreshed successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            401: { description: 'Refresh token missing or invalid' },
          },
        },
      },
      '/api/auth/logout': {
        post: {
          summary: 'Logout',
          description: 'Clears the refresh token cookie',
          tags: ['Auth'],
          responses: {
            200: {
              description: 'Logged out successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Logged out successfully' },
                        },
                      },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/verify-email': {
        post: {
          summary: 'Verify email address',
          description: 'Verifies a user email using the token sent via email',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token'],
                  properties: {
                    token: { type: 'string', description: 'Email verification token' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Email verified successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MessageResponse' },
                },
              },
            },
            400: { description: 'Invalid or expired token' },
          },
        },
      },
      '/api/auth/resend-verification': {
        post: {
          summary: 'Resend verification email',
          description: 'Resends the email verification link to the given email address',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Verification email sent (if account exists)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MessageResponse' },
                },
              },
            },
            400: { description: 'Validation error' },
          },
        },
      },
      '/api/auth/forgot-password': {
        post: {
          summary: 'Request password reset',
          description: 'Sends a password reset link to the given email address',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Reset email sent (if account exists)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MessageResponse' },
                },
              },
            },
            400: { description: 'Validation error' },
          },
        },
      },
      '/api/auth/reset-password': {
        post: {
          summary: 'Reset password',
          description: 'Resets the user password using a valid reset token',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token', 'newPassword'],
                  properties: {
                    token: { type: 'string', description: 'Password reset token' },
                    newPassword: { type: 'string', minLength: 8, maxLength: 128 },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Password reset successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MessageResponse' },
                },
              },
            },
            400: { description: 'Invalid or expired token' },
          },
        },
      },
      '/api/auth/verify-2fa': {
        post: {
          summary: 'Verify two-factor authentication',
          description: 'Verifies the 2FA OTP code and completes login',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'otp'],
                  properties: {
                    userId: { type: 'string', format: 'uuid' },
                    otp: { type: 'string', minLength: 6, maxLength: 6, example: '123456' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: '2FA verified, login complete',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            400: { description: 'Invalid or expired OTP' },
          },
        },
      },
      '/api/auth/2fa': {
        post: {
          summary: 'Enable or disable 2FA',
          description: 'Toggles two-factor authentication for the authenticated user',
          tags: ['Auth'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['enable'],
                  properties: {
                    enable: { type: 'boolean', description: 'Set to true to enable 2FA, false to disable' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: '2FA setting updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MessageResponse' },
                },
              },
            },
            401: { description: 'Not authenticated' },
          },
        },
      },
      '/api/tags': {
        get: {
          summary: 'Get all tags',
          description: 'Returns the full list of tags',
          tags: ['Tags'],
          responses: {
            200: {
              description: 'List of tags',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Tag' },
                      },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create a tag',
          description: 'Creates a new tag (requires authentication)',
          tags: ['Tags'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100, example: 'Music' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Tag created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Tag' },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error' },
            409: { description: 'Tag already exists' },
          },
        },
      },
      '/api/tags/{id}': {
        delete: {
          summary: 'Delete a tag',
          description: 'Deletes a tag by ID (requires authentication)',
          tags: ['Tags'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Tag deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Tag deleted successfully' },
                        },
                      },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
            404: { description: 'Tag not found' },
          },
        },
      },
      '/api/events': {
        get: {
          summary: 'List events',
          description: 'Returns a paginated, filterable list of events',
          tags: ['Events'],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 50 } },
            { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['date_time', 'created_at', 'title'], default: 'date_time' } },
            { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
            { name: 'tag_id', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by tag' },
            { name: 'is_public', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
            { name: 'time_filter', in: 'query', schema: { type: 'string', enum: ['upcoming', 'past'] } },
            { name: 'search', in: 'query', schema: { type: 'string', maxLength: 255 }, description: 'Search in title, description, location' },
          ],
          responses: {
            200: {
              description: 'Paginated event list',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/PaginatedEvents' },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error' },
          },
        },
        post: {
          summary: 'Create an event',
          description: 'Creates a new event (requires authentication)',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'date_time'],
                  properties: {
                    title: { type: 'string', minLength: 1, maxLength: 255 },
                    description: { type: 'string', maxLength: 5000 },
                    date_time: { type: 'string', format: 'date-time' },
                    location: { type: 'string', maxLength: 500 },
                    is_public: { type: 'boolean', default: true },
                    tag_ids: { type: 'array', items: { type: 'string', format: 'uuid' } },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Event created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/EventWithTags' },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error' },
            429: { description: 'Rate limit exceeded' },
          },
        },
      },
      '/api/events/{id}': {
        get: {
          summary: 'Get event by ID',
          description: 'Returns a single event with its tags',
          tags: ['Events'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Event details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/EventWithTags' },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
            404: { description: 'Event not found' },
          },
        },
        patch: {
          summary: 'Update an event',
          description: 'Partially updates an event (owner only, requires authentication)',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', minLength: 1, maxLength: 255 },
                    description: { type: 'string', maxLength: 5000, nullable: true },
                    date_time: { type: 'string', format: 'date-time' },
                    location: { type: 'string', maxLength: 500, nullable: true },
                    is_public: { type: 'boolean' },
                    tag_ids: { type: 'array', items: { type: 'string', format: 'uuid' } },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Event updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/EventWithTags' },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error' },
            403: { description: 'Forbidden – not the event owner' },
            404: { description: 'Event not found' },
          },
        },
        delete: {
          summary: 'Delete an event',
          description: 'Deletes an event (owner only, requires authentication)',
          tags: ['Events'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Event deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Event deleted successfully' },
                        },
                      },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
            403: { description: 'Forbidden – not the event owner' },
            404: { description: 'Event not found' },
          },
        },
      },
      '/api/rsvps/event/{eventId}': {
        post: {
          summary: 'RSVP to event',
          description: 'Create or update RSVP for an event',
          tags: ['RSVPs'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'eventId',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['response'],
                  properties: {
                    response: { type: 'string', enum: ['YES', 'NO', 'MAYBE'] },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'RSVP recorded',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Rsvp' },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
            403: { description: 'No access to private event' },
          },
        },
        get: {
          summary: 'Get RSVPs for event',
          description: 'Get all RSVPs for an event (event owner only)',
          tags: ['RSVPs'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'eventId',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
            {
              name: 'response',
              in: 'query',
              schema: { type: 'string', enum: ['YES', 'NO', 'MAYBE'] },
            },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: { description: 'List of RSVPs' },
            403: { description: 'Not event owner' },
          },
        },
        delete: {
          summary: 'Cancel RSVP',
          description: 'Cancel your RSVP for an event',
          tags: ['RSVPs'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'eventId',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: { description: 'RSVP cancelled' },
          },
        },
      },
      '/api/rsvps/event/{eventId}/me': {
        get: {
          summary: 'Get my RSVP',
          description: 'Get your RSVP for a specific event',
          tags: ['RSVPs'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'eventId',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Your RSVP or null',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        oneOf: [{ $ref: '#/components/schemas/Rsvp' }, { type: 'null' }],
                      },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/rsvps/event/{eventId}/summary': {
        get: {
          summary: 'Get RSVP summary',
          description: 'Get RSVP counts for an event (public)',
          tags: ['RSVPs'],
          parameters: [
            {
              name: 'eventId',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'RSVP summary',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/RsvpSummary' },
                      error: { type: 'null' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                  },
                },
                accessToken: { type: 'string' },
              },
            },
            error: { type: 'null' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            data: { type: 'null' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Operation completed successfully' },
              },
            },
            error: { type: 'null' },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        EventWithTags: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            date_time: { type: 'string', format: 'date-time' },
            location: { type: 'string', nullable: true },
            is_public: { type: 'boolean' },
            user_id: { type: 'string', format: 'uuid' },
            creator_name: { type: 'string' },
            tags: { type: 'array', items: { $ref: '#/components/schemas/Tag' } },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedEvents: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { $ref: '#/components/schemas/EventWithTags' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        Invitation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            event_id: { type: 'string', format: 'uuid' },
            inviter_id: { type: 'string', format: 'uuid' },
            invitee_id: { type: 'string', format: 'uuid', nullable: true },
            invitee_email: { type: 'string', format: 'email' },
            status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'DECLINED'] },
            event_title: { type: 'string' },
            inviter_name: { type: 'string' },
            invitee_name: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Rsvp: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            event_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            response: { type: 'string', enum: ['YES', 'NO', 'MAYBE'] },
            user_name: { type: 'string' },
            user_email: { type: 'string', format: 'email' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        RsvpSummary: {
          type: 'object',
          properties: {
            yes: { type: 'integer' },
            no: { type: 'integer' },
            maybe: { type: 'integer' },
            total: { type: 'integer' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

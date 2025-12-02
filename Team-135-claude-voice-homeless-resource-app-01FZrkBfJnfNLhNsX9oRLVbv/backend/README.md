# Homebase Backend

Supabase-based backend infrastructure for the Homebase civic-access kiosk application.

## Project Structure

```
backend/
├── supabase/
│   ├── config.toml          # Supabase local development configuration
│   ├── functions/           # Edge Functions (serverless API endpoints)
│   └── migrations/          # Database schema migrations
├── docs/                    # Documentation and setup guides
├── .env.example            # Environment variables template
└── package.json            # Node.js dependencies and scripts
```

## Quick Start

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start local Supabase instance:
   ```bash
   supabase start
   ```

4. Apply database migrations:
   ```bash
   supabase db push
   ```

## Features

- **Emergency Help Module**: Handle emergency requests with 911 dispatch integration
- **Resource Finder**: GIS-enabled location search for shelters, food banks, and services
- **Information & Learning**: Multi-language educational content and programs
- **Accessibility Settings**: User preference management for voice, text, and display options
- **Analytics**: Optional usage tracking and system monitoring

## Technology Stack

- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL 15+**: Relational database
- **PostGIS**: Geospatial extension for location queries
- **Deno**: Runtime for Edge Functions
- **Row Level Security**: Database-level access control

## Documentation

- [Setup Guide](docs/setup.md) - Local development setup instructions
- [Deployment Guide](docs/deployment.md) - Production deployment and verification
- [Authentication & Security](docs/authentication-security.md) - Security best practices

## Development

- `npm start` - Start local Supabase instance
- `npm stop` - Stop local Supabase instance
- `npm run status` - Check Supabase service status
- `npm run db:reset` - Reset database to initial state
- `npm run db:push` - Apply pending migrations
- `npm run functions:serve` - Serve Edge Functions locally
- `npm run functions:deploy` - Deploy Edge Functions to production

## License

MIT

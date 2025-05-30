
# Emissions Data Microservices

A microservices-based system for importing, storing, and querying emissions data. Built with Node.js, TypeScript, Prisma, and PostgreSQL following clean architecture principles.

## Architecture

This project consists of two independent microservices:

- **csv-import-ms**: Handles CSV data import and validation
- **query-ms**: Provides a REST API for querying emissions data with filtering, sorting, and pagination

Both services share a PostgreSQL database but maintain clear separation of concerns.

## Data Model

The system manages emissions data with the following structure:

```typescript
Sector {
  id: string
  name: string              // Sector name (e.g., "Energy")
  country: string           // Country code (e.g., "ESP")
  parentSector: string?     // Parent sector for hierarchical data
}

Emission {
  id: number
  year: number              // Emission year
  value: number             // Emission value
  sectorId: string          // Reference to sector
}
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker setup)

### 1. Clone the Repository

```bash
git clone https://github.com/arcedo/vizzuality-challenge.git
cd vizzuality-callenge
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp example.env .env
```

Edit `.env` with your configuration:
```env
DEV_DB_USER=dev-postgres
DEV_PASSWORD=your_password
DEV_NAME=dev_emissions_db
PORT_IMPORT=3000
PORT_QUERY=3001
```

### 3. Start with Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL database on port 5432
- CSV Import service on port 3000
- Query service on port 3001

### 4. Manual Setup (Alternative)

If you prefer running without Docker:

```bash
# Start PostgreSQL locally
# Then in each microservice directory:

cd csv-import-ms
npm install
npx prisma migrate deploy
npm run dev

cd ../query-ms  
npm install
npx prisma generate
npm run dev
```
You also have to make sure that you have a PostrgresSQL running and pass the environment variables necessary to each micro service.

## CSV Import Service (Port 3000)

### Import Data

```bash
# Import CSV file
curl -X POST http://localhost:3000/api/import \
  -F "file=@your-emissions-data.csv" \
  -H "Content-Type: multipart/form-data"
```

Response:
```json
{
    "success": true,
    "timestamp": "",
    "data": {
        "message": "",
        "stats": {
            "sectors": {
                "totalCountries": 0,
                "totalSectors": 0
            },
            "emissions": {
                "emissionValues": {
                    "min": 0,
                    "max": 0
                },
                "yearRange": {
                    "min": 0,
                    "max": 0
                },
                "totalEmissions": 0
            }
        },
        "performance": {
            "totalDuration": "0s",
            "importDuration": "0s",
            "transactionDuration": "0s"
        }
    }
}
```

### Clear All Data

```bash
curl -X DELETE http://localhost:3000/api/delete-all
```

Response:
```json
{
    "success": true,
    "timestamp": "",
    "data": {
        "message": "",
        "data": {
            "sectorsDeleted": 0,
            "emissionsDeleted": 0
        }
    }
}
```

## Query Service (Port 3001)

### Basic Query

```bash
curl "http://localhost:3001/api/emissions"
```

### Filtering

```bash
# Filter by country
curl "http://localhost:3001/api/emissions?country=SOM"

# Filter by year
curl "http://localhost:3001/api/emissions?year=2014"

# Filter by sector name
curl "http://localhost:3001/api/emissions?sector=Energy"

# Filter by value range
curl "http://localhost:3001/api/emissions?value[gte]=0.1&value[lte]=100"

# Filter by parent sector
curl "http://localhost:3001/api/emissions?sectorParent=Energy"
```

### Sorting

```bash
# Sort by emission value (descending)
curl "http://localhost:3001/api/emissions?sortBy=value&sortOrder=desc"

# Sort by year
curl "http://localhost:3001/api/emissions?sortBy=year&sortOrder=asc"

# Sort by country
curl "http://localhost:3001/api/emissions?sortBy=country&sortOrder=asc"

# Sort by sector name
curl "http://localhost:3001/api/emissions?sortBy=sector&sortOrder=asc"
```

### Pagination

```bash
# Get page 2 with 20 results per page
curl "http://localhost:3001/api/emissions?page=2&pageSize=20"

# Maximum page size is 100
curl "http://localhost:3001/api/emissions?pageSize=100"
```

### Complex Queries

```bash
# USA energy sectors from 2023 with high emissions
curl "http://localhost:3001/api/emissions?country=ABW&value[lte]=18.4&sortBy=value&sortOrder=desc"
```

### Response Format

```json
{
    "success": true,
    "timestamp": "2025-05-30T10:31:13.716Z",
    "data": {
        "emissions": [
            {
                "year": 0,
                "value": 0,
                "sector": "",
                "country": "",
                "parentSector": ""
            }
        ],
        "pagination": {
            "page": 1,
            "pageSize": 10,
            "total": 0,
            "totalPages": 0
        }
    }
}
```

## API Reference

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `year` | number | Filter by emission year | `?year=2023` |
| `country` | string | Filter by country | `?country=ANY` |
| `sector` | string | Filter by sector name (case-insensitive) | `?sector=energy` |
| `sectorParent` | string\|null | Filter by parent sector | `?sectorParent=energy` |
| `value[gte]` | number | Minimum emission value | `?value[gte]=100` |
| `value[lte]` | number | Maximum emission value | `?value[lte]=500` |
| `sortBy` | string | Sort field: `year`, `value`, `sectorName`, `country` | `?sortBy=value` |
| `sortOrder` | string | Sort direction: `asc`, `desc` | `?sortOrder=desc` |
| `page` | number | Page number (min: 1) | `?page=2` |
| `pageSize` | number | Results per page (min: 1, max: 100) | `?pageSize=20` |

### Error Responses

```json
{
    "success": false,
    "timestamp": "",
    "error": {
        "message": "Invalid query parameters provided for emissions retrieval"
    }
}
```

## Testing

### Run Tests

Test CSV import service
```bash
cd csv-import-ms && npm test
```
To test this service you have to set the DATABSE_URL in the .env of the project

Test query service
```bash
cd query-ms && npm test
```

## Architecture Details

### Design Principles

- **Clean Architecture**: Clear separation between domain, application, infrastructure, and presentation layers
- **SOLID Principles**: Single responsibility, dependency inversion, etc.
- **Microservices**: Independent services with clear boundaries
- **Domain-Driven Design**: Rich domain models and ports/adapters pattern

### Project Structure

```
emissions-microservices/
├── csv-import-ms/
│   ├── src/
│   │   ├── domain/           # Business entities and rules
│   │   ├── application/      # Use cases and DTOs
│   │   ├── infrastructure/   # Database, external services, middlewares
│   │   └── presentation/     # Controllers, routes
│   ├── tests/
│   └── prisma/
├── query-ms/
│   ├── src/
│   │   ├── domain/           # Business entities and rules
│   │   ├── application/      # Use cases and DTOs  
│   │   ├── infrastructure/   # Database repositories, middlewares
│   │   └── presentation/     # Controllers, routes
│   ├── tests/
│   └── prisma/
├── docker-compose.dev.yml # Development deployment
├── docker-compose.yml # Production deployment
└── README.md
```

### Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Testing**: Jest
- **Containerization**: Docker
- **Architecture**: Clean Architecture, Microservices

## 🔧 Development

### Adding New Features

1. **Domain Layer**: Define business entities and rules
2. **Application Layer**: Create use cases and DTOs
3. **Infrastructure Layer**: Implement repositories and external integrations
4. **Presentation Layer**: Add controllers and routes
5. **Tests**: Write unit tests for use cases and integration tests

### Database Migrations

```bash
# Create new migration
cd csv-import-ms
npx prisma migrate dev --name your_migration_name

# Deploy migrations
npx prisma migrate deploy
```

## 🚀 Production Deployment

### Environment Variables

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=emissions_db
PORT_IMPORT=3000
PORT_QUERY=3001
```

### Docker Production Build

```bash
# Run with production compose
docker-compose up
```

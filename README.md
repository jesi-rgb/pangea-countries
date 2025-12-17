# pangea-countries

A REST API for country data and information.

## Installation

```bash
bun install
```

## Running the Server

```bash
bun run server.ts
```

The server runs on `http://localhost:8000`

## API Endpoints

### GET /random_country

Returns a random country with all its properties.

**Response:**
```json
{
  "name_long": "United States of America",
  "region_un": "Americas",
  "adm0_a3": "USA",
  ...
}
```

### GET /country_names

Returns a list of all countries with their names and continents.

**Response:**
```json
[
  {
    "name_long": "United States of America",
    "continent": "Americas"
  },
  {
    "name_long": "Canada",
    "continent": "Americas"
  },
  ...
]
```

### GET /country/:id

Returns detailed information for a specific country by its 3-letter code (adm0_a3).

**Parameters:**
- `id` - 3-letter country code (e.g., USA, CAN, FRA)

**Example:** `/country/USA`

**Response:**
```json
{
  "name_long": "United States of America",
  "region_un": "Americas",
  "adm0_a3": "USA",
  ...
}
```

**Error Response (404):**
```json
{
  "error": "Country not found"
}
```

### GET /info/:country

Returns detailed information for a specific country by its name. The search is case-insensitive and ignores accents, spaces, and apostrophes.

**Parameters:**
- `country` - Country name (e.g., UnitedStatesofAmerica, france, cote-d-ivoire)

**Example:** `/info/france`

**Response:**
```json
{
  "name_long": "France",
  "region_un": "Europe",
  "adm0_a3": "FRA",
  ...
}
```

**Error Response (404):**
```json
{
  "error": "Country not found"
}
```

## CORS

All endpoints support CORS with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

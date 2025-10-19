import { file } from "bun";

interface CountryProperties {
	name_long: string;
	region_un: string;
	[key: string]: any;
}

interface CountryName {
	name_long: string;
	continent: string;
}

const dataFilePath = "data/world-data-only.json";
const dataFile = file(dataFilePath);
const data: CountryProperties[] = await dataFile.json();

// Utility function to remove accents (replaces unidecode)
function removeAccents(str: string): string {
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Get random country
function getRandomCountry(countries: CountryProperties[]): CountryProperties {
	const index = Math.floor(Math.random() * countries.length);
	return countries[index]!;
}

function getCountryNames(countries: CountryProperties[]): CountryName[] {
	return countries.map(country => ({
		name_long: country.name_long,
		continent: country.region_un,
	}));
}

function findCountryByName(countries: CountryProperties[], countryName: string): CountryProperties | undefined {
	return countries.find(c => {
		const normalizedName = removeAccents(
			c.name_long.replace(/\s/g, "").replace(/'/g, "")
		).toLowerCase();
		return normalizedName === countryName.toLowerCase();
	});
}

// Get country names
function getCountryNames(countries: Country[]): CountryName[] {
	return countries.map(country => ({
		name_long: country.properties.name_long,
		continent: country.properties.region_un,
	}));
}

// Find country by name
function findCountryByName(countries: Country[], countryName: string): Country | undefined {
	return countries.find(c => {
		const normalizedName = removeAccents(
			c.properties.name_long.replace(/\s/g, "").replace(/'/g, "")
		).toLowerCase();
		return normalizedName === countryName.toLowerCase();
	});
}

// Create server
const server = Bun.serve({
	port: 8000,
	async fetch(req) {
		const url = new URL(req.url);
		const pathname = url.pathname;

		// CORS headers
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		};

		// Handle preflight
		if (req.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			// Route: /random_country
			if (pathname === "/random_country" && req.method === "GET") {
				const country = getRandomCountry(data);
				return Response.json(country, { headers: corsHeaders });
			}

			// Route: /country_names
			if (pathname === "/country_names" && req.method === "GET") {
				const names = getCountryNames(data);
				return Response.json(names, { headers: corsHeaders });
			}

			// Route: /info/<country>
			if (pathname.startsWith("/info/") && req.method === "GET") {
				const country = pathname.slice(6); // Remove "/info/"
				const targetCountry = findCountryByName(data, country);

				if (!targetCountry) {
					return Response.json(
						{ error: "Country not found" },
						{ status: 404, headers: corsHeaders }
					);
				}

				return Response.json(targetCountry, { headers: corsHeaders });
			}

			// 404 for unmatched routes
			return Response.json(
				{ error: "Route not found" },
				{ status: 404, headers: corsHeaders }
			);

		} catch (error) {
			return Response.json(
				{ error: "Internal server error" },
				{ status: 500, headers: corsHeaders }
			);
		}
	},
});

console.log(`Server running on http://localhost:${server.port}`);

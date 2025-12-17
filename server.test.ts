import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import type { Subprocess } from "bun";

interface CountryProperties {
	name_long: string;
	region_un: string;
	adm0_a3: string;
	[key: string]: any;
}

interface CountryName {
	name_long: string;
	continent: string;
}

interface ErrorResponse {
	error: string;
}

const BASE_URL = "http://localhost:8000";
let serverProcess: Subprocess | null = null;

beforeAll(async () => {
	// Start the server
	serverProcess = Bun.spawn(["bun", "run", "server.ts"], {
		stdout: "pipe",
		stderr: "pipe",
	});
	
	// Wait for server to be ready
	await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(() => {
	// Clean up server process
	if (serverProcess) {
		serverProcess.kill();
	}
});

describe("API Endpoints", () => {
	describe("GET /random_country", () => {
		test("should return a country object with correct shape", async () => {
			const response = await fetch(`${BASE_URL}/random_country`);
			expect(response.status).toBe(200);
			
			const country = await response.json() as CountryProperties;
			
			// Check required fields exist
			expect(country).toHaveProperty("name_long");
			expect(country).toHaveProperty("region_un");
			expect(country).toHaveProperty("adm0_a3");
			
			// Check types
			expect(typeof country.name_long).toBe("string");
			expect(typeof country.region_un).toBe("string");
			expect(typeof country.adm0_a3).toBe("string");
			
			// Check values are not empty
			expect(country.name_long.length).toBeGreaterThan(0);
			expect(country.region_un.length).toBeGreaterThan(0);
			expect(country.adm0_a3.length).toBe(3);
		});

		test("should have CORS headers", async () => {
			const response = await fetch(`${BASE_URL}/random_country`);
			expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
		});
	});

	describe("GET /country_names", () => {
		test("should return an array of country names", async () => {
			const response = await fetch(`${BASE_URL}/country_names`);
			expect(response.status).toBe(200);
			
			const names = await response.json() as CountryName[];
			
			// Check it's an array
			expect(Array.isArray(names)).toBe(true);
			expect(names.length).toBeGreaterThan(0);
		});

		test("each country should have correct shape", async () => {
			const response = await fetch(`${BASE_URL}/country_names`);
			const names = await response.json() as CountryName[];
			
			// Check first country
			const firstCountry = names[0]!;
			expect(firstCountry).toHaveProperty("name_long");
			expect(firstCountry).toHaveProperty("continent");
			
			// Check types
			expect(typeof firstCountry.name_long).toBe("string");
			expect(typeof firstCountry.continent).toBe("string");
			
			// Check not empty
			expect(firstCountry.name_long.length).toBeGreaterThan(0);
			expect(firstCountry.continent.length).toBeGreaterThan(0);
		});

		test("should not return empty objects", async () => {
			const response = await fetch(`${BASE_URL}/country_names`);
			const names = await response.json() as CountryName[];
			
			// Check that no country has empty name_long or continent
			names.forEach((country: CountryName) => {
				expect(country.name_long).toBeTruthy();
				expect(country.continent).toBeTruthy();
				expect(typeof country.name_long).toBe("string");
				expect(typeof country.continent).toBe("string");
			});
		});
	});

	describe("GET /country/:id", () => {
		test("should return country by valid ID", async () => {
			const response = await fetch(`${BASE_URL}/country/USA`);
			expect(response.status).toBe(200);
			
			const country = await response.json() as CountryProperties;
			
			expect(country).toHaveProperty("name_long");
			expect(country).toHaveProperty("adm0_a3");
			expect(country.adm0_a3).toBe("USA");
			expect(typeof country.name_long).toBe("string");
		});

		test("should return 404 for invalid ID", async () => {
			const response = await fetch(`${BASE_URL}/country/INVALID`);
			expect(response.status).toBe(404);
			
			const error = await response.json() as ErrorResponse;
			expect(error).toHaveProperty("error");
			expect(error.error).toBe("Country not found");
		});

		test("should handle lowercase ID", async () => {
			const response = await fetch(`${BASE_URL}/country/usa`);
			expect(response.status).toBe(200);
			
			const country = await response.json() as CountryProperties;
			expect(country.adm0_a3).toBe("USA");
		});
	});

	describe("GET /info/:country", () => {
		test("should return country by name", async () => {
			const response = await fetch(`${BASE_URL}/info/Australia`);
			expect(response.status).toBe(200);
			
			const country = await response.json() as CountryProperties;
			
			expect(country).toHaveProperty("name_long");
			expect(country.name_long).toContain("Australia");
		});

		test("should handle country names with spaces removed", async () => {
			const response = await fetch(`${BASE_URL}/info/UnitedStates`);
			expect(response.status).toBe(200);
			
			const country = await response.json() as CountryProperties;
			expect(country.name_long).toContain("United States");
		});

		test("should return 404 for invalid country name", async () => {
			const response = await fetch(`${BASE_URL}/info/InvalidCountryName`);
			expect(response.status).toBe(404);
			
			const error = await response.json() as ErrorResponse;
			expect(error).toHaveProperty("error");
			expect(error.error).toBe("Country not found");
		});
	});

	describe("OPTIONS requests (CORS preflight)", () => {
		test("should handle OPTIONS requests", async () => {
			const response = await fetch(`${BASE_URL}/random_country`, {
				method: "OPTIONS",
			});
			
			expect(response.status).toBe(200);
			expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
			expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
		});
	});

	describe("404 for unknown routes", () => {
		test("should return 404 for unknown route", async () => {
			const response = await fetch(`${BASE_URL}/unknown`);
			expect(response.status).toBe(404);
			
			const error = await response.json() as ErrorResponse;
			expect(error).toHaveProperty("error");
			expect(error.error).toBe("Route not found");
		});
	});
});

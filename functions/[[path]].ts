import worldData from '../data/world.geojson.json';

interface CountryProperties {
	name_long: string;
	region_un: string;
	[key: string]: any;
}

interface Country {
	properties: CountryProperties;
	geometry: any;
	type: string;
}

const data: Country[] = worldData as Country[];

function removeAccents(str: string): string {
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getRandomCountry(countries: Country[]): Country {
	const index = Math.floor(Math.random() * countries.length);
	return countries[index]!;
}

function getCountryNames(countries: Country[]): { name_long: string; continent: string }[] {
	return countries.map(country => ({
		name_long: country.properties.name_long,
		continent: country.properties.region_un,
	}));
}

function findCountryByName(countries: Country[], countryName: string): Country | undefined {
	return countries.find(c => {
		const normalizedName = removeAccents(
			c.properties.name_long.replace(/\s/g, "").replace(/'/g, "")
		).toLowerCase();
		return normalizedName === countryName.toLowerCase();
	});
}

export async function onRequest(context: { request: Request }): Promise<Response> {
	const url = new URL(context.request.url);
	const pathname = url.pathname;

	const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};

	if (context.request.method === "OPTIONS") {
		return new Response(null, { headers: corsHeaders });
	}

	try {
		if (pathname === "/random_country" && context.request.method === "GET") {
			const country = getRandomCountry(data);
			return Response.json(country, { headers: corsHeaders });
		}

		if (pathname === "/country_names" && context.request.method === "GET") {
			const names = getCountryNames(data);
			return Response.json(names, { headers: corsHeaders });
		}

		if (pathname.startsWith("/info/") && context.request.method === "GET") {
			const country = pathname.slice(6);
			const targetCountry = findCountryByName(data, country);

			if (!targetCountry) {
				return Response.json(
					{ error: "Country not found" },
					{ status: 404, headers: corsHeaders }
				);
			}

			return Response.json(targetCountry.properties, { headers: corsHeaders });
		}

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
}

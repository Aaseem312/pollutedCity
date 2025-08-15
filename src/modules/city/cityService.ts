const NodeCache = require( "node-cache" );
import CityConstants from './cityConstant';
const httpRequestAsync = require('request-promise');

const cache = new NodeCache();

export async function getCityData(country: string, page: number, limit: number) {
    let cachedData = cache.get("fetched_cities");
    if (!cachedData || cachedData == undefined) {
        const tokenData = await getToken();
        const refreshToken = tokenData?.refreshToken;
        const refreshedTokenData = await getRefreshedToken(refreshToken);
        const token = refreshedTokenData.token;
        const cities = await getCities(token, country, 1, 10, []);
        cache.set("fetched_cities", cities, 100000);
        cachedData = cache.get("fetched_cities");
    }

    const normalizedResult = await normalizeCityData(cachedData);
    const totalCities = normalizedResult.length;
    const totalPages = Math.ceil(totalCities / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;


    const pagedCities = normalizedResult.slice(startIndex, endIndex);

    const descriptionAdded = await addCityDescriptions(pagedCities, country);

    let finalResult = {
        page,
        limit,
        totalPages,
        cities: descriptionAdded
    };
    return finalResult;
}

async function postApiCall(url: string, body: any, headers: any): Promise<any> {
    const formApi = {
        method: "POST",
        url: url,
        headers: headers,
        body: body,
        json: true,
    };
    try {
        const response = await httpRequestAsync(formApi);
        return response;
    } catch (err) {
        return err;
    }
}

async function getApiCall(url: string, headers: any): Promise<any> {
    const formApi = {
        method: "GET",
        url: url,
        headers: headers,
        json: true
    };
    try {
        const response = await httpRequestAsync(formApi);
        return response;
    } catch (err) {
        return err;
    }
}

async function getToken() {
    const url = `${CityConstants.API_BASE}/auth/login`;
    const body = {
        username: CityConstants.USERNAME,
        password: CityConstants.PASSWORD
    };
    const headers = {
        'Content-Type': 'application/json'
    };
    return await postApiCall(url, body, headers);
}

async function getRefreshedToken(refreshedToken : string) {
    const url = `${CityConstants.API_BASE}/auth/refresh`;
    const body = {
        refreshToken: refreshedToken
    };
    const headers = {
        'Content-Type': 'application/json'
    };
    return await postApiCall(url, body, headers);
}

async function getCities(token: string, country: string, page : number, limit : number, cities : any[]) {
    const url = `${CityConstants.API_BASE}/pollution?country=${country}&page=${page}&limit=${limit}`;
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const response =  await getApiCall(url, headers);

    cities = [...cities, ...response.results];
    const totalPages = response.meta.totalPages;
    const currentPage = response.meta.page;

    if (currentPage < totalPages) {
        return await getCities(token, country, currentPage + 1, limit, cities);
    } else {
        return cities;
    }
}

async function normalizeCityData(data: any[]) {
  const NON_CITY_KEYWORDS = [
    'station',
    'district',
    'zone',
    'area',
    'unknown',
    'powerplant',
    'plant',
    'industrial',
    'monitoring'
  ];

  const normalized = data
    .map(item => {
      if (!item.name) return null;

      // Step 1: Prepare for keyword check (remove accents for keyword detection)
      let nameForCheck = item.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .toLowerCase();

      // Step 2: Reject if it contains non-city keywords
      if (NON_CITY_KEYWORDS.some(keyword => nameForCheck.includes(keyword))) return null;

      // Step 3: Remove bracketed text like "(Area)"
      let cleanName = item.name.replace(/\(.*?\)/g, '').trim();

      // Step 4: Remove accents for final output
      cleanName = cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // Step 5: Proper case formatting
      cleanName = cleanName
        .toLowerCase()
        .split(/[\s-]+/)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        city: cleanName,
        pollution: item.pollution
      };
    })
    .filter(Boolean);

  // Step 6: Deduplicate
  const unique = [];
  const seen = new Set();

  for (const entry of normalized) {
    if (!entry) continue;
    const key = entry.city.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(entry);
    }
  }

  return unique;
}

async function addCityDescriptions(cities: any[], country: string) {
    for (const city of cities) {
        city.name = city.city;
        city.country = CityConstants.COUNTRY_LIST[country as keyof typeof CityConstants.COUNTRY_LIST];
        city.description = await getCityDescription(city.name);
        delete city.city;
    }
    return cities;
}

async function getCityDescription(city: string) {
    let cachedData = cache.get(city);
    if (!cachedData || cachedData == undefined) {
        const url = `${CityConstants.WIKIPEDIA_API}/${encodeURIComponent(city)}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        const response = await getApiCall(url, headers);
        let description = response.extract || '';
        if (description && description.trim() !== '') {
            cache.set(city, description, 100000);
            cachedData = cache.get(city);
        }
        // else{
        //     await new Promise(resolve => setTimeout(resolve, 10000));
        //     getCityDescription(city);
        // }
    }
    return cachedData;
}


import * as cityService from './cityService';

/**
 * Controller for city data
 * Fetches and returns city pollution data
 */
export const getCityData = async (req: Req, res: Res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const country = req.query.country || "FR";
    const cityData = await cityService.getCityData(country, page, limit);
    return res.success(cityData, 'Data successfully Fetched');
  } catch (err) {
    return res.error('Failed to fetch city data', 500, [err]);
  }
};
import * as cityController from '../modules/city/cityController';

export default (router: any) => {
    router.get('/cities', cityController.getCityData);
};
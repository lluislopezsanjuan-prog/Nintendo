import axios from 'axios';

const API_KEY = 'eae47b30194047828d5ec74bcb43685c';
const BASE_URL = 'https://api.rawg.io/api';

export const searchGames = async (query) => {
    if (!query) return [];
    try {
        const response = await axios.get(`${BASE_URL}/games`, {
            params: {
                key: API_KEY,
                search: query,
                page_size: 5
            }
        });
        return response.data.results;
    } catch (error) {
        console.error("RAWG API Error:", error);
        return [];
    }
};

export const getGameDetails = async (id) => {
    try {
        const response = await axios.get(`${BASE_URL}/games/${id}`, {
            params: { key: API_KEY }
        });
        return response.data;
    } catch (error) {
        console.error("RAWG API Error:", error);
        return null;
    }
};

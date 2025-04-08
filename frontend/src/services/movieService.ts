import axios from 'axios'

export const BASE_API_URL="http://localhost:3000/api"

export const getMovies = async () => {
  const response = await axios.get(`${BASE_API_URL}/movies`)
  return response.data.results;
}




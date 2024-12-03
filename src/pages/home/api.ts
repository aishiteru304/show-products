import axios from "axios"

export const getProducts = (limit: number, skip: number, search: string) => {
    return axios.get(import.meta.env.VITE_BASE_URL + `/products/search?q=${search}`, { params: { limit, skip } })
}
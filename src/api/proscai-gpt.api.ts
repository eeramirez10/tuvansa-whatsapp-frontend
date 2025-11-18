import axios from "axios";


export const proscaiGptApi = axios.create({
  baseURL:'http://localhost:4500/api'
})
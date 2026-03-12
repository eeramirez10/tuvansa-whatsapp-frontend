import axios from "axios";
import { envs } from "../config/envs";

export const proscaiGptApi = axios.create({
  baseURL: envs.URL_GPT
})

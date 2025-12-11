import axios from "axios";
import { envs } from "../config/envs";

console.log(envs.URL_GPT)


export const proscaiGptApi = axios.create({
  baseURL: envs.URL_GPT
})
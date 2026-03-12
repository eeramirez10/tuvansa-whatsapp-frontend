import axios from "axios";
import { envs } from "../config/envs";

console.log(envs.URL_ERP)
export const proscaiApi = axios.create({
  baseURL: envs.URL_ERP
})
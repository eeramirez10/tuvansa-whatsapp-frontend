

export const envs = {
  URL: import.meta.env.PROD ? import.meta.env.VITE_API_PROD : import.meta.env.VITE_API_DEV
}
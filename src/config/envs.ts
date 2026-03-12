

export const envs = {
  URL: import.meta.env.PROD ? import.meta.env.VITE_API_PROD : import.meta.env.VITE_API_DEV,
  URL_ERP: import.meta.env.PROD ? import.meta.env.VITE_ERP_PROD : import.meta.env.VITE_ERP_DEV,
  URL_GPT: import.meta.env.PROD ? import.meta.env.VITE_GPT_PROD : import.meta.env.VITE_GPT_DEV,
}
import { useAuthStore } from "../store/auth/auth.store";


export const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${useAuthStore.getState().token}`,
      ...(options?.headers || {})
    }
  });

  if (!response.ok) {

    const body = await response.json()
    const errorMessage = body['error']

    throw new Error(errorMessage);
  };

  const data = (await response.json()) as T;
  return data;
}


export const postFetcher = async <T>(
  url: string,
  data: unknown,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${useAuthStore.getState().token}`,
      ...(options?.headers || {})
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {

    const body = await response.json()
    const errorMessage = body['error']

    throw new Error(errorMessage);
  };

  const result = (await response.json()) as T;
  return result;
};

export const getParams = (params?: Record<string, unknown>) => {

  const urlParamsArr = []

  for (const [key, value] of Object.entries(params ?? {})) {

    urlParamsArr.push(`${key}=${value}`)
  }

  let urlParams = ''

  if (urlParamsArr.length === 1) {
    urlParams = `?${urlParamsArr[0]}`
  }



  return urlParams;

}
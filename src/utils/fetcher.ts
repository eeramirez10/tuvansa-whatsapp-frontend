import { useAuthStore } from "../store/auth/auth.store";

const getResponseError = async (response: Response, fallbackMessage = 'Error en la solicitud') => {
  if (response.status === 401) {
    useAuthStore.getState().logout()
  }

  let errorMessage = response.status === 401
    ? 'Tu sesión expiró. Inicia sesión nuevamente.'
    : fallbackMessage

  try {
    const body = await response.json() as Record<string, unknown>
    if (response.status !== 401 && body.error) {
      errorMessage = `${body.error}`
    }
  } catch {
    // La respuesta puede no incluir un cuerpo JSON.
  }

  return new Error(errorMessage)
}

export const ensureSuccessfulResponse = async (
  response: Response,
  fallbackMessage?: string,
) => {
  if (!response.ok) {
    throw await getResponseError(response, fallbackMessage)
  }
}


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

  await ensureSuccessfulResponse(response)

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

  await ensureSuccessfulResponse(response)

  const result = (await response.json()) as T;
  return result;
};

export const putFetcher = async <T>(
  url: string,
  data: unknown,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${useAuthStore.getState().token}`,
      ...(options?.headers || {})
    },
    body: JSON.stringify(data)
  });

  await ensureSuccessfulResponse(response)

  const result = (await response.json()) as T;
  return result;
};

export const patchFetcher = async <T>(
  url: string,
  data: unknown,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${useAuthStore.getState().token}`,
      ...(options?.headers || {})
    },
    body: JSON.stringify(data)
  });

  await ensureSuccessfulResponse(response)

  const result = (await response.json()) as T;
  return result;
};

export const deleteFetcher = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${useAuthStore.getState().token}`,
      ...(options?.headers || {})
    }
  });

  await ensureSuccessfulResponse(response, 'Error al eliminar')

  return (await response.json()) as T;
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

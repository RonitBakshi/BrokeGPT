const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  const token = localStorage.getItem('brokegpt_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default JSON Content-Type only if not FormData or URLSearchParams
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Dispatch unauthenticated event so AuthContext can clean up
    window.dispatchEvent(new CustomEvent('brokegpt:unauthorized'));
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData = null;

    try {
      errorData = await response.json();
      if (typeof errorData?.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData?.detail)) {
        errorMessage = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // not JSON
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // ignore
      }
    }

    if (response.status === 429) {
      errorMessage = 'Rate limit reached (10 requests/min). Please wait a moment before sending another message.';
    }

    throw new ApiError(response.status, errorMessage, errorData);
  }

  // Handle empty 204 or responses with no body
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

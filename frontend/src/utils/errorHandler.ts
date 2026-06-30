import axios from 'axios';
import type { ApiError } from '../types';

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { code?: string; message?: string } | undefined;
    return {
      code: data?.code ?? 'UNKNOWN_ERROR',
      message: data?.message ?? error.message,
      statusCode: error.response?.status ?? 0,
    };
  }
  if (error instanceof Error) {
    return { code: 'UNKNOWN_ERROR', message: error.message, statusCode: 0 };
  }
  return { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred', statusCode: 0 };
}

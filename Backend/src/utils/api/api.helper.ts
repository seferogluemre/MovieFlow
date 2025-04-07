import { ApiResponse, ApiError } from '../../types/api.types';

export const createSuccessResponse = <T>(data: T, message: string = 'Success'): ApiResponse<T> => {
  return {
    success: true,
    message,
    data
  };
};

export const createErrorResponse = (error: ApiError): ApiResponse => {
  return {
    success: false,
    message: error.message,
    error
  };
};

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success'
): ApiResponse<T[]> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  };
}; 
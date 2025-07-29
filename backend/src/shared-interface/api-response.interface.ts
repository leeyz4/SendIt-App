/* eslint-disable prettier/prettier */
export interface ApiResult<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

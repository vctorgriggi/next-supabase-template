'use client';

import { toast } from 'react-toastify';

export const toastSuccess = (message: string, opts = {}) =>
  toast.success(message, { ...opts });

export const toastError = (message: string, opts = {}) =>
  toast.error(message, { ...opts });

export const toastInfo = (message: string, opts = {}) =>
  toast.info(message, { ...opts });

export const toastWarning = (message: string, opts = {}) =>
  toast.warning(message, { ...opts });

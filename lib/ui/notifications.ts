'use client';

import { toast } from 'sonner';

export const notifySuccess = (message: string, opts = {}) =>
  toast.success(message, { ...opts });

export const notifyError = (message: string, opts = {}) =>
  toast.error(message, { ...opts });

export const notifyInfo = (message: string, opts = {}) =>
  toast.info(message, { ...opts });

export const notifyWarning = (message: string, opts = {}) =>
  toast.warning(message, { ...opts });

import { Permission } from './permission.model';

export interface PermissionState {
  permissions: Permission[];
}

export const initialPermissionState: PermissionState = {
  permissions: [],
};
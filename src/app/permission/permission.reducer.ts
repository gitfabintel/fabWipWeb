import { createReducer, on } from '@ngrx/store';
import { setPermissions, clearPermissions } from './permission.actions';
import { initialPermissionState } from './permission.state';

export const permissionReducer = createReducer(
  initialPermissionState,
  on(setPermissions, (state, { permissions }) => ({
    ...state,
    permissions: permissions
  })),
  on(clearPermissions, (state) => ({
    ...state,
    permissions: []
  }))
);
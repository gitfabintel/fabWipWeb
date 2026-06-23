import { createAction, props } from '@ngrx/store';
import { Permission } from './permission.model';

export const setPermissions = createAction(
  '[Permission] Set Permissions',
  props<{ permissions: Permission[] }>()
);

export const clearPermissions = createAction('[Permission] Clear Permissions');
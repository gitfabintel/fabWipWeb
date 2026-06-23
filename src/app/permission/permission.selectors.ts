import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PermissionState } from './permission.state';

export const selectPermissionState = createFeatureSelector<PermissionState>('permission');

export const selectAllPermissions = createSelector(
  selectPermissionState,
  (state) => state.permissions
);

export const selectPermissionByMenu = (menuName: string) => createSelector(
  selectAllPermissions,
  (permissions) => {
    const findMenu = (menus: any[], menuName: string): any | undefined => {
      for (const menu of menus) {
        if (menu.name.toLowerCase() === menuName.toLowerCase() && menu.canRead) {
          return menu;
        }

        // If the menu has subManu, check within the subManu array as well
        if (menu.subManu?.length > 0) {
          const found = findMenu(menu.subManu, menuName);
          if (found) {
            return found;
          }
        }
      }
      return undefined;
    };

    return findMenu(permissions, menuName); // Start search from the root menus
  }
);
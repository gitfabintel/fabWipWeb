export interface Permission {
    module: string;
    name: string;
    canAdd: boolean;
    canUpdate: boolean;
    canRead: boolean;
    canDelete: boolean;
    signOff: boolean;
    canCheck: boolean;
  }
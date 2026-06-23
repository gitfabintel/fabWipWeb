import { createReducer, on } from '@ngrx/store';
import * as FormActions from './form.actions';

export interface FormState {
  formData: any;
  isAddMode: boolean;
}

const initialState: FormState = {
  formData: null,
  isAddMode: true,
};

export const formReducer = createReducer(
  initialState,
  on(FormActions.updateFormData, (state, { formData }) => ({
    ...state,
    formData,
  })),
  on(FormActions.resetForm, (state) => ({
    ...state,
    formData: null,
  }))
);

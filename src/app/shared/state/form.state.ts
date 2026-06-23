// form.state.ts
export interface FormState {
    isAddMode: boolean;
    formData: any; // Define a specific interface for your form fields if needed
  }
  
  export const initialState: FormState = {
    isAddMode: true,
    formData: null,
  };
  
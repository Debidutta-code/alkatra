import { createSlice } from "@reduxjs/toolkit";

interface FormUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
}

interface UserFormState {
  formData: FormUser;
}

const initialState: UserFormState = {
  formData: {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
  },
};

const userFormSlice = createSlice({
  name: "userForm",
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = action.payload;
    },
  },
});

export const { setFormData } = userFormSlice.actions;
export default userFormSlice.reducer;

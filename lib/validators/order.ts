import { CheckoutFormValues } from "@/types/store";

export function validateCheckoutForm(values: CheckoutFormValues): { isValid: boolean; errors: Partial<Record<keyof CheckoutFormValues, string>> } {
  const errors: Partial<Record<keyof CheckoutFormValues, string>> = {};

  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.lastName.trim()) errors.lastName = "Last name is required";
  if (!values.email.trim() || !values.email.includes("@")) errors.email = "Valid email is required";
  if (!values.phone.trim() || values.phone.replaceAll(/\D/g, "").length < 8) {
    errors.phone = "Valid phone number is required";
  }
  if (!values.address.trim()) errors.address = "Street address is required";
  if (!values.city.trim()) errors.city = "City is required";
  if (!values.state.trim()) errors.state = "State is required";
  if (!values.pincode.trim() || values.pincode.trim().length < 5) {
    errors.pincode = "Valid pincode is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

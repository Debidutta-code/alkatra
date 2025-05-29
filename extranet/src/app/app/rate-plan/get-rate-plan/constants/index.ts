export const API_ENDPOINTS = {
  GET_RATE_PLANS: (propertyId: string) => `http://localhost:8080/api/v1/rate-plan/${propertyId}`,
  DELETE_RATE_PLAN: (ratePlanId: string) => `http://localhost:8080/api/v1/rate-plan/${ratePlanId}`,
};
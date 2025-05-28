export type RatePlan = {
  _id: string;
  ratePlanCode: string;
  ratePlanName: string;
  description: string;
  mealPlan: string;
  currency: string;
  status: string;
  scheduling: {
    type: string;
  };
};
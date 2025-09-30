export const calculateAgeCategory = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  if (age <= 2) return { age, category: "Infant", ageCode: "7" };
  if (age < 12) return { age, category: "Child", ageCode: "8" };
  return { age, category: "Adult", ageCode: "10" };
};
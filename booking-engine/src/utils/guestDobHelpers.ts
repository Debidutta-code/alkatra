export const getDefaultDOBByType = (type: "adult" | "child" | "infant") => {
    const today = new Date();
  
    if (type === "infant") {
      // For infant, default to today's date (i.e., age 0)
      return today.toISOString().split("T")[0];
    }
  
    if (type === "child") {
      // For child, default to exactly 2 years ago (i.e., just turned child)
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(today.getFullYear() - 2);
      return twoYearsAgo.toISOString().split("T")[0];
    }
  
    if (type === "adult") {
      // For adult, default to exactly 13 years ago (i.e., just turned adult)
      const thirteenYearsAgo = new Date();
      thirteenYearsAgo.setFullYear(today.getFullYear() - 13);
      return thirteenYearsAgo.toISOString().split("T")[0];
    }
  
    // fallback to today for unknown type
    return today.toISOString().split("T")[0];
  };
  
  export const getGuestType = (dob: string | undefined): "adult" | "child" | "infant" => {
    if (!dob) return "adult";
    const birthDate = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  
    if (age < 2) return "infant";
    if (age < 13) return "child";
    return "adult";
  };
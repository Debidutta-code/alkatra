class CustomerReviewApi {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL ?? '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Submit a new customer review
   */
  async submitReview(reviewData: {
    reservationId: string;
    hotelCode: string;
    hotelName: string;
    userId: string;
    guestEmail: string;
    comment: string;
    rating: number;
  }) {

    const response = await fetch(`${this.baseUrl}/review/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    return await response;
  }

  /**
   * Get reservation details for review
   */
  async getReservationForReview(reservationId: string) {
    const response = await fetch(
      `${this.baseUrl}/review/get/reservation?reservationId=${reservationId}`
    );
    return await response.json();
  }


  /**
   * Get a specific review by ID
   */
  async getReviewById(reviewId: string) {
  try {
    const response = await fetch(`${this.baseUrl}/review/get?reservationId=${reviewId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); 
  
    if (data.data.customerReview.length === 0) {
      return true;
    }

    
    return false; 

  } catch (error) {
    console.error("Error fetching review:", error);
    throw error;
  }
}


}

export { CustomerReviewApi };
export interface Notification {
  id: string;
  title: string;
  body: string;
  data: {
    type: string;
    offerCode: string;
    _id?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
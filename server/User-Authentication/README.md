# Technical Documentation for Yootrip

## 1. Architecture

### System Architecture

#### User Flow Design:
The User Flow Design outlines the high-level process and interactions within the Online Travel Agency (OTA) platform. It illustrates how users navigate through the system, from registration to property booking and payment processing.
[User flow Architecture Design](https://www.figma.com/file/Jicb2Fg3cRqkZqyCr6dRND/OTR-flow-chart?type=whiteboard&t=ktpGaS6TFkbWGaVV-1)
![User flow Architecture Design](https://github.com/Quotustech/Bookings_co/blob/main/resources/Screenshot%20from%202023-11-17%2010-19-54.png)

#### Low-Level Design:
The Low-Level Design provides a more detailed view of the system's components, their interactions, and the flow of data. It delves into the inner workings of the OTA platform, offering insights into the technical aspects that enable the seamless functioning of the system.
[OTA System Architecture Design](https://www.figma.com/file/7qHVNMKc1698KaSgM1gzih/OTA-LOW-level-design?type=whiteboard&node-id=0%3A1&t=oPuGdkuTGeTIh5ZO-1)
![OTA System Architecture Design](https://github.com/Quotustech/Bookings_co/blob/main/resources/Screenshot%20from%202023-11-17%2010-21-02.png)

#### Microservices

1. **Authentication Service**
    - **Functionalities:**
        - User registration and account creation.
        - Login and session management.
        - Role-based access control.
        - OAuth integration with third-party providers.
    - **API Endpoints:**
        <!-- - `/register` - User registration.
        - `/login` - User login.
        - `/logout` - User logout.
        - `/profile` - User profile information.
        - `/token/refresh` - Refresh access tokens. -->

2. **Booking Service**
    - **Functionalities:**
        - Property booking and reservation.
        - Booking confirmation and cancellation.
        - Booking history and details.
        - Integration with payment service.
    - **API Endpoints:**
        <!-- - `/book` - Create a new booking.
        - `/cancel/{booking_id}` - Cancel a booking.
        - `/history` - View booking history.
        - `/details/{booking_id}` - View booking details. -->

3. **Property Extranet Service**
    - **Functionalities:**
        - Property listing and management.
        - Availability calendar.
        - Property performance analytics.
    - **API Endpoints:**
        <!-- - `/listings` - List all properties.
        - `/add` - Add a new property.
        - `/edit/{property_id}` - Edit property details.
        - `/analytics` - Property performance analytics. -->

4. **Payment Service**
    - **Functionalities:**
        - Payment processing.
        - Invoice generation.
        - Integration with third-party payment gateways.
    - **API Endpoints:**
        <!-- - `/process` - Process a payment.
        - `/invoice/{booking_id}` - Generate an invoice. -->

5. **Search Engine Service**
    - **Functionalities:**
        - Property search based on various criteria.
        - Location-based search.
        - Sorting and filtering options.
    - **API Endpoints:**
        <!-- - `/search` - Perform a property search.
        - `/filter` - Apply filters to search results. -->

6. **Admin Service**
    - **Functionalities:**
        - User management.
        - Content moderation.
        - System configuration.
    - **API Endpoints:**
        <!-- - `/users` - List all users.
        - `/moderate/{content_id}` - Moderate content.
        - `/config` - System configuration. -->

7. **Report Service**
    - **Functionalities:**
        - Generate reports on user activity.
        - Financial reports.
        - Customizable reporting options.
    - **API Endpoints:**
        <!-- - `/user-activity` - Generate user activity report.
        - `/financial` - Generate financial report. -->

8. **Notification Service**
    - **Functionalities:**
        - Push and email notifications.
        - User preference management.
    - **API Endpoints:**
        <!-- - `/push` - Send push notifications.
        - `/email` - Send email notifications.
        - `/preferences` - Manage user notification preferences. -->

9. **ARI Management Service**
    - **Functionalities:**
        - Availability management.
        - Rate management.
        - Inventory management.
    - **API Endpoints:**
        <!-- - `/availability` - Manage property availability.
        - `/rate` - Manage property rates.
        - `/inventory` - Manage property inventory. -->

10. **Review and Rating Service**
    - **Functionalities:**
        - User reviews and ratings.
        - Average ratings calculation.
    - **API Endpoints:**
        <!-- - `/submit` - Submit a review and rating.
        - `/average/{property_id}` - Get average ratings. -->

#### Database Schema

- MongoDB is used as the primary database.
- Each service may have its own database or share a common database, depending on requirements.

### Technologies Used

- Programming Languages: Javascript
- Frameworks: Node.js,express.js,react.js,next.js
- Database: MongoDB
- ...

## 2. Development Environment Setup
...

## 3. API Documentation
...

## 4. Data Models

![User flow Architecture Design](https://github.com/Quotustech/Bookings_co/blob/main/resources/booking_data_digram%201.svg)

## 5. Third-Party Integrations
1. **Razorpay Integration**
    - **Description:**
        - Integration with Razorpay for seamless payment processing.
        - Support for multiple payment methods, including credit cards, debit cards, net banking, and digital wallets.
        - Secure handling of payment transactions.
    - **Implementation:**
        - Utilize Razorpay API for payment initiation and processing.
        - Implement webhooks for real-time updates on payment status.
        - Handle payment confirmation and generate invoices.

## 6. Versioning

1. **1.0.0**
   - **Description:**
        - The initial release of the Online Travel Agency (OTA) platform.
        - Labeled as version 1.0.0.
        - Focuses on fundamental features and essential modules.



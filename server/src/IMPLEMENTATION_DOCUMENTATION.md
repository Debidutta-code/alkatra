# Dynamic PMS Integration - Implementation Documentation

## Overview
This document details the implementation of dynamic PMS (Property Management System) integration that allows properties to connect with different PMS providers. The system now supports both XML-based (Wincloud) and JSON-based (QuotusPMS) integrations.

## Problem Statement
- Previously, the system was tightly coupled with Wincloud PMS using XML format
- Need to support multiple PMS providers with different data formats
- Properties should be able to choose their preferred PMS during registration
- QuotusPMS uses JSON format for communication (bidirectional)

## Solution Architecture

### 1. Data Source Provider System
**Location:** `/app/server/src/property_management/src/model/dataSourceProvider.model.ts`

The `DataSourceProvider` model stores information about available PMS/CM integrations:
- **name**: Provider name (e.g., \"Wincloud\", \"QuotusPMS\")
- **type**: Provider type (\"PMS\", \"CM\", or \"Internal\")
- **format**: Data format (\"XML\" or \"JSON\")
- **apiEndpoint**: API endpoint for the provider
- **isActive**: Whether the provider is currently active
- **description**: Human-readable description

### 2. Property Configuration
**Location:** `/app/server/src/property_management/src/model/property.info.model.ts`

Each property has a `dataSource` field that references the selected `DataSourceProvider`. This allows the system to know which PMS to use for each property.

### 3. QuotusPMS Module Structure

```
/app/server/src/quotus_pms/
├── src/
│   ├── interfaces/
│   │   └── reservation.interface.ts   # TypeScript interfaces for QuotusPMS data
│   ├── models/
│   │   └── reservation.model.ts       # MongoDB model for storing reservations
│   ├── repositories/
│   │   └── reservation.repository.ts  # Database operations
│   ├── formatters/
│   │   └── reservation.formatter.ts   # Data transformation and validation
│   ├── services/
│   │   └── reservation.service.ts     # Business logic
│   ├── controllers/
│   │   └── reservation.controller.ts  # Request handlers
│   ├── utils/
│   │   └── apiClient.ts               # HTTP client for QuotusPMS API
│   └── api/
│       └── routes.ts                   # Express routes
```

### 4. PMS Orchestrator
**Location:** `/app/server/src/common/pmsOrchestrator.ts`

The `PMSOrchestrator` is a factory/router that:
1. Receives a reservation request with propertyId
2. Looks up the property's configured dataSource
3. Routes the request to the appropriate PMS handler (Wincloud or QuotusPMS)

This allows seamless switching between different PMS providers based on property configuration.

## Implementation Details

### Phase 1: Data Source Providers ✅

**Files Modified:**
- `/app/server/src/property_management/src/utils/seedProviders.ts`
- `/app/server/src/property_management/src/model/dataSourceProvider.model.ts`

**Changes:**
1. Added QuotusPMS to the seed data
2. Added `format` field to distinguish between XML and JSON providers
3. Wincloud marked as XML, QuotusPMS marked as JSON

**Seed Data:**
```javascript
{
  name: 'QuotusPMS',
  type: 'PMS',
  format: 'JSON',
  isActive: true,
  apiEndpoint: process.env.QUOTUS_PMS_API || 'http://localhost:9000/api/reservations',
  description: 'JSON-based PMS for property management'
}
```

### Phase 2: QuotusPMS Interfaces ✅

**File:** `/app/server/src/quotus_pms/src/interfaces/reservation.interface.ts`

**Key Interfaces:**

1. **IQuotusPMSReservation** - The format QuotusPMS expects:
```typescript
{
  from: Date;
  to: Date;
  Guests: IGuest[];
  bookedAt: Date;
  totalAmount: number;
  paidAmount: number;
  discountedAmount: number;
  paymentNote: string | null;
  currencyCode: CurrencyCode;
  paymentMethod: PaymentMethod;
  Rooms: IRoom[];
  additionalNotes: string | null;
}
```

2. **IReservationInput** - Internal format from booking engine

3. **IGuest** - Guest information with address details

4. **IRoom** - Room details with rate plan information

### Phase 3: QuotusPMS Services ✅

**1. Formatter** (`formatters/reservation.formatter.ts`)
- Converts internal format to QuotusPMS format
- Validates reservation data
- Returns validation errors if any

**2. API Client** (`utils/apiClient.ts`)
- Uses Axios to send JSON data to QuotusPMS
- Configurable endpoint via environment variable or constructor
- Comprehensive error handling

**3. Repository** (`repositories/reservation.repository.ts`)
- Saves reservation records to MongoDB
- Tracks request/response payloads
- Maintains reservation status (pending/confirmed/failed)

**4. Service** (`services/reservation.service.ts`)
- Orchestrates the reservation process:
  1. Format reservation data
  2. Validate data
  3. Send to QuotusPMS API
  4. Save to database
  5. Return reservation ID

**5. Controller** (`controllers/reservation.controller.ts`)
- Handles HTTP requests
- Validates input
- Returns JSON responses

### Phase 4: Routes Integration ✅

**File:** `/app/server/src/common/express.ts`

**New Routes:**
```
POST   /api/v1/quotus-pms/reservations                    - Create reservation
GET    /api/v1/quotus-pms/reservations/:reservationId     - Get reservation
GET    /api/v1/quotus-pms/properties/:propertyId/reservations - Get property reservations
```

### Phase 5: PMS Orchestrator ✅

**File:** `/app/server/src/common/pmsOrchestrator.ts`

**Functionality:**
```typescript
PMSOrchestrator.processReservation(propertyId, reservationData)
```

**Flow:**
1. Fetch property from database
2. Get property's dataSource (populated)
3. Check dataSource type:
   - If \"Internal\" → Handle internally
   - If \"Wincloud\" → Route to Wincloud service (XML)
   - If \"QuotusPMS\" → Route to QuotusPMS service (JSON)
4. Return reservation ID

## API Contracts

### QuotusPMS Reservation Request

**Endpoint:** `POST /api/v1/quotus-pms/reservations`

**Request Body:**
```json
{
  \"propertyId\": \"property_uuid\",
  \"bookingDetails\": {
    \"checkInDate\": \"2026-01-08T09:30:00.000Z\",
    \"checkOutDate\": \"2026-01-10T09:30:00.000Z\",
    \"reservationId\": \"res_12345\",
    \"userId\": \"user_uuid\"
  },
  \"guests\": [
    {
      \"firstName\": \"Sandeep\",
      \"lastName\": \"Mohapatra\",
      \"email\": \"mohapatrasandeep28@gmail.com\",
      \"phone\": \"+918249419295\",
      \"userType\": \"adult\",
      \"address\": \"K8-110 Kalinga Nagar, Shampur\",
      \"city\": \"Bhubaneswar\",
      \"state\": \"Odisha\",
      \"country\": \"India\",
      \"zipCode\": \"751003\"
    }
  ],
  \"rooms\": [
    {
      \"numberOfRooms\": 1,
      \"ratePlanCode\": \"5T8K3E\",
      \"roomTypeCode\": \"Suit\",
      \"roomTypeName\": \"Suit King\",
      \"ratePlanName\": \"BAR\",
      \"numberOfAdults\": 2,
      \"numberOfChildren\": 0,
      \"numberOfInfants\": 0
    }
  ],
  \"payment\": {
    \"totalAmount\": 1300,
    \"paidAmount\": 0,
    \"discountedAmount\": 0,
    \"currencyCode\": \"INR\",
    \"paymentMethod\": \"cash\",
    \"paymentNote\": null
  },
  \"additionalNotes\": \"\"
}
```

**Response (Success):**
```json
{
  \"success\": true,
  \"message\": \"Reservation processed successfully\",
  \"data\": {
    \"reservationId\": \"res_12345\"
  }
}
```

**Response (Error):**
```json
{
  \"success\": false,
  \"error\": \"Error message\"
}
```

### Data Sent to QuotusPMS

The system transforms the above format to QuotusPMS's expected format:

```json
{
  \"from\": \"2026-01-08T09:30:00.000Z\",
  \"to\": \"2026-01-10T09:30:00.000Z\",
  \"Guests\": [
    {
      \"firstName\": \"Sandeep\",
      \"lastName\": \"Mohapatra\",
      \"email\": \"mohapatrasandeep28@gmail.com\",
      \"phoneNumber\": \"+918249419295\",
      \"userType\": \"adult\",
      \"address\": \"K8-110 Kalinga Nagar, Shampur\",
      \"city\": \"Bhubaneswar\",
      \"state\": \"Odisha\",
      \"country\": \"India\",
      \"zipCode\": \"751003\"
    }
  ],
  \"bookedAt\": \"2026-01-10T05:20:00.000Z\",
  \"totalAmount\": 1300,
  \"paidAmount\": 0,
  \"discountedAmount\": 0,
  \"paymentNote\": null,
  \"currencyCode\": \"INR\",
  \"paymentMethod\": \"cash\",
  \"Rooms\": [
    {
      \"noOfRooms\": 1,
      \"ratePlanCode\": \"5T8K3E\",
      \"roomCode\": \"Suit\",
      \"roomName\": \"Suit King\",
      \"ratePlanName\": \"BAR\",
      \"noOfAdults\": 2,
      \"noOfChildren\": 0,
      \"noOfInfants\": 0
    }
  ],
  \"additionalNotes\": \"\"
}
```

## Frontend Integration

### Property Configuration
**Location:** `/app/extranet/src/components/property/property-configuration.tsx`

The frontend already has a complete UI for selecting:
- PMS (Property Management System)
- CM (Channel Manager)
- Internal

When a user selects QuotusPMS:
1. The selection is stored in localStorage
2. During property creation, the dataSource is saved in the property document
3. All future reservations for that property will be routed to QuotusPMS

## Database Collections

### 1. DataSourceProviders
Stores available PMS/CM providers:
```javascript
{
  _id: ObjectId,
  name: \"QuotusPMS\",
  type: \"PMS\",
  format: \"JSON\",
  isActive: true,
  apiEndpoint: \"http://localhost:9000/api/reservations\",
  description: \"JSON-based PMS for property management\",
  createdAt: Date,
  updatedAt: Date
}
```

### 2. PropertyInfo
Each property references its dataSource:
```javascript
{
  _id: ObjectId,
  property_name: \"Hotel XYZ\",
  dataSource: ObjectId (ref: DataSourceProvider),
  // ... other fields
}
```

### 3. QuotusPMSReservations
Stores QuotusPMS reservation records:
```javascript
{
  _id: ObjectId,
  propertyId: \"property_uuid\",
  reservationId: \"res_12345\",
  reservationData: { /* QuotusPMS format */ },
  requestPayload: \"JSON string of request\",
  responsePayload: \"JSON string of response\",
  status: \"confirmed\", // pending | confirmed | failed
  createdAt: Date,
  updatedAt: Date
}
```

## Environment Variables

Add to `/app/server/.env`:
```bash
# QuotusPMS API endpoint
QUOTUS_PMS_API=http://localhost:9000/api/reservations
```

## Testing

### 1. Seed Data Source Providers
```bash
cd /app/server
npm run seed:providers  # Or execute the seed file
```

### 2. Test QuotusPMS Reservation
```bash
curl -X POST http://localhost:8001/api/v1/quotus-pms/reservations \
  -H \"Content-Type: application/json\" \
  -d '{
    \"propertyId\": \"property_id_here\",
    \"bookingDetails\": {
      \"checkInDate\": \"2026-01-15T09:30:00.000Z\",
      \"checkOutDate\": \"2026-01-17T09:30:00.000Z\",
      \"reservationId\": \"test_res_001\",
      \"userId\": \"user_id_here\"
    },
    \"guests\": [{
      \"firstName\": \"Test\",
      \"lastName\": \"User\",
      \"email\": \"test@example.com\",
      \"phone\": \"+1234567890\",
      \"userType\": \"adult\"
    }],
    \"rooms\": [{
      \"numberOfRooms\": 1,
      \"ratePlanCode\": \"BAR\",
      \"roomTypeCode\": \"DELUXE\",
      \"roomTypeName\": \"Deluxe Room\",
      \"ratePlanName\": \"Best Available Rate\",
      \"numberOfAdults\": 2,
      \"numberOfChildren\": 0,
      \"numberOfInfants\": 0
    }],
    \"payment\": {
      \"totalAmount\": 5000,
      \"paidAmount\": 0,
      \"discountedAmount\": 0,
      \"currencyCode\": \"INR\",
      \"paymentMethod\": \"cash\"
    }
  }'
```

## Current Status

### ✅ Completed
1. **Data Source Provider Model** - Added format field and QuotusPMS
2. **Seed Data** - Updated with QuotusPMS
3. **QuotusPMS Module** - Complete implementation
   - Interfaces for all data structures
   - Database model for reservations
   - Repository for data operations
   - Formatter for data transformation
   - API client for HTTP communication
   - Service for business logic
   - Controller for request handling
   - Routes for API endpoints
4. **PMS Orchestrator** - Dynamic routing based on property configuration
5. **Express Routes** - Integrated QuotusPMS routes
6. **Frontend** - Property configuration UI already exists

### 🚧 Pending (Future Work)
1. **ARI (Availability, Rate, Inventory) Implementation**
   - Create endpoint to receive ARI data from QuotusPMS
   - Process and store ARI data
   - Update room availability in real-time
   
2. **Wincloud ARI Integration** (if not already complete)
   - Verify current Wincloud ARI implementation
   - Ensure consistency with QuotusPMS approach

3. **Authentication**
   - Add API key/token authentication when required
   - Implement middleware for secure communication

4. **Booking Engine Integration**
   - Update booking engine to use PMSOrchestrator
   - Ensure seamless reservation flow

5. **Testing**
   - Unit tests for QuotusPMS services
   - Integration tests for end-to-end flow
   - Test with actual QuotusPMS instance

6. **Error Handling & Monitoring**
   - Add comprehensive logging
   - Implement retry mechanisms
   - Set up alerts for failed reservations

## Next Steps

1. **Run Seed Script** to add QuotusPMS to database:
   ```bash
   cd /app/server/src/property_management/src/utils
   npx ts-node seedProviders.ts
   ```

2. **Start Server** and verify routes are working:
   ```bash
   cd /app/server
   npm run dev
   ```

3. **Test Property Creation** with QuotusPMS selection

4. **Test Reservation Flow** with a QuotusPMS property

5. **Implement ARI Endpoint** for receiving data from QuotusPMS:
   - Endpoint: `POST /api/v1/quotus-pms/ari`
   - Accept JSON data
   - Update availability/rates/inventory

## Key Files Created/Modified

### Created Files (9 files)
1. `/app/server/src/quotus_pms/src/interfaces/reservation.interface.ts`
2. `/app/server/src/quotus_pms/src/models/reservation.model.ts`
3. `/app/server/src/quotus_pms/src/repositories/reservation.repository.ts`
4. `/app/server/src/quotus_pms/src/formatters/reservation.formatter.ts`
5. `/app/server/src/quotus_pms/src/utils/apiClient.ts`
6. `/app/server/src/quotus_pms/src/services/reservation.service.ts`
7. `/app/server/src/quotus_pms/src/controllers/reservation.controller.ts`
8. `/app/server/src/quotus_pms/src/api/routes.ts`
9. `/app/server/src/common/pmsOrchestrator.ts`

### Modified Files (3 files)
1. `/app/server/src/property_management/src/model/dataSourceProvider.model.ts` - Added format field
2. `/app/server/src/property_management/src/utils/seedProviders.ts` - Added QuotusPMS
3. `/app/server/src/common/express.ts` - Added QuotusPMS routes

## Summary

The system now supports dynamic PMS integration with the following capabilities:

1. **Multi-PMS Support**: Can work with both XML (Wincloud) and JSON (QuotusPMS) based systems
2. **Property-Level Configuration**: Each property can choose its preferred PMS
3. **Seamless Routing**: PMSOrchestrator automatically routes to the correct PMS
4. **Extensible Design**: Easy to add new PMS providers
5. **Complete Audit Trail**: All reservations logged with request/response data
6. **Frontend Ready**: UI already supports PMS selection

The reservation module is complete and ready for testing. The ARI module can be implemented following the same pattern.

Api for Getting availability and RoomPrice 
=>http://localhost:8080/api/v1/rate-plan/hotelCode


can use page in querry params for page no such as 
->http://localhost:8080/api/v1/rate-plan/hotelCode?page=2
default page-1
method-> POST
 body-> hotelCode,invTypeCode,startDate,endDate
 ex->
    "hotelCode": "WINCLOUD",
    "invTypeCode":"SUT",
    "startDate":"2025-05-26",
    "endDate":"2025-06-29"
result 
{
    success:true||false
    message:"",
    data:{
        data:{            // it includes actual data to display
        _id:This is the inventory Id required for updating the availability
availability{
    count:// this is the no of rooms available
},
rates:{
    currencyCode:currency
    baseByGuestAmts:{
        amountBeforeTax//price to display
        _id://this includes id for rateamount required for updaing the price details
    }
}
        },pagination:{//it includes pagination results

        }
    }
}
{
    "success": true,
    "message": "Rate plans retrieved successfully",
    "data": {
        "data": [
            {
                "_id": "6833f73a1b55e8ae6338d8cb",
                "hotelCode": "WINCLOUD",
                "invTypeCode": "SUT",
                "availability": {
                    "startDate": "2025-06-16T00:00:00.000Z",
                    "count": 6,
                    "endDate": "2025-06-16T00:00:00.000Z"
                },
                "rates": {
                    "currencyCode": "INR",
                    "baseByGuestAmts": {
                        "amountBeforeTax": 3000,
                        "numberOfGuests": 1,
                        "_id": "68341e99510fa0207453a5b5"
                    }
                }
            },
            {
                "_id": "6833f73a1b55e8ae6338d8cc",
                "hotelCode": "WINCLOUD",
                "invTypeCode": "SUT",
                "availability": {
                    "startDate": "2025-06-17T00:00:00.000Z",
                    "count": 6,
                    "endDate": "2025-06-17T00:00:00.000Z"
                },
                "rates": {
                    "currencyCode": "INR",
                    "baseByGuestAmts": {
                        "amountBeforeTax": 3000,
                        "numberOfGuests": 1,
                        "_id": "68341e99510fa0207453a5b5"
                    }
                }
            },
            
        ],
        "pagination": {
            "currentPage": 2,
            "totalPages": 2,
            "totalResults": 35,
            "hasNextPage": false,
            "hasPreviousPage": true,
            "resultsPerPage": 20
        }
    }
}
















Api for updating the availability and the price
required fields=>inventoryId,rateAmountId,availability,price
http://localhost:8080/api/v1/rate-plan/update/:inventoryId
method->PUT
Playload->
availability
price
rateAmountId

result->
{
    success:true||false
}
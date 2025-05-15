const flight_offers =
  {
      "success": true,
      "data": {
          "meta": {
              "count": 2,
            //   "links": {
            //       "self": "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=BBI&destinationLocationCode=PAR&departureDate=2024-10-24&returnDate=2025-01-24&adults=1&max=2"
            //   }
          },
          "data": [
              {
                  "type": "flight-offer",
                  "id": "1",
                  "source": "GDS",
                  "instantTicketingRequired": false,
                  "nonHomogeneous": false,
                  "oneWay": false,
                  "isUpsellOffer": false,
                  "lastTicketingDate": "2024-10-24",
                  "lastTicketingDateTime": "2024-10-24",
                  "numberOfBookableSeats": 1,
                  "itineraries": [
                      {
                          "duration": "PT18H55M",
                          "segments": [
                              {
                                  "departure": {
                                      "iataCode": "BBI",
                                      "terminal": "1",
                                      "at": "2024-10-24T20:30:00"
                                  },
                                  "arrival": {
                                      "iataCode": "DEL",
                                      "terminal": "3",
                                      "at": "2024-10-24T22:55:00"
                                  },
                                  "carrierCode": "UK",
                                  "number": "782",
                                  "aircraft": {
                                      "code": "320"
                                  },
                                  "operating": {
                                      "carrierCode": "UK"
                                  },
                                  "duration": "PT2H25M",
                                  "id": "1",
                                  "numberOfStops": 0,
                                  "blacklistedInEU": false
                              },
                              {
                                  "departure": {
                                      "iataCode": "DEL",
                                      "terminal": "3",
                                      "at": "2024-10-25T03:55:00"
                                  },
                                  "arrival": {
                                      "iataCode": "AMS",
                                      "at": "2024-10-25T09:40:00"
                                  },
                                  "carrierCode": "KL",
                                  "number": "872",
                                  "aircraft": {
                                      "code": "781"
                                  },
                                  "operating": {
                                      "carrierCode": "KL"
                                  },
                                  "duration": "PT9H15M",
                                  "id": "2",
                                  "numberOfStops": 0,
                                  "blacklistedInEU": false
                              },
                              {
                                  "departure": {
                                      "iataCode": "AMS",
                                      "at": "2024-10-25T10:35:00"
                                  },
                                  "arrival": {
                                      "iataCode": "CDG",
                                      "terminal": "2F",
                                      "at": "2024-10-25T11:55:00"
                                  },
                                  "carrierCode": "KL",
                                  "number": "2007",
                                  "aircraft": {
                                      "code": "223"
                                  },
                                  "operating": {
                                      "carrierCode": "AF"
                                  },
                                  "duration": "PT1H20M",
                                  "id": "3",
                                  "numberOfStops": 0,
                                  "blacklistedInEU": false
                              }
                          ]
                      },
                      {
                          "duration": "PT16H5M",
                          "segments": [
                              {
                                  "departure": {
                                      "iataCode": "CDG",
                                      "terminal": "2E",
                                      "at": "2025-01-24T10:35:00"
                                  },
                                  "arrival": {
                                      "iataCode": "DEL",
                                      "terminal": "3",
                                      "at": "2025-01-24T23:45:00"
                                  },
                                  "carrierCode": "AF",
                                  "number": "226",
                                  "aircraft": {
                                      "code": "77W"
                                  },
                                  "operating": {
                                      "carrierCode": "AF"
                                  },
                                  "duration": "PT8H40M",
                                  "id": "7",
                                  "numberOfStops": 0,
                                  "blacklistedInEU": false
                              },
                              {
                                  "departure": {
                                      "iataCode": "DEL",
                                      "terminal": "2",
                                      "at": "2025-01-25T04:55:00"
                                  },
                                  "arrival": {
                                      "iataCode": "BBI",
                                      "terminal": "1",
                                      "at": "2025-01-25T07:10:00"
                                  },
                                  "carrierCode": "AF",
                                  "number": "6079",
                                  "aircraft": {
                                      "code": "32Q"
                                  },
                                  "operating": {
                                      "carrierCode": "6E"
                                  },
                                  "duration": "PT2H15M",
                                  "id": "8",
                                  "numberOfStops": 0,
                                  "blacklistedInEU": false
                              }
                          ]
                      }
                  ],
                  "price": {
                      "currency": "EUR",
                      "total": "671.30",
                      "base": "190.00",
                      "fees": [
                          {
                              "amount": "0.00",
                              "type": "SUPPLIER"
                          },
                          {
                              "amount": "0.00",
                              "type": "TICKETING"
                          }
                      ],
                      "grandTotal": "671.30"
                  },
                  "pricingOptions": {
                      "fareType": [
                          "PUBLISHED"
                      ],
                      "includedCheckedBagsOnly": false
                  },
                  "validatingAirlineCodes": [
                      "AF"
                  ],
                  "travelerPricings": [
                      {
                          "travelerId": "1",
                          "fareOption": "STANDARD",
                          "travelerType": "ADULT",
                          "price": {
                              "currency": "EUR",
                              "total": "671.30",
                              "base": "190.00"
                          },
                          "fareDetailsBySegment": [
                              {
                                  "segmentId": "1",
                                  "cabin": "ECONOMY",
                                  "fareBasis": "XGS0PHLA",
                                  "brandedFare": "LIGHT",
                                  "brandedFareLabel": "ECONOMY LIGHT",
                                  "class": "W",
                                  "includedCheckedBags": {
                                      "quantity": 0
                                  },
                                  "amenities": [
                                      {
                                          "description": "CHECKED BAG 1PC OF 23KG 158CM",
                                          "isChargeable": true,
                                          "amenityType": "BAGGAGE",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "SNACK",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "BEVERAGE",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "MEAL",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "CHOICE OF STANDARD SEAT",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "UPGRADE ELIGIBILITY",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      }
                                  ]
                              },
                              {
                                  "segmentId": "2",
                                  "cabin": "ECONOMY",
                                  "fareBasis": "XGS0PHLA",
                                  "brandedFare": "LIGHT",
                                  "brandedFareLabel": "ECONOMY LIGHT",
                                  "class": "X",
                                  "includedCheckedBags": {
                                      "quantity": 0
                                  },
                                  "amenities": [
                                      {
                                          "description": "CHECKED BAG 1PC OF 23KG 158CM",
                                          "isChargeable": true,
                                          "amenityType": "BAGGAGE",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "SNACK",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "BEVERAGE",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "MEAL",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "CHOICE OF STANDARD SEAT",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "UPGRADE ELIGIBILITY",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      }
                                  ]
                              },
                              {
                                  "segmentId": "3",
                                  "cabin": "ECONOMY",
                                  "fareBasis": "XGS0PHLA",
                                  "brandedFare": "LIGHT",
                                  "brandedFareLabel": "ECONOMY LIGHT",
                                  "class": "L",
                                  "includedCheckedBags": {
                                      "quantity": 0
                                  },
                                  "amenities": [
                                      {
                                          "description": "CHECKED BAG 1PC OF 23KG 158CM",
                                          "isChargeable": true,
                                          "amenityType": "BAGGAGE",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "SNACK",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "BEVERAGE",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "MEAL",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "CHOICE OF STANDARD SEAT",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "UPGRADE ELIGIBILITY",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      }
                                  ]
                              },
                              {
                                  "segmentId": "7",
                                  "cabin": "ECONOMY",
                                  "fareBasis": "XGS0PHLA",
                                  "brandedFare": "LIGHT",
                                  "brandedFareLabel": "ECONOMY LIGHT",
                                  "class": "X",
                                  "includedCheckedBags": {
                                      "quantity": 0
                                  },
                                  "amenities": [
                                      {
                                          "description": "CHECKED BAG 1PC OF 23KG 158CM",
                                          "isChargeable": true,
                                          "amenityType": "BAGGAGE",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "SNACK",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "BEVERAGE",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "MEAL",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "CHOICE OF STANDARD SEAT",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "UPGRADE ELIGIBILITY",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      }
                                  ]
                              },
                              {
                                  "segmentId": "8",
                                  "cabin": "ECONOMY",
                                  "fareBasis": "XGS0PHLA",
                                  "brandedFare": "LIGHT",
                                  "brandedFareLabel": "ECONOMY LIGHT",
                                  "class": "X",
                                  "includedCheckedBags": {
                                      "quantity": 0
                                  },
                                  "amenities": [
                                      {
                                          "description": "CHECKED BAG 1PC OF 23KG 158CM",
                                          "isChargeable": true,
                                          "amenityType": "BAGGAGE",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "SNACK",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "BEVERAGE",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "MEAL",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "CHOICE OF STANDARD SEAT",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "UPGRADE ELIGIBILITY",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      }
                                  ]
                              }
                          ]
                      }
                  ]
              },
              {
                  "type": "flight-offer",
                  "id": "2",
                  "source": "GDS",
                  "instantTicketingRequired": false,
                  "nonHomogeneous": false,
                  "oneWay": false,
                  "isUpsellOffer": false,
                  "lastTicketingDate": "2024-10-24",
                  "lastTicketingDateTime": "2024-10-24",
                  "numberOfBookableSeats": 1,
                  "itineraries": [
                      {
                          "duration": "PT19H55M",
                          "segments": [
                              {
                                  "departure": {
                                      "iataCode": "BBI",
                                      "terminal": "1",
                                      "at": "2024-10-24T20:30:00"
                                  },
                                  "arrival": {
                                      "iataCode": "DEL",
                                      "terminal": "3",
                                      "at": "2024-10-24T22:55:00"
                                  },
                                  "carrierCode": "UK",
                                  "number": "782",
                                  "aircraft": {
                                      "code": "320"
                                  },
                                  "operating": {
                                      "carrierCode": "UK"
                                  },
                                  "duration": "PT2H25M",
                                  "id": "4",
                                  "numberOfStops": 0,
                                  "blacklistedInEU": false
                              },
                              {
                                  "departure": {
                                      "iataCode": "DEL",
                                      "terminal": "3",
                                      "at": "2024-10-25T03:55:00"
                                  },
                                  "arrival": {
                                      "iataCode": "AMS",
                                      "at": "2024-10-25T09:40:00"
                                  },
                                  "carrierCode": "KL",
                                  "number": "872",
                                  "aircraft": {
                                      "code": "781"
                                  },
                                  "operating": {
                                      "carrierCode": "KL"
                                  },
                                  "duration": "PT9H15M",
                                  "id": "5",
                                  "numberOfStops": 0,
                                  "blacklistedInEU": false
                              },
                              {
                                  "departure": {
                                      "iataCode": "AMS",
                                      "at": "2024-10-25T11:35:00"
                                  },
                                  "arrival": {
                                      "iataCode": "CDG",
                                      "terminal": "2F",
                                      "at": "2024-10-25T12:55:00"
                                  },
                                  "carrierCode": "KL",
                                  "number": "2290",
                                  "aircraft": {
                                      "code": "321"
                                  },
                                  "operating": {
                                      "carrierCode": "AF"
                                  },
                                  "duration": "PT1H20M",
                                  "id": "6",
                                  "numberOfStops": 0,
                                  "blacklistedInEU": false
                              }
                          ]
                      },
                      {
                          "duration": "PT16H5M",
                          "segments": [
                              {
                                  "departure": {
                                      "iataCode": "CDG",
                                      "terminal": "2E",
                                      "at": "2025-01-24T10:35:00"
                                  },
                                  "arrival": {
                                      "iataCode": "DEL",
                                      "terminal": "3",
                                      "at": "2025-01-24T23:45:00"
                                  },
                                  "carrierCode": "AF",
                                  "number": "226",
                                  "aircraft": {
                                      "code": "77W"
                                  },
                                  "operating": {
                                      "carrierCode": "AF"
                                  },
                                  "duration": "PT8H40M",
                                  "id": "7",
                                  "numberOfStops": 0,
                                  "blacklistedInEU": false
                              },
                              {
                                  "departure": {
                                      "iataCode": "DEL",
                                      "terminal": "2",
                                      "at": "2025-01-25T04:55:00"
                                  },
                                  "arrival": {
                                      "iataCode": "BBI",
                                      "terminal": "1",
                                      "at": "2025-01-25T07:10:00"
                                  },
                                  "carrierCode": "AF",
                                  "number": "6079",
                                  "aircraft": {
                                      "code": "32Q"
                                  },
                                  "operating": {
                                      "carrierCode": "6E"
                                  },
                                  "duration": "PT2H15M",
                                  "id": "8",
                                  "numberOfStops": 0,
                                  "blacklistedInEU": false
                              }
                          ]
                      }
                  ],
                  "price": {
                      "currency": "EUR",
                      "total": "671.30",
                      "base": "190.00",
                      "fees": [
                          {
                              "amount": "0.00",
                              "type": "SUPPLIER"
                          },
                          {
                              "amount": "0.00",
                              "type": "TICKETING"
                          }
                      ],
                      "grandTotal": "671.30"
                  },
                  "pricingOptions": {
                      "fareType": [
                          "PUBLISHED"
                      ],
                      "includedCheckedBagsOnly": false
                  },
                  "validatingAirlineCodes": [
                      "AF"
                  ],
                  "travelerPricings": [
                      {
                          "travelerId": "1",
                          "fareOption": "STANDARD",
                          "travelerType": "ADULT",
                          "price": {
                              "currency": "EUR",
                              "total": "671.30",
                              "base": "190.00"
                          },
                          "fareDetailsBySegment": [
                              {
                                  "segmentId": "4",
                                  "cabin": "ECONOMY",
                                  "fareBasis": "XGS0PHLA",
                                  "brandedFare": "LIGHT",
                                  "brandedFareLabel": "ECONOMY LIGHT",
                                  "class": "W",
                                  "includedCheckedBags": {
                                      "quantity": 0
                                  },
                                  "amenities": [
                                      {
                                          "description": "CHECKED BAG 1PC OF 23KG 158CM",
                                          "isChargeable": true,
                                          "amenityType": "BAGGAGE",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "SNACK",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "BEVERAGE",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "MEAL",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "CHOICE OF STANDARD SEAT",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "UPGRADE ELIGIBILITY",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      }
                                  ]
                              },
                              {
                                  "segmentId": "5",
                                  "cabin": "ECONOMY",
                                  "fareBasis": "XGS0PHLA",
                                  "brandedFare": "LIGHT",
                                  "brandedFareLabel": "ECONOMY LIGHT",
                                  "class": "X",
                                  "includedCheckedBags": {
                                      "quantity": 0
                                  },
                                  "amenities": [
                                      {
                                          "description": "CHECKED BAG 1PC OF 23KG 158CM",
                                          "isChargeable": true,
                                          "amenityType": "BAGGAGE",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "SNACK",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "BEVERAGE",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "MEAL",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "CHOICE OF STANDARD SEAT",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "UPGRADE ELIGIBILITY",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      }
                                  ]
                              },
                              {
                                  "segmentId": "6",
                                  "cabin": "ECONOMY",
                                  "fareBasis": "XGS0PHLA",
                                  "brandedFare": "LIGHT",
                                  "brandedFareLabel": "ECONOMY LIGHT",
                                  "class": "L",
                                  "includedCheckedBags": {
                                      "quantity": 0
                                  },
                                  "amenities": [
                                      {
                                          "description": "CHECKED BAG 1PC OF 23KG 158CM",
                                          "isChargeable": true,
                                          "amenityType": "BAGGAGE",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "SNACK",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "BEVERAGE",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "MEAL",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "CHOICE OF STANDARD SEAT",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "UPGRADE ELIGIBILITY",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      }
                                  ]
                              },
                              {
                                  "segmentId": "7",
                                  "cabin": "ECONOMY",
                                  "fareBasis": "XGS0PHLA",
                                  "brandedFare": "LIGHT",
                                  "brandedFareLabel": "ECONOMY LIGHT",
                                  "class": "X",
                                  "includedCheckedBags": {
                                      "quantity": 0
                                  },
                                  "amenities": [
                                      {
                                          "description": "CHECKED BAG 1PC OF 23KG 158CM",
                                          "isChargeable": true,
                                          "amenityType": "BAGGAGE",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "SNACK",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "BEVERAGE",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "MEAL",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "CHOICE OF STANDARD SEAT",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "UPGRADE ELIGIBILITY",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      }
                                  ]
                              },
                              {
                                  "segmentId": "8",
                                  "cabin": "ECONOMY",
                                  "fareBasis": "XGS0PHLA",
                                  "brandedFare": "LIGHT",
                                  "brandedFareLabel": "ECONOMY LIGHT",
                                  "class": "X",
                                  "includedCheckedBags": {
                                      "quantity": 0
                                  },
                                  "amenities": [
                                      {
                                          "description": "CHECKED BAG 1PC OF 23KG 158CM",
                                          "isChargeable": true,
                                          "amenityType": "BAGGAGE",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "SNACK",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "BEVERAGE",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "MEAL",
                                          "isChargeable": false,
                                          "amenityType": "MEAL",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "CHOICE OF STANDARD SEAT",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      },
                                      {
                                          "description": "UPGRADE ELIGIBILITY",
                                          "isChargeable": true,
                                          "amenityType": "BRANDED_FARES",
                                          "amenityProvider": {
                                              "name": "BrandedFare"
                                          }
                                      }
                                  ]
                              }
                          ]
                      }
                  ]
              }
          ],
          "dictionaries": {
              "locations": {
                  "CDG": {
                      "cityCode": "PAR",
                      "countryCode": "FR"
                  },
                  "AMS": {
                      "cityCode": "AMS",
                      "countryCode": "NL"
                  },
                  "BBI": {
                      "cityCode": "BBI",
                      "countryCode": "IN"
                  },
                  "DEL": {
                      "cityCode": "DEL",
                      "countryCode": "IN"
                  }
              },
              "aircraft": {
                  "223": "AIRBUS  A220-300",
                  "320": "AIRBUS A320",
                  "321": "AIRBUS A321",
                  "781": "BOEING 787-10",
                  "32Q": "AIRBUS A321NEO",
                  "77W": "BOEING 777-300ER"
              },
              "currencies": {
                  "EUR": "EURO"
              },
              "carriers": {
                  "KL": "KLM ROYAL DUTCH AIRLINES",
                  "AF": "AIR FRANCE",
                  "UK": "VISTARA",
                  "6E": "INDIGO"
              }
          }
      }
  }

export default flight_offers;

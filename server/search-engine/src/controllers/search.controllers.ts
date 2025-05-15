import Joi from "joi";
import elasticClient from "../service/elasticsearch";

import { Request, Response } from "express";
interface filterType {
  wifi: boolean;
  swimming_pool: boolean;
  fitness_center: boolean;
  spa_and_wellness: boolean;
  restaurant: boolean;
  room_service: boolean;
  bar_and_lounge: boolean;
  parking: boolean;
  concierge_services: boolean;
  pet_friendly: boolean;
  business_facilities: boolean;
  laundry_services: boolean;
  child_friendly_facilities: boolean;
}

interface amanitas extends filterType {
  destination_type: string;
}

export async function search(req: Request, res: Response) {
  const amenitiesSchema = Joi.object({
    wifi: Joi.boolean(),
    swimming_pool: Joi.boolean(),
    fitness_center: Joi.boolean(),
    spa_and_wellness: Joi.boolean(),
    restaurant: Joi.boolean(),
    room_service: Joi.boolean(),
    bar_and_lounge: Joi.boolean(),
    parking: Joi.boolean(),
    concierge_services: Joi.boolean(),
    pet_friendly: Joi.boolean(),
    business_facilities: Joi.boolean(),
    laundry_services: Joi.boolean(),
    child_friendly_facilities: Joi.boolean(),
  });

  const schema = Joi.object({
    location: Joi.string().required(),
    max_occupancy: Joi.number(),
    ratings: Joi.number(),
    property_type: Joi.string(),
    destination_type: Joi.string(),
    aminites: amenitiesSchema,
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    // console.error();
    res.status(422).json(error.details);
  } else {
    // value.capacity
    await getLocation(value.location, value.max_occupancy, value.ratings, value.destination_type, value.property_type, {
      wifi: value?.aminites?.wifi,
      swimming_pool: value?.aminites?.swimming_pool,
      fitness_center: value?.aminites?.fitness_center,
      spa_and_wellness: value?.aminites?.spa_and_wellness,
      restaurant: value?.aminites?.restaurant,
      room_service: value?.aminites?.room_service,
      bar_and_lounge: value?.aminites?.bar_and_lounge,
      parking: value?.aminites?.parking,
      concierge_services: value?.aminites?.concierge_services,
      pet_friendly: value?.aminites?.pet_friendly,
      business_facilities: value?.aminites?.business_facilities,
      laundry_services: value?.aminites?.laundry_services,
      child_friendly_facilities: value?.aminites?.child_friendly_facilities,
    })
      .then((data) => {
        // console.log(data, "test");
        res.status(200).json(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

async function getLocation(
  address: string = "",
  max_occupancy: number = 1,
  ratings: number = 0,
  property_type: string = "",
  destination_type: string = "",
  filter: filterType
) {
  const client = elasticClient();

  try {
    const should: any[] = [];
    switch (true) {
      case filter?.wifi:
        should.push({
          term: { "propertyId.property_aminite.wifi": filter.wifi },
        });
        break;
      case filter?.swimming_pool:
        should.push({
          term: {
            "propertyId.property_aminite.swimming_pool": filter.swimming_pool,
          },
        });
        break;
      case filter?.fitness_center:
        should.push({
          term: {
            "propertyId.property_aminite.fitness_center": filter.fitness_center,
          },
        });
        break;
      case filter?.spa_and_wellness:
        should.push({
          term: {
            "propertyId.property_aminite.spa_and_wellness":
              filter.spa_and_wellness,
          },
        });
        break;
      case filter?.restaurant:
        should.push({
          term: {
            "propertyId.property_aminite.restaurant": filter.restaurant,
          },
        });
        break;
      case filter?.room_service:
        should.push({
          term: {
            "propertyId.property_aminite.room_service": filter.room_service,
          },
        });
        break;
      case filter?.bar_and_lounge:
        should.push({
          term: {
            "propertyId.property_aminite.bar_and_lounge": filter.bar_and_lounge,
          },
        });
        break;
      case filter?.parking:
        should.push({
          term: { "propertyId.property_aminite.parking": filter.parking },
        });
        break;
      case filter?.concierge_services:
        should.push({
          term: {
            "propertyId.property_aminite.concierge_services":
              filter.concierge_services,
          },
        });
        break;
      case filter?.pet_friendly:
        should.push({
          term: {
            "propertyId.property_aminite.pet_friendly": filter.pet_friendly,
          },
        });
        break;
      case filter?.business_facilities:
        should.push({
          term: {
            "propertyId.property_aminite.business_facilities":
              filter.business_facilities,
          },
        });
        break;
      case filter?.laundry_services:
        should.push({
          term: {
            "propertyId.property_aminite.laundry_services":
              filter.laundry_services,
          },
        });
        break;
      case filter?.child_friendly_facilities:
        should.push({
          term: {
            "propertyId.property_aminite.child_friendly_facilities":
              filter.child_friendly_facilities,
          },
        });
        break;
      default:
        break;
    }

    // console.log("Search", max_occupancy, ratings)
    const body = await client.search({
      index: "property_data",
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: address,
                  fields: ["property_address.area", "property_address.state", "property_address.city", "property_address.address_line_1", "property_address.address_line_2"],
                },
              },
            ],
            filter: [],
            should,
          },
        },
      },
    });
    


    // console.log("Search response: ", body.hits.hits)
    const response: any = [];
    body?.hits?.hits.map((element: any) => {
      const id = element._id;
      response.push({
        _id: id,
        ...element._source
      })
    })
    return response;
    //return body.hits.hits;
  } catch (error) {
    console.error(error);
    // console.log(error);
    return null;
  }
}

export async function searchAmenities(req: Request, res: Response) {
  const schema = Joi.object({
    wifi: Joi.boolean(),
    swimming_pool: Joi.boolean(),
    fitness_center: Joi.boolean(),
    spa_and_wellness: Joi.boolean(),
    destination_type: Joi.string(),
    restaurant: Joi.boolean(),
    room_service: Joi.boolean(),
    bar_and_lounge: Joi.boolean(),
    parking: Joi.boolean(),
    concierge_services: Joi.boolean(),
    pet_friendly: Joi.boolean(),
    business_facilities: Joi.boolean(),
    laundry_services: Joi.boolean(),
    child_friendly_facilities: Joi.boolean(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    // console.error();
    res.status(422).json(error.details);
  } else {
    await getAmenities({
      wifi: value?.wifi,
      swimming_pool: value?.swimming_pool,
      fitness_center: value?.fitness_center,
      spa_and_wellness: value?.spa_and_wellness,
      restaurant: value?.restaurant,
      room_service: value?.room_service,
      bar_and_lounge: value?.bar_and_lounge,
      parking: value?.parking,
      concierge_services: value?.concierge_services,
      pet_friendly: value?.pet_friendly,
      business_facilities: value?.business_facilities,
      laundry_services: value?.laundry_services,
      child_friendly_facilities: value?.child_friendly_facilities,
      destination_type: value?.destination_type,
    })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

async function getAmenities(filter: amanitas) {
  const client = elasticClient();

  try {
    const should: any[] = [];
    switch (true) {
      case filter?.wifi:
        should.push({
          term: { "propertyId.property_aminite.wifi": filter.wifi },
        });
        break;
      case filter?.swimming_pool:
        should.push({
          term: {
            "propertyId.property_aminite.swimming_pool": filter.swimming_pool,
          },
        });
        break;
      case filter?.fitness_center:
        should.push({
          term: {
            "propertyId.property_aminite.fitness_center": filter.fitness_center,
          },
        });
        break;
      case filter?.spa_and_wellness:
        should.push({
          term: {
            "propertyId.property_aminite.spa_and_wellness":
              filter.spa_and_wellness,
          },
        });
        break;
      case filter?.restaurant:
        should.push({
          term: {
            "propertyId.property_aminite.restaurant": filter.restaurant,
          },
        });
        break;
      case filter?.room_service:
        should.push({
          term: {
            "propertyId.property_aminite.room_service": filter.room_service,
          },
        });
        break;
      case filter?.bar_and_lounge:
        should.push({
          term: {
            "propertyId.property_aminite.bar_and_lounge": filter.bar_and_lounge,
          },
        });
        break;
      case filter?.parking:
        should.push({
          term: { "propertyId.property_aminite.parking": filter.parking },
        });
        break;
      case filter?.concierge_services:
        should.push({
          term: {
            "propertyId.property_aminite.concierge_services":
              filter.concierge_services,
          },
        });
        break;
      case filter?.pet_friendly:
        should.push({
          term: {
            "propertyId.property_aminite.pet_friendly": filter.pet_friendly,
          },
        });
        break;
      case filter?.business_facilities:
        should.push({
          term: {
            "propertyId.property_aminite.business_facilities":
              filter.business_facilities,
          },
        });
        break;
      case filter?.laundry_services:
        should.push({
          term: {
            "propertyId.property_aminite.laundry_services":
              filter.laundry_services,
          },
        });
        break;
      case filter?.child_friendly_facilities:
        should.push({
          term: {
            "propertyId.property_aminite.child_friendly_facilities":
              filter.child_friendly_facilities,
          },
        });
        break;
      default:
        break;
    }

    if(filter?.destination_type){
      should.push({
        match: {
          "propertyId.property_aminite.destination_type":
            filter.destination_type,
        },
      });
    }

    const body = await client.search({
      index: "property_data",
      body: {
        query: {
          bool: {
            must: should,
            filter: [],
            should:[],
          },
        },
      },
    });

    return body.hits.hits;
  } catch (error) {
    console.error(error);
    return null;
  }
}
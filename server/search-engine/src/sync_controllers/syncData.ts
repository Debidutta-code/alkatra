import { PropertyInfo } from "../../../Property_Management/src/model/property.info.model";
import elasticClient from "../service/elasticsearch";

export async function createPropertyIndexAndDoc() {
  const properties = await PropertyInfo.find()
    .populate({ path: "property_category" })
    .populate({ path: "property_type" })
    .populate({ path: "property_address" })
    .populate({ path: "property_amenities" })
    .populate({ path: "room_Aminity" })
    .populate({ path: "property_room" })
    .populate({ path: "rate_plan" })
    .lean();

  if (!properties || properties.length === 0) {
    console.log("No properties found to index.");
    return;
  }

  // console.log("Location -------------> \n", location, "\n")

  const client = elasticClient();

  try {
    const bulkOperations = [];

    for (const property of properties) {
      const { _id, ...rest } = property;
      const restData: any & { property_room?: Array<any> | string } = rest;

      bulkOperations.push(
        { index: { _index: 'property_data', _id: _id } },
        restData
      );
    }

    if (bulkOperations.length > 0) {
      const result = await client.bulk({ body: bulkOperations });

      // Check for errors in the bulk response
      if (result.errors) {
        const erroredDocuments = result.items.filter(item => item.index && item.index.error);
        console.error("Some documents failed to index:", erroredDocuments);
      }
      else {
        console.log(`Successfully indexed ${properties.length} properties.`);
      }
    }
    else {
      console.log("No bulk operations were prepared.");
    }

    console.log("Data ingest successfully... %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", bulkOperations.length)
  }
  catch (error) {
    console.log("Error while indexing Property to elasticsearch", error);
  }
}
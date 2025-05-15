import { Request, Response } from "express";
import { Region } from "../model/region.model";
import mongoose from "mongoose";
import { PropertyAddress } from "../model/property.address.model";
import { PropertyInfo } from "../model/property.info.model";


// New Region Create section
export const createNewRegion = async (req: Request, res: Response) => {
    try {
        const { region_name, region_code, countries } = req.body;

        if (!region_name || !region_code) {
            return res.status(400).json({ message: "Region name and code are required" });
        }

        let region = await Region.findOne({ region_code });

        if (!region) {
            region = new Region({
                _id: new mongoose.Types.ObjectId(),
                region_name,
                region_code,
                countries: countries.map((country: { states: any[] }) => ({
                    _id: new mongoose.Types.ObjectId(),
                    ...country,
                    states: country.states.map(state => ({
                        _id: new mongoose.Types.ObjectId(),
                        ...state,
                        state_cities_list: state.state_cities_list.map((city: any) => ({
                            _id: new mongoose.Types.ObjectId(),
                            city_name: city
                        }))
                    }))
                }))
            });

            await region.save();
            return res.status(201).json({ message: "Region created successfully", region });
        }

        for (const newCountry of countries) {
            let existingCountry = region.countries.find(c => c.country_code === newCountry.country_code);

            if (!existingCountry) {
                region.countries.push({
                    _id: new mongoose.Types.ObjectId(),
                    ...newCountry,
                    states: newCountry.states.map((state: { state_cities_list: any[] }) => ({
                        _id: new mongoose.Types.ObjectId(),
                        ...state,
                        state_cities_list: state.state_cities_list.map((city: any) => ({
                            _id: new mongoose.Types.ObjectId(),
                            city_name: city
                        }))
                    }))
                });
            } else {
                for (const newState of newCountry.states) {
                    let existingState = existingCountry.states.find(s => s.state_code === newState.state_code);

                    if (!existingState) {
                        existingCountry.states.push({
                            _id: new mongoose.Types.ObjectId(),
                            ...newState,
                            state_cities_list: newState.state_cities_list.map((city: any) => ({
                                _id: new mongoose.Types.ObjectId(),
                                city_name: city
                            }))
                        });
                    } else {
                        for (const city of newState.state_cities_list) {
                            if (!existingState.state_cities_list.some(c => c.city_name === city)) {
                                existingState.state_cities_list.push({
                                    _id: new mongoose.Types.ObjectId(),
                                    city_name: city
                                });
                            }
                        }
                    }
                }
            }
        }

        await region.save();
        return res.status(200).json({ message: "Region updated successfully", region });
    } catch (error) {
        return res.status(500).json({ message: "Error processing request", error });
    }
};

// Get Region, country, states, cities by name or ID
export const getAnyDetailsAccordingToID = async (req: Request, res: Response) => {
    try {
        const { objectID } = req.params;

        if (!objectID) {
            return res.status(400).json({
                message: "Object ID is required.",
                error: "Missing required fields"
            });
        }

        const region = await Region.findById(objectID);
        if (region) {
            return res.status(200).json({ type: "Region", data: region });
        }

        const regionWithCountry = await Region.findOne({ "countries._id": objectID });
        if (regionWithCountry) {
            const country = regionWithCountry.countries.find(c => c._id.toString() === objectID);
            return res.status(200).json({ type: "Country", data: country });
        }

        const regionWithState = await Region.findOne({ "countries.states._id": objectID });
        if (regionWithState) {
            const country = regionWithState.countries.find(c => c.states.some(s => s._id.toString() === objectID));
            const state = country?.states.find(s => s._id.toString() === objectID);
            return res.status(200).json({ type: "State", data: state });
        }

        const regionWithCity = await Region.findOne({ "countries.states.state_cities_list._id": objectID });
        if (regionWithCity) {
            const country = regionWithCity.countries.find(c => 
                c.states.some(s => s.state_cities_list.some(city => city._id.toString() === objectID))
            );
            const state = country?.states.find(s => 
                s.state_cities_list.some(city => city._id.toString() === objectID)
            );
            const city = state?.state_cities_list.find(city => city._id.toString() === objectID);
            return res.status(200).json({ type: "City", data: city });
        }

        return res.status(404).json({ message: "No matching object found for the given ID." });

    } catch (error) {
        return res.status(500).json({ message: "Error processing request", error });
    }
};

export const getAllRegion = async (req: Request, res: Response) => {
    try {
        const allRegions = await Region.find();
        const totalRegion = allRegions.length;

        return res.status(200).json({ totalRegion, allRegions });
    }
    catch (error) {
        return res.status(500).json({ message: "Error processing request", error });
    }
};


export const getCountryDetailsAccordingToRegion = async (req: Request, res: Response) => {
    try {
        const { regionName, countryName } = req.params;
        if (!regionName || !countryName) {
            return res.status(400).json({
                message: "Region_name and Country_name are required.",
                error: "Missing required fields"
            });
        }

        const existRegion = await Region.findOne({ region_name: regionName });
        if (!existRegion) {
            return res.status(404).json({
                message: `Region '${regionName}' not found.`
            });
        }
        const existingCountry = existRegion.countries.find(country => country.country_name === countryName);
        if (!existingCountry) {
            return res.status(404).json({
                message: `Country '${countryName}' not found in region '${regionName}'.`
            });
        }
        return res.status(200).json({ country: existingCountry });
    }
    catch (error) {
        return res.status(500).json({ message: "Error processing request", error });
    }
};

export const getStateDetailsAccordingToCountry = async (req: Request, res: Response) => {
    try {
        const { regionName, countryName, stateName } = req.params;
        if (!regionName || !countryName || !stateName) {
            return res.status(400).json({
                message: "Region_name, Country_name and State_name are required.",
                error: "Missing required fields"
            });
        }

        const existRegion = await Region.findOne({ region_name: regionName });
        if (!existRegion) {
            return res.status(404).json({
                message: `Region '${regionName}' not found.`
            });
        }

        const existingCountry = existRegion.countries.find(country => country.country_name === countryName);
        if (!existingCountry) {
            return res.status(404).json({
                message: `Country '${countryName}' not found in region '${regionName}'.`
            });
        }

        const existingState = existingCountry.states.find(state => state.state_name === stateName);
        if (!existingState) {
            return res.status(404).json({
                message: `Country '${stateName}' not found in region '${countryName}'.`
            });
        }
        return res.status(200).json({ state: existingState });
    }
    catch (error) {
        return res.status(500).json({ message: "Error processing request", error });
    }
};

export const getCityDetailsAccordingToState = async (req: Request, res: Response) => {
    try {
        const { regionName, countryName, stateName, cityName } = req.params;
        if (!regionName || !countryName || !stateName || !cityName) {
            return res.status(400).json({
                message: "Region_name, Country_name, State_name and City_name are required.",
                error: "Missing required fields"
            });
        }

        const existRegion = await Region.findOne({ region_name: regionName });
        if (!existRegion) {
            return res.status(404).json({
                message: `Region '${regionName}' not found.`
            });
        }

        const existingCountry = existRegion.countries.find(country => country.country_name === countryName);
        if (!existingCountry) {
            return res.status(404).json({
                message: `Country '${countryName}' not found in region '${regionName}'.`
            });
        }

        const existingState = existingCountry.states.find(state => state.state_name === stateName);
        if (!existingState) {
            return res.status(404).json({
                message: `Country '${stateName}' not found in region '${countryName}'.`
            });
        }

        const existingCity = existingState.state_cities_list.find(city => city.city_name === cityName);
        if (!existingCity) {
            return res.status(404).json({
                message: `City '${cityName}' not found in state '${stateName}'.`
            });
        }

        return res.status(200).json({ city: existingCity });
    }
    catch (error) {
        return res.status(500).json({ message: "Error processing request", error });
    }
};


export const getLocationDetails = async (req: Request, res: Response) => {
    try {
        const { regionName, countryName, stateName, cityName } = req.params;

        const existRegion = await Region.findOne({ region_name: regionName });
        if (!existRegion) {
            return res.status(404).json({
                message: `Region '${regionName}' not found.`,
            });
        }

        if (!countryName) {
            return res.status(200).json({ region: existRegion });
        }

        const existingCountry = existRegion.countries.find(country => country.country_name === countryName);
        if (!existingCountry) {
            return res.status(404).json({
                message: `Country '${countryName}' not found in region '${regionName}'.`,
            });
        }

        if (!stateName) {
            return res.status(200).json({ country: existingCountry });
        }

        const existingState = existingCountry.states.find(state => state.state_name === stateName);
        if (!existingState) {
            return res.status(404).json({
                message: `State '${stateName}' not found in country '${countryName}'.`,
            });
        }

        if (!cityName) {
            return res.status(200).json({ state: existingState });
        }

        const existingCity = existingState.state_cities_list.find(city => city.city_name === cityName);
        if (!existingCity) {
            return res.status(404).json({
                message: `City '${cityName}' not found in state '${stateName}'.`,
            });
        }

        return res.status(200).json({ city: existingCity });

    } catch (error) {
        return res.status(500).json({ message: "Error processing request", error });
    }
};

// Get hotel details according to location
export const getHotelDetails = async (req: Request, res: Response) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ message: "Please provide a location" });
        }

        const matchingRegion = await Region.findOne({
            $or: [
                { region_name: location },
                { "countries.country_name": location },
                { "countries.country_code": location },
                { "countries.states.state_name": location },
                { "countries.states.state_code": location },
                { "countries.states.state_cities_list.city_name": location },
            ],
        });

        let searchCriteria: any = [
            { country: location },
            { state: location },
            { city: location },
        ];

        if (matchingRegion) {
            const foundCountry = matchingRegion.countries.find(c => c.country_name === location || c.country_code === location);
            if (foundCountry) {
                searchCriteria.push({ country: foundCountry.country_code }, { country: foundCountry.country_name });

                const foundState = foundCountry.states.find(s => s.state_name === location || s.state_code === location);
                if (foundState) {
                    searchCriteria.push({ state: foundState.state_code }, { state: foundState.state_name });

                    const foundCity = foundState.state_cities_list.find(c => c.city_name === location);
                    if (foundCity) {
                        searchCriteria.push({ city: foundCity.city_name });
                    }
                }
            }
        }

        const matchedAddresses = await PropertyAddress.find({
            $or: searchCriteria,
        });

        if (matchedAddresses.length === 0) {
            return res.status(404).json({ message: "No hotels found for this location" });
        }

        const propertyIds = matchedAddresses.map(addr => addr.property_id);

        const hotels = await PropertyInfo.find({ _id: { $in: propertyIds } });

        return res.status(200).json({ hotels });

    } catch (error) {
        return res.status(500).json({ message: "Error processing request", error });
    }
};



// Update Region, country, state, cities by ID only
export const updateLocationById = async (req: Request, res: Response) => {
    try {
        const { regionId, countryId, stateId, cityId, updateData } = req.body;

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Update data is required." });
        }

        if (regionId) {
            const updatedRegion = await Region.findByIdAndUpdate(regionId, updateData, { new: true });
            if (!updatedRegion) return res.status(404).json({ message: "Region not found." });
            return res.status(200).json({ message: "Region updated successfully.", updatedRegion });
        }

        if (countryId) {
            const region = await Region.findOne({ "countries._id": countryId });
            if (!region) return res.status(404).json({ message: "Country not found." });

            const country = region.countries.find(c => c._id.toString() === countryId);
            if (!country) return res.status(404).json({ message: "Country not found." });

            Object.assign(country, updateData);
            await region.save();

            return res.status(200).json({ message: "Country updated successfully.", updatedCountry: country });
        }

        if (stateId) {
            const region = await Region.findOne({ "countries.states._id": stateId });
            if (!region) return res.status(404).json({ message: "State not found." });

            const state = region.countries.flatMap(c => c.states).find(s => s._id.toString() === stateId);
            if (!state) return res.status(404).json({ message: "State not found." });

            Object.assign(state, updateData);
            await region.save();

            return res.status(200).json({ message: "State updated successfully.", updatedState: state });
        }

        if (cityId) {
            const region = await Region.findOne({ "countries.states.state_cities_list._id": cityId });
            if (!region) return res.status(404).json({ message: "City not found." });

            const city = region.countries.flatMap(c => c.states).flatMap(s => s.state_cities_list).find(ct => ct._id.toString() === cityId);
            if (!city) return res.status(404).json({ message: "City not found." });

            Object.assign(city, updateData);
            await region.save();

            return res.status(200).json({ message: "City updated successfully.", updatedCity: city });
        }

        return res.status(400).json({ message: "Invalid ID provided." });
    } 
    catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(500).json({ message: "Internal server error.", error: error.message });
        }
        return res.status(500).json({ message: "Internal server error." });
    }
};



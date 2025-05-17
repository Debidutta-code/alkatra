import { Request, Response } from "express";
import { Brand } from "../model/brand.model";

export const createNewBrand = async (req: Request, res: Response) => {
    try {
        const { brand_name, brand_description, brand_logo } = req.body;
        const existingBrand = await Brand.findOne({ brand_name });
        if (existingBrand) {
            return res.status(400).json({ message: "Brand already exists" });
        }

        const newBrand = new Brand({
            brand_name,
            brand_description,
            //   brand_logo,
        });
        const savedBrand = await newBrand.save();
        return res.status(201).json({ message: "Brand created", brand: savedBrand });
    } catch (error) {
        return res.status(500).json({ message: "Error creating brand", error });
    }
};

export const updateExistingBrand = async (req: Request, res: Response) => {
    try {
        const { _id, brand_name, brand_description } = req.body;

        if (!_id) {
            return res.status(400).json({ message: "Brand ID is required for update" });
        }

        const existingBrand = await Brand.findById(_id);

        if (!existingBrand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        if (brand_name) {
            existingBrand.brand_name = brand_name.toUpperCase();
        }

        if (brand_description) {
            existingBrand.brand_description = brand_description;
        }

        await existingBrand.save();
        return res.status(200).json({ message: "Brand updated", brand: existingBrand });

    } catch (error) {
        return res.status(500).json({ message: "Error updating brand", error });
    }
};


// export const deleteExistingBrandByID = async (req: Request, res: Response) => {
//     try {
//         const { _id } = req.params;

//         if (!_id) {
//             return res.status(400).json({ message: "Brand ID is required for deletion" });
//         }

//         const existingBrand = await Brand.findById(_id);

//         if (!existingBrand) {
//             return res.status(404).json({ message: "Brand not found" });
//         }

//         await Brand.findByIdAndDelete(_id);
//         return res.status(200).json({ message: "Brand deleted successfully" });

//     } catch (error) {
//         return res.status(500).json({ message: "Error deleting brand", error });
//     }
// };

export const getBrandDetailsByID = async (req: Request, res: Response) => {
    try {
        const { _id } = req.params;

        if (!_id) {
            return res.status(400).json({ message: "Brand ID is required" });
        }

        const brand = await Brand.findById(_id);

        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        return res.status(200).json({ message: "Brand details", brand });

    } catch (error) {
        return res.status(500).json({ message: "Error retrieving brand details", error });
    }
};

export const getAllBrand = async (req: Request, res: Response) => {
    try {
        const brand = await Brand.find();
        const totalNumberOfBrands = await Brand.countDocuments();

        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        return res.status(200).json({ message: "Brand details", brand, totalNumberOfBrands });

    } catch (error) {
        return res.status(500).json({ message: "Error retrieving brand details", error });
    }
};

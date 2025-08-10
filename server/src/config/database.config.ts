import mongoose from "mongoose";
import { IDatabase } from "../interfaces";
import { config } from "./env.variable";

const { mongoURI } = config.database;

class MongoDB implements IDatabase {

    // connect to database
    async connect() {
        try {
            await mongoose.connect(mongoURI);
            console.log(`🏡 Database successfully running on ${mongoURI}`);
        }
        catch (error) {
            console.log(`Database connection error: ${error}`);
            process.exit(1);
        }
    }

    // disconnect to database
    async disconnect() {
        try {
            await mongoose.disconnect();
            console.log(`🏡 Database successfully disconnected`);
        } catch (error) { 
            console.log(`Database disconnection error: ${error}`);
            process.exit(1);
        }
    }

}

export const mongoClient = new MongoDB();
import express from "express";
import cors from "cors"
import morgan from "morgan";
import { config } from "./config";

const {
    expressJsonLimit,
    expressUrlencodedLimit,
    expressStaticFolderPath,
    expressUrlencodedExtended,
    morganMode
} = config.server;

const {
    origins,
    methods,
    allowedHeaders,
    credentials
} = config.server.cors;

export const app = express();

app.use(cors({
    origin: origins,
    methods: methods,
    allowedHeaders: allowedHeaders,
    credentials: credentials
}));
app.use(express.json({ limit: expressJsonLimit }));
app.use(express.urlencoded({ extended: expressUrlencodedExtended, limit: expressUrlencodedLimit }));
app.use(express.static(expressStaticFolderPath));
app.use(morgan(morganMode));

import "reflect-metadata";
import "express-async-errors";
import * as process from "process";
import {bootGenerateApi, bootSequence} from "./services/boot-sequence";

bootGenerateApi().then(()=>process.exit())
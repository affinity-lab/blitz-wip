import * as schema from "./schema";
import {db} from "../services/async-storage/db";
import AttachmentHandler from "../lib/attachment/attachment-handler";

export const attachmentHandler = new AttachmentHandler(schema.attachment, db, "");

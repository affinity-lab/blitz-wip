import {Client} from "../lib/client/client.js";

export const clients = {
    mobile: new Client("mobile", "000-111-222-333-444-555-666-777-888", "SECRET"),
    admin: new Client("admin", "000-111-222-333-444-555-666-777-888", "SECRET"),
    web: new Client("web", "000-111-222-333-444-555-666-777-888", "SECRET")
};

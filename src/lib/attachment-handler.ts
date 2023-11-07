import MySqlRepository from "./drizzle-repository/my-sql-repository";
import {SchemaType} from "../app/schema-type";
import * as schema from "../app/schema";
import {like, sql} from "drizzle-orm";

class File{}



export default class Collection {
    purge() {
    }
    add(file:File, name:string){
    }
    remove(filename:string){

    }
    replace(file:any){

    }
}


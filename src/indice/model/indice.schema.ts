import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Empresa } from "src/empresa/model/empresa.schema";
@Schema()
export class Indices {
 
    @Prop({ required: true })
    code: string;

    @Prop({ required: true })
    name: string;


}
export const IndicesSchema = SchemaFactory.createForClass(Indices);
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Empresa } from "src/empresa/model/empresa.schema";
@Schema()
export class IndicesCotizacion {
 
    @Prop({ required: true })
    code: string;
    
    @Prop({ required: true })
    fecha: string;

    @Prop({ required: true })
    hora: string;

    @Prop({ required: true })
    fechaDate: string;

    @Prop({ required: true })
   valor: number;


}
export const IndicesCotizacionSchema = SchemaFactory.createForClass(IndicesCotizacion);
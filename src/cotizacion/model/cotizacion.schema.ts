import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Empresa } from "src/empresa/model/empresa.schema";
@Schema()
export class Cotizacion {
    @Prop({ required: true, unique: true })
    id: number;

    @Prop({ required: true })
    fecha: string;

    @Prop({ required: true })
    hora: string;

    @Prop({ required: true})
    dateUTC: string;

    @Prop({ required: true, type: Number })
    cotizacion: number;

    @Prop({ required: true, type: Types.ObjectId, ref : "Empresa" })
    empresa: Empresa;

  

}
export const CotizacionSchema = SchemaFactory.createForClass(Cotizacion);
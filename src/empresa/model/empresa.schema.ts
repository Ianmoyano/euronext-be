import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
@Schema()
export class Empresa {
    @Prop({ required: true, unique: true })
    id: number;

    @Prop({ required: true })
    empresa: string;

    @Prop({ required: true })
    codigoempresa: string;

    @Prop({ required: true, type: Number })
    cotizacion: number;

    @Prop({ required: true, type: Number })
    cantidadAcciones: number;
  
}
export const EmpresaSchema = SchemaFactory.createForClass(Empresa);
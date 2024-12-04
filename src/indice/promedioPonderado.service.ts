import { Body, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cotizacion } from 'src/cotizacion/model/cotizacion.schema';
import { IndicesCotizacion } from './model/indiceCotizaciones.schema';
import clienteAxios from 'src/axios/axios';

@Injectable()
export class PromedioPonderadoService {
  constructor(
    @InjectModel(Cotizacion.name) private cotizacionModel: Model<Cotizacion>,
    @InjectModel(IndicesCotizacion.name) private indicesCotizacionModel: Model<IndicesCotizacion>,
  ) {}

  async verCotizaciones(): Promise<Cotizacion[]> {
    return await this.cotizacionModel.find().exec();
  }

  async verIndiceCotizaciones(): Promise<IndicesCotizacion[]> {
    return await this.indicesCotizacionModel.find().exec();
  }

  async verIndiceCotizacionesPAR(code: string): Promise<IndicesCotizacion[]> {
    const codigo = code ? {code} : {};
    return await this.indicesCotizacionModel.find(codigo).exec();
  }

  async calcularPromedioPorHora(cotizaciones: Cotizacion[]): Promise<IndicesCotizacion[]> {
    const resultados: IndicesCotizacion[] = [];
  
    const agrupado = cotizaciones.reduce((acumulador, cotizacion) => {
      const clave = `${cotizacion.fecha}_${cotizacion.hora}`;
      if (!acumulador[clave]) {
        acumulador[clave] = [];
      }
      acumulador[clave].push(cotizacion);
      return acumulador;
    }, {});
  
    for (const clave in agrupado) {
      const [fecha, hora] = clave.split('_');
      const cotizacionesHora = agrupado[clave];
  
      const sumaValores = cotizacionesHora.reduce((suma, c) => suma + c.cotizacion, 0);
      const promedio = sumaValores / cotizacionesHora.length;
  
      const fechaHoraUTC = `${fecha}T${hora}:00.000Z`;
      const fechaObj = new Date(fechaHoraUTC);
  
      fechaObj.setHours(fechaObj.getHours() + 1);
  
      const fechaDateUTC1 = fechaObj.toISOString();
  
      const indiceCotizacion = new this.indicesCotizacionModel({
        code: 'PAR',
        fecha,
        hora,
        fechaDate: fechaDateUTC1,
        valor: promedio,
      });
  
      await indiceCotizacion.save();
      resultados.push(indiceCotizacion);
    }
  
    return resultados;
  }

  async postIndiceCotizacion(body: any): Promise<void> {
    try {
      await clienteAxios.post('/indices/cotizaciones', body);
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      throw new Error('No se pudo completar la solicitud al API externo.');
    }
  }

  async postCotizacionesUnaPorUna(): Promise<any> {
    const cotizacionesPAR = await this.verIndiceCotizaciones(); // Obtener las cotizaciones
    for (const cotizacion of cotizacionesPAR) {
      const bodyCotizacion = {fecha: cotizacion.fecha,
        hora: cotizacion.hora,
        codigoIndice: cotizacion.code,
        valorIndice: cotizacion.valor,
      }
      await this.postIndiceCotizacion(bodyCotizacion);
    }
  }

    


}






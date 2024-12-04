import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosResponse } from 'axios';
import { Model } from 'mongoose';
import clienteAxios from 'src/axios/axios';
import { Empresa } from 'src/empresa/model/empresa.schema';
import { Indices } from './model/indice.schema';
import { IndicesCotizacion } from './model/indiceCotizaciones.schema';

@Injectable()
export class IndiceService {
  constructor(
    @InjectModel(Indices.name) private indiceModel: Model<Indices>, // Modelo de Índice
    @InjectModel(Empresa.name) private empresaModel: Model<Empresa>, // Modelo de Empresa
    @InjectModel(IndicesCotizacion.name) private CotizacionIndiceModel: Model<IndicesCotizacion>, // Modelo de Empresa
  ) {}

  async obtenerIndice(): Promise<any> {
    try {
      const respuesta: AxiosResponse<any> = await clienteAxios.get(`/indices`);
      console.log( respuesta.data); // Verifica la estructura
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener los índices desde la API externa:', error);
      throw new HttpException(
        'Error al conectar con el servicio externo',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    
    }

  }
  

  async guardarIndicesEnMongo(indices: any[]): Promise<any> {
    const indicesGuardados = [];

    for (const indice of indices) {
      try {
        console.log('Guardando índice:', indice);

        // Aquí podrías agregar lógica adicional si necesitas hacer algo con la información de la empresa

        // Crear un nuevo documento de índice y guardarlo en MongoDB
        const nuevoIndice = new this.indiceModel(indice);
        const indiceGuardado = await nuevoIndice.save();
        indicesGuardados.push(indiceGuardado);
      } catch (error) {
        console.error('Error al guardar el índice:', error);
      }
    }

    console.log('Índices guardados:', indicesGuardados);
    return indicesGuardados;  // Devuelve los índices guardados
  }

  
  async obtenerIndicesCotizacionesPorCodigo(codigoIndice: string, fechaDesde: string, fechaHasta: string): Promise<any> {
    try {
      const respuesta = await clienteAxios.get(`/indices/${codigoIndice}/cotizaciones`, {
        params: { fechaDesde, fechaHasta },
      });
      console.log('Respuesta de la API:', respuesta.data);
      return respuesta.data;
    } catch (error) {
      console.error('Error al llamar a la API:', error.response?.data || error.message);
      throw new HttpException('Error al obtener los índices desde la API', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  


  
  
  
  async guardarIndicesCotizacionesEnMongo(respuesta: any[]): Promise<any> {
    const indicesGuardados = [];
console.log (respuesta)
    
        for (const cotizacion of respuesta) {
         

          const nuevoIndice = new this.CotizacionIndiceModel({
            code: cotizacion.code, // Código del índice
            fecha: cotizacion.fecha, // Fecha de la cotización
            hora: cotizacion.hora, // Hora de la cotización
            fechaDate: cotizacion.fechaDate, // Fecha en formato Date
            valor: cotizacion.valor, // Valor de la cotización
          });

          // Guarda la cotización como un índice en MongoDB
          const indiceGuardado = await nuevoIndice.save();
          indicesGuardados.push(indiceGuardado);
          console.log('Índice guardado:', indiceGuardado);
        }
      return indicesGuardados
      } 
    
      async crearIndicePropio(body): Promise<void> {
        try {
          await clienteAxios.post("/indices", body);
        } catch (error) {
          console.error("Error al crear el índice:", error)
        }
      }
    
    }





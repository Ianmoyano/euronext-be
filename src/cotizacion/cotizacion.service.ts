import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosResponse } from 'axios';
import { Model } from 'mongoose';
import clienteAxios from 'src/axios/axios';
import { Empresa } from 'src/empresa/model/empresa.schema';
import { Cotizacion } from 'src/cotizacion/model/cotizacion.schema';  // Importamos el modelo de Cotización


@Injectable()
export class CotizacionService {
  private readonly logger = new Logger();
  guardarIndicesEnMongo(codigoempresa: string, cotizaciones: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Cotizacion.name) private cotizacionModel: Model<Cotizacion>, // Inyectamos el modelo de Cotización
    @InjectModel(Empresa.name) private empresaModel: Model<Empresa>, // Inyectamos el modelo de Empresa
  ) {}

  async obtenerCotizacionesPorCodigo(codigoempresa: string, fechaDesde: string, fechaHasta: string): Promise<any[]> {
    try {
      const respuesta: AxiosResponse<any> = await clienteAxios.get(`/empresas/${codigoempresa}/cotizaciones`, {
        params: { fechaDesde, fechaHasta },
      });
      return respuesta.data;
    } catch (error) {
      if (error.response?.status === 404) {
        this.logger.warn(`No se encontraron cotizaciones para la empresa ${codigoempresa} entre ${fechaDesde} y ${fechaHasta}.`);
        return []; // Devuelve un array vacío si no hay cotizaciones
      }
      this.logger.error(`Error al obtener cotizaciones para ${codigoempresa}: ${error.message}`);
      throw error; // Lanza el error para otros códigos de estado
    }
  }

  async verCotizaciones(): Promise<Cotizacion[]> {
    return await this.cotizacionModel.find().exec();
  }

  
  
  async filtrarCotizacionesNuevas(codigoempresa: string, cotizaciones: any[]): Promise<any[]> {
    const cotizacionesNuevas = [];

    // Obtener las cotizaciones existentes de la base de datos para esa empresa
    const cotizacionesExistentes = await this.cotizacionModel
      .find({ empresa: codigoempresa })
      .select('id') // Solo necesitamos los ids para comparar
      .exec();

    // Crear un set de los ids existentes para una comparación más rápida
    const idsExistentes = new Set(cotizacionesExistentes.map(cot => cot.id));

    // Filtrar las cotizaciones que no están en la base de datos
    for (const cotizacion of cotizaciones) {
      if (!idsExistentes.has(cotizacion.id)) {
        cotizacionesNuevas.push(cotizacion);
      }
    }

    return cotizacionesNuevas; // Retorna las cotizaciones que no existen en la base de datos
  }
 
 
  async guardarCotizacionesEnMongo(codempresa: string, cotizaciones: any[]): Promise<any> {
    // Verificamos si la empresa existe en nuestra base de datos
    const empresa = await this.empresaModel.findOne({ codempresa }).exec();
    if (!empresa) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `No se pudo encontrar la empresa con código ${codempresa}.`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  
    console.log('Empresa encontrada:', empresa); // Verifica que la empresa existe
  
    // Función para filtrar las cotizaciones entre 9:00 y 15:00 UTC
    const filtrarPorHorario = (cotizaciones: any[]): any[] => {
      return cotizaciones.filter(cotizacion => {
        const hora = parseInt(cotizacion.hora.split(':')[0], 10); // Obtiene la hora como número
        return hora >= 9 && hora <= 15; // Filtra solo entre 9 y 15 UTC
      });
    };
  
    // Filtramos las cotizaciones antes de guardarlas
    const cotizacionesFiltradas = filtrarPorHorario(cotizaciones);
    console.log('Cotizaciones filtradas:', cotizacionesFiltradas);
  
    // Guardamos las cotizaciones filtradas en la base de datos
    const cotizacionesGuardadas = [];
    for (const cotizacion of cotizacionesFiltradas) {
      try {
        console.log('Guardando cotización:', cotizacion);
  
        // Convertimos cotización a número
        const nuevaCotizacion = new this.cotizacionModel({
          id: cotizacion.id,
          fecha: cotizacion.fecha,
          hora: cotizacion.hora,
          dateUTC: cotizacion.dateUTC,
          cotizacion: parseFloat(cotizacion.cotization), // Convertir a número
          empresa: empresa._id,
        });
  
        // Guardamos la cotización en la base de datos
        const cotizacionGuardada = await nuevaCotizacion.save();
        cotizacionesGuardadas.push(cotizacionGuardada);
      } catch (error) {
        console.error('Error al guardar la cotización:', error);
      }
    }
  
    console.log('Cotizaciones guardadas:', cotizacionesGuardadas); // Verifica si las cotizaciones fueron guardadas
    return cotizacionesGuardadas; // Devolvemos las cotizaciones guardadas
  }

  async guardarCotizacionSinDuplicados(cotizacion: Cotizacion): Promise<void> {
    try {
      const cotizacionExistente = await this.cotizacionModel.findOne({ id: cotizacion.id });
      if (cotizacionExistente) {
        this.logger.log(`La cotización con id ${cotizacion.id} ya existe. No se guardará.`);
      } else {
        const nuevaCotizacion = new this.cotizacionModel(cotizacion);
        await nuevaCotizacion.save();
        this.logger.log(`Cotización ${cotizacion.id} guardada correctamente.`);
      }
    } catch (error) {
      this.logger.error(`Error al guardar la cotización: ${error.message}`);
    }
  }
  }







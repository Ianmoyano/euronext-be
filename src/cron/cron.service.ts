


import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment-timezone';
import { Model } from 'mongoose';
import { CotizacionService } from 'src/cotizacion/cotizacion.service';
import { Cotizacion } from 'src/cotizacion/model/cotizacion.schema';
import { EmpresaService } from 'src/empresa/empresa.service';
import { IndiceService } from 'src/indice/indice.service';
import { IndicesCotizacion } from 'src/indice/model/indiceCotizaciones.schema';
import * as dayjs from 'dayjs';
import { PromedioPonderadoService } from 'src/indice/promedioPonderado.service';
import clienteAxios from 'src/axios/axios';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  constructor(
    private readonly proemdioService: PromedioPonderadoService,
    private cotizacionService: CotizacionService,
    private empresaService: EmpresaService,
    private indiceService: IndiceService,
    @InjectModel(Cotizacion.name) private readonly cotizacionModel: Model<Cotizacion>,
    @InjectModel(IndicesCotizacion.name) private readonly indicesCotizacionModel: Model<IndicesCotizacion>,
) { }

@Cron(CronExpression.EVERY_10_HOURS) // Ejecutar cada 10 segundos para pruebas
async procesarCotizacionesUltimosDias() {
    this.logger.log('Iniciando proceso de cotizaciones de los últimos 5 días...');
  
    const empresas = ['MSFT', 'META', 'V', 'WMT', 'NOVN.SW', 'SHEL', 'TM'];
  
    const fechaFin = new Date(); // Fecha actual
    const fechaInicio = new Date(fechaFin.getTime() - 5 * 24 * 60 * 60 * 1000); // Fecha hace 5 días
  
    // Convertir fechas a la zona horaria de Francia (sin segundos ni milisegundos)
    const fechaDesdeBase = moment.tz(fechaInicio, "Europe/Paris").format('YYYY-MM-DD'); // Fecha base en hora de París
    const fechaHastaBase = moment.tz(fechaFin, "Europe/Paris").format('YYYY-MM-DD'); // Fecha base en hora de París
  
    this.logger.log(`Procesando datos desde ${fechaDesdeBase} hasta ${fechaHastaBase}`);
  
    // Bucle por cada empresa
    for (const empresa of empresas) {
      try {
        this.logger.log(`Obteniendo cotizaciones para ${empresa}...`);
  
        // Bucle por cada hora del día (de 9:00 a 15:00, por ejemplo)
        for (let hora = 9; hora <= 15; hora++) {
          const horaInicio = hora;
          const horaFin = hora + 1; // La hora final es la siguiente
  
          // Formatear las fechas sin segundos ni milisegundos, y solo la hora (HH:mm)
          const fechaDesde = moment.tz(`${fechaDesdeBase}T${horaInicio.toString().padStart(2, '0')}:00`, "Europe/Paris").format('YYYY-MM-DDTHH:mm');
          const fechaHasta = moment.tz(`${fechaHastaBase}T${horaFin.toString().padStart(2, '0')}:00`, "Europe/Paris").format('YYYY-MM-DDTHH:mm');
  
          this.logger.log(`Solicitando cotizaciones de ${fechaDesde} a ${fechaHasta} para ${empresa}...`);
  
          // Obtener cotizaciones por hora (es el mismo método, pero llamamos por cada hora)
          const cotizaciones = await this.cotizacionService.obtenerCotizacionesPorCodigo(
            empresa,
            fechaDesde,
            fechaHasta
          );
  
          if (cotizaciones && cotizaciones.length > 0) {
            this.logger.log(`Cotizaciones obtenidas para ${empresa} de ${fechaDesde} a ${fechaHasta}: ${cotizaciones.length}`);
  
            // Filtrar cotizaciones nuevas
            const nuevasCotizaciones = await this.cotizacionService.filtrarCotizacionesNuevas(empresa, cotizaciones);
  
            if (nuevasCotizaciones.length > 0) {
              this.logger.log(`Guardando ${nuevasCotizaciones.length} nuevas cotizaciones para ${empresa}...`);
              await this.cotizacionService.guardarCotizacionesEnMongo(empresa, nuevasCotizaciones);
              this.logger.log(`Nuevas cotizaciones guardadas para ${empresa}`);
            } else {
              this.logger.log(`No se encontraron nuevas cotizaciones para ${empresa}`);
            }
          } else {
            this.logger.warn(`No se encontraron cotizaciones para ${empresa} de ${fechaDesde} a ${fechaHasta}`);
          }
        }
      } catch (error) {
        this.logger.error(`Error al procesar cotizaciones para ${empresa}: ${error.message}`);
      }
    }
  
    this.logger.log('Proceso de cotizaciones de los últimos 5 días finalizado.');
  }
  
  @Cron(  CronExpression.EVERY_10_HOURS)
async sincronizarCotizaciones(): Promise<void> {
  this.logger.log('Iniciando sincronización de cotizaciones para los últimos 5 días');
  try {
    const horas = this.generarRangoHoras(9, 15); // Genera las horas 09:00 - 15:00
    const dias = this.generarUltimosDias(5); // Genera las fechas de los últimos 5 días

    // Obtener los índices disponibles desde tu servicio
    const indices = await this.indiceService.obtenerIndice();
    for (const indice of indices) {
      for (const dia of dias) {
        for (const hora of horas) {
          const fechaDesde = `${dia}T${hora}`;
          const fechaHasta = `${dia}T${hora}`;
          this.logger.log(`Buscando cotización para índice ${indice.code} el ${dia} a las ${hora}`);

          try {
            // Llama a tu servicio para obtener cotizaciones
            const cotizaciones = await this.indiceService.obtenerIndicesCotizacionesPorCodigo(
              indice.code,
              fechaDesde,
              fechaHasta,
            );

            if (cotizaciones.length > 0) {
              // Guarda las cotizaciones usando tu servicio
              await this.indiceService.guardarIndicesCotizacionesEnMongo(cotizaciones);
              this.logger.log(`Cotizaciones guardadas para índice ${indice.code} el ${dia} a las ${hora}`);
            } else {
              this.logger.log(`No se encontraron cotizaciones para índice ${indice.code} el ${dia} a las ${hora}`);
            }
          } catch (error) {
            this.logger.error(
              `Error al obtener cotizaciones para índice ${indice.code} el ${dia} a las ${hora}`,
              error,
            );
          }
        }
      }
    }
  } catch (error) {
    this.logger.error('Error durante la sincronización de cotizaciones', error);
  }
} 
private generarRangoHoras(horaInicio: number, horaFin: number): string[] {
  const horas: string[] = [];
  for (let i = horaInicio; i <= horaFin; i++) {
    horas.push(i.toString().padStart(2, '0') + ':00');
  }
  return horas;
}

private generarUltimosDias(cantidadDias: number): string[] {
  const dias: string[] = [];
  for (let i = 0; i < cantidadDias; i++) {
    dias.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
  }
  return dias.reverse(); // Para que estén en orden cronológico
}

@Cron(CronExpression.EVERY_10_HOURS)
async verificarYSubirPromedioPonderado() {
  const fechaActual = new Date();
  const fechaInicio = new Date('2024-01-01'); // Comienza desde el 2024-01-01

  let fecha = new Date(fechaInicio);
  const fechaHoy = new Date(fechaActual.toISOString().split('T')[0]);

  // Verificar si los índices están guardados en la base de datos
  try {
    // Buscar índices en la base de datos hasta el día de hoy
    const indicesGuardados = await this.indicesCotizacionModel.find({
      fechaDate: { $lte: fechaHoy.toISOString() },
    });

    const indicesPublicados = indicesGuardados.map((indice) => indice.fechaDate);
    this.logger.log('Índices guardados en la base de datos:', indicesPublicados);

    // Verificar fechas faltantes
    const fechasFaltantes = [];
    while (fecha <= fechaHoy) {
      if (!indicesPublicados.includes(fecha.toISOString().split('T')[0])) {
        fechasFaltantes.push(new Date(fecha));
      }
      fecha.setDate(fecha.getDate() + 1);
    }

    if (fechasFaltantes.length > 0) {
      this.logger.log('Faltan fechas para publicar el promedio ponderado:');
      for (const fechaFaltante of fechasFaltantes) {
        this.logger.log(`Calculando promedio para la fecha: ${fechaFaltante.toISOString().split('T')[0]}`);

        // Verificar si ya existe un índice guardado para la fecha faltante
        const indiceExistente = await this.indicesCotizacionModel.findOne({
          fechaDate: fechaFaltante.toISOString(),
        });

        if (indiceExistente) {
          this.logger.log(`Índice ya existe para la fecha ${fechaFaltante.toISOString().split('T')[0]}. No se realizará el cálculo ni la subida.`);
          continue; // Si ya existe, continuamos con la siguiente fecha faltante
        }

        // Obtener las cotizaciones para la fecha faltante
        const cotizaciones = await this.proemdioService.verCotizaciones();
        const cotizacionesDelDia = cotizaciones.filter((cotizacion) => {
          const fechaCotizacion = new Date(cotizacion.fecha);
          return fechaCotizacion.toISOString().split('T')[0] === fechaFaltante.toISOString().split('T')[0];
        });

        // Calcular el promedio y guardarlo
        if (cotizacionesDelDia.length > 0) {
          const resultado = await this.proemdioService.calcularPromedioPorHora(cotizacionesDelDia);
          this.logger.log(`Promedio calculado y guardado para el ${fechaFaltante.toISOString().split('T')[0]}`, resultado);

          // Subir el índice a la API externa después de guardarlo
          await this.proemdioService.postIndiceCotizacion(resultado);
          this.logger.log(`Índice subido para la fecha ${fechaFaltante.toISOString().split('T')[0]}`);
        } else {
          this.logger.log(`No hay cotizaciones para la fecha ${fechaFaltante.toISOString().split('T')[0]}`);
        }
      }
    } else {
      this.logger.log('Todos los promedios ponderados hasta el día de hoy ya están guardados y publicados.');
    }
  } catch (error) {
    this.logger.error('Error al verificar y publicar promedios ponderados:', error.message);
  }
}
}

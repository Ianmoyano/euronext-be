import { Controller, Get, Param, Query, HttpException, HttpStatus, Post, Body } from '@nestjs/common';
import { IndiceService } from './indice.service';
import { Indices } from './model/indice.schema';
import { promises } from 'dns';
import { IndicesCotizacion } from './model/indiceCotizaciones.schema';

@Controller('indices')
export class IndiceController {

  constructor(
    private indicesService: IndiceService
  ) { }

  @Get('')
  async obtenerYGuardarIndices(): Promise<Indices[]> {
   return await this.indicesService.obtenerIndice();
  }


@Get('indices')
async guardarIndices(){
 const indices = await this.indicesService.obtenerIndice();
 const respuesta = await this.indicesService.guardarIndicesEnMongo(indices);
 return respuesta;
 
}



@Get('/:codigoIndice/obtener')
async obtenerIndicesCotizaciones(
  @Param('codigoIndice') codigoIndice: string,
  @Query('fechaDesde') fechaDesde: string,
  @Query('fechaHasta') fechaHasta: string,
): Promise<any> {
  if (!codigoIndice || !fechaDesde || !fechaHasta) {
    throw new HttpException(
      'El parámetro "codigoIndice" y las fechas "fechaDesde" y "fechaHasta" son obligatorios',
      HttpStatus.BAD_REQUEST,
    );
  }

  try {
    const respuesta = await this.indicesService.obtenerIndicesCotizacionesPorCodigo(codigoIndice, fechaDesde, fechaHasta);
  return await this.indicesService.guardarIndicesCotizacionesEnMongo(respuesta);
  } catch (error) {
    console.error('Error en el controlador:', error);
    throw new HttpException('Error al obtener los índices', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Post('enviarIndice')
  async crearIndice(@Body() body: { code: string; name: string }): Promise<void> {
    await this.indicesService.crearIndicePropio(body);
  }

}
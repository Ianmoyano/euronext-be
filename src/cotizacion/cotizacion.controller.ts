import { Controller, Get, HttpException, HttpStatus, Param, Query } from "@nestjs/common";
import { CotizacionService } from "./cotizacion.service";
import { EmpresaService } from "src/empresa/empresa.service";
import { promises } from "dns";

@Controller('cotizacion')
export class CotizacionController {

  constructor(
    private cotizacionService: CotizacionService,
    private empresaService: EmpresaService,
  ) {} 

  
  @Get('/cotizaciones')
async recuperarCotizacion(){
  
  const verTodasCotizaciones = await this.cotizacionService.verCotizaciones();
  return console.log(verTodasCotizaciones)
}

  
  
  
  @Get('/:codigoempresa')
async verCotizacionPorEmpresa(
  @Param('codigoempresa') codigoempresa: string,
  @Query('fechaDesde') fechaDesde: string,
  @Query('fechaHasta') fechaHasta: string,
): Promise<any> {
  try {
    // Suponiendo que cotizacionService tiene un método para obtener cotizaciones por empresa
    return await this.cotizacionService.obtenerCotizacionesPorCodigo(codigoempresa, fechaDesde, fechaHasta);
  } catch (error) {
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error: `No se pudo encontrar cotizaciones para la empresa con código ${codigoempresa}.`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

@Get('/:codigoempresa/generar')
async crearCotizacionesPorEmpresa(
  @Param('codigoempresa') codigoempresa: string,
  @Query('fechaDesde') fechaDesde: string,
  @Query('fechaHasta') fechaHasta: string,


): Promise<any> {
  

  
  try {
    // Suponiendo que cotizacionService tiene un método para obtener cotizaciones por empresa
    const Cotizacion=await this.cotizacionService.obtenerCotizacionesPorCodigo(codigoempresa, fechaDesde, fechaHasta);
 
    
    await this.cotizacionService.guardarCotizacionesEnMongo(codigoempresa, Cotizacion)
  } catch (error) {
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error: `No se pudo encontrar cotizaciones para la empresa con código ${codigoempresa}.`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}





}



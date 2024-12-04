
import { Body, Controller, Get, Post } from '@nestjs/common';
import { PromedioPonderadoService } from './promedioPonderado.service';

@Controller('promedio-ponderado')
export class PromedioPonderadoController {
  constructor(private readonly promedioPonderadoService: PromedioPonderadoService) {}

  @Get('/promedio')
  async calcularPromedioPorHora() {
    const cotizaciones = await this.promedioPonderadoService.verCotizaciones();
    return await this.promedioPonderadoService.calcularPromedioPorHora(cotizaciones);
  }

  @Get('/indiceCotizacion')
  async recuperarPromedioPorHora() {
    return await this.promedioPonderadoService.verIndiceCotizaciones();
  }

  @Post('/enviarIndice')
  async enviarIndice(): Promise<void> {
    try {
    const respuesta = await this.promedioPonderadoService.postCotizacionesUnaPorUna()
    console.log(respuesta)
    return await this.promedioPonderadoService.postIndiceCotizacion(respuesta)
  
  } catch (error) {
      console.error('Error en enviarCotizaciones:', error.message);
      throw new Error('No se pudo completar la solicitud al API externo.');
    }
  }



}






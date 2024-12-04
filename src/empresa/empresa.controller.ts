import { Controller, Get, HttpException, HttpStatus, Param } from "@nestjs/common";
import { CotizacionService } from "src/cotizacion/cotizacion.service";
import { EmpresaService } from "./empresa.service";


@Controller('empresa')
export class EmpresaController {
  constructor(
    private cotizacionService: CotizacionService,
    private empresaService: EmpresaService,
  ) {} 

  @Get('/:codigoempresa')
  async verEmpresaCodigo(@Param('codigoempresa') codigoempresa: string): Promise<any> {
    try {
      return await this.empresaService.verEmpresaCodigo(codigoempresa);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error:`No se pudo encontrar la empresa con código ${codigoempresa}.`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }



}


import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresaController } from './empresa/empresa.controller';
import { IndiceController } from './indice/indice.controller';
import { CotizacionController } from './cotizacion/cotizacion.controller';
import { EmpresaService } from './empresa/empresa.service';
import { IndiceService } from './indice/indice.service';
import { CotizacionService } from './cotizacion/cotizacion.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Empresa, EmpresaSchema } from './empresa/model/empresa.schema';
import { Cotizacion, CotizacionSchema } from './cotizacion/model/cotizacion.schema';
import { Indices, IndicesSchema } from './indice/model/indice.schema';
import { IndicesCotizacion, IndicesCotizacionSchema } from './indice/model/indiceCotizaciones.schema';
import { PromedioPonderadoService } from './indice/promedioPonderado.service';
import { PromedioPonderadoController } from './indice/promedioPonderado.controller';

import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron/cron.service';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost:27017/PAR'),
    MongooseModule.forFeature([
      {
        name: Empresa.name,
        schema: EmpresaSchema,
      },
      {
        name: Cotizacion.name,
        schema: CotizacionSchema,
      },
      {
        name: Indices.name,
        schema: IndicesSchema,
      },
      {
        name: IndicesCotizacion.name,
        schema: IndicesCotizacionSchema,
      },
    ]),
  ],


  controllers: [ AppController, EmpresaController, CotizacionController, IndiceController, PromedioPonderadoController, ],
  providers: [ AppService, EmpresaService,  CotizacionService, IndiceService, PromedioPonderadoService, CronService],
})
export class AppModule {
}




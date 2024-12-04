import { Injectable } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { lastValueFrom } from "rxjs";
import clienteAxios from "src/axios/axios";

@Injectable()
export class EmpresaService {
  getAllEmpresas() {
    throw new Error("Method not implemented.");
  }
  constructor(
    
  ) {}

  async verEmpresaCodigo(codigoempresa: string): Promise<any | undefined> {
    try {
      const respuesta: AxiosResponse<any> = await clienteAxios.get(`/empresas/${codigoempresa}/details`);
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener la empresa:', error.response?.data || error.message);
      throw new Error(`No se pudo obtener la empresa.`);
    }
  }

}
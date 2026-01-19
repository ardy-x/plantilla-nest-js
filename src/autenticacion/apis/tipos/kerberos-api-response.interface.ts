export interface KerberosApiResponse<T = void> {
  data?: T;
  meta: {
    status: number;
    statusMessage: string;
  };
}

export interface IntercambioCodigoDatos {
  token: string;
}

export interface RefreshTokenDatos {
  access_token: string;
  refresh_token: string;
}

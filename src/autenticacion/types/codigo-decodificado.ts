export interface CodigoDecodificado {
  tokens: {
    access_token: string;
    refresh_token: string;
  };
  systemData: {
    id: string;
    modules: {
      name: string;
      path: string;
      icon: string;
      order: number;
      children: {
        name: string;
        path: string;
        icon: string;
        order: number;
        children?: unknown[];
      }[];
    }[];
    permissions: string[];
    role: string;
  };
  userData: {
    userId: string;
    username: string;
    email: string;
    active: boolean;
    fullName: string;
    imageUser: string;
    verified: boolean;
    createdAt: string;
    lastAccess: string;
    unidad: string;
    grado: string;
    latitude: number;
    longitude: number;
  };
  iat: number;
  exp: number;
}

export interface Usuario {
  idUsuario: string;
  idSistemaUsuario: string;
}

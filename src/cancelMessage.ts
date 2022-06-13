export default (receipt: string, cancelReason: string) => {
  const xml = {
    Manutencao: {
      attributes: {
        Versao: '1.0',
      },
      Mensagem: {
        Recibo: receipt,
        Motivo: cancelReason,
      },
    },
  };

  return {
    pXml: xml,
  };
};

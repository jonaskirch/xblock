import { createClientAsync, ClientSSLSecurityPFX } from 'soap';

const url = 'http://webservices.sef.sc.gov.br/wsDfeSiv/BlocoX.asmx?wsdl';
const pfxFile = '';
const pfxPassword = '';

async function execute() {
  const client = await createClientAsync(url);
  client.setSecurity(new ClientSSLSecurityPFX(pfxFile, pfxPassword));

  const xml = {
    Manutencao: {
      attributes: {
        Versao: '1.0',
      },
      Mensagem: {
        Recibo: 'f763cd9a-40d5-4c4d-bccf-d04f73b8ee57',
        Motivo:
          'Cancelamento de arquivo devido a alteração contratual da atividade econômica em 30/09/2020 cuja obrigatoriedade de envio alterou para 01/02/2022',
      },
    },
  };

  const body = {
    pXml: xml,
  };

  try {
    const resp = await client.CancelarArquivoAsync(body);
    console.log(resp);
  } catch (err: any) {
    console.log(err);
  }
}

execute();

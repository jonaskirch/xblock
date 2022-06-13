import { createClientAsync } from 'soap';
import xml2js from 'xml2js';
import cert from './certificate';
import WSSecurityNFe from './WSSecurityNFe';
import cancelMessage from './cancelMessage';
import jsonData from './data/manutencao.json';

const url = 'http://webservices.sef.sc.gov.br/wsDfeSiv/BlocoX.asmx?wsdl';
const cancelReason =
  'Cancelamento de arquivo devido a alteração contratual da atividade econômica em 07/01/2022 cuja obrigatoriedade alterou para esta data';

async function cancellation(receipt: string) {
  try {
    const client = await createClientAsync(url);
    const wsSecurity = new WSSecurityNFe(cert.key, cert.cert, cert.password);
    client.setSecurity(wsSecurity);

    const message = cancelMessage(receipt, cancelReason);

    const response = await client.CancelarArquivoAsync(message);
    const resp: any = await xml2js.parseStringPromise(
      response[0].CancelarArquivoResult,
    );
    const situation = resp.RespostaManutencao.SituacaoOperacaoDescricao;
    console.log(receipt, situation);
  } catch (err: any) {
    console.log(err);
  }
}

async function execute() {
  const cancelReceipts = jsonData.map(async (data: any) =>
    cancellation(data.Recibo),
  );
  console.log('start');
  console.log(`${jsonData.length} documents:`);
  await Promise.all(cancelReceipts);
  console.log('finish');
}

execute();

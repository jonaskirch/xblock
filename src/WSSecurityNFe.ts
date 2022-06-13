/* eslint-disable class-methods-use-this */
import { ISecurity } from 'soap';
import { SignedXml } from 'xml-crypto';
import { DOMParser, XMLSerializer } from 'xmldom';

class WSSecurityNFe implements ISecurity {
  // foi necessario implementar um novo protoco de comunicacao, para enviar no estilo "padrao nfe".
  // usado o link abaixo como fonte de consulta:
  // https://github.com/lealhugui/node-dfe/blob/master/src/factory/signature.ts

  private privateKey: Buffer;

  private publicKey: Buffer;

  private password: string;

  constructor(privateKey: Buffer, publicKey: Buffer, password: string) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.password = password;
  }

  private getSoapMessage(xml: string, nodeName: string): string {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const node = doc.getElementsByTagName(nodeName)[0];
    const xmlNode = new XMLSerializer();
    return xmlNode.serializeToString(node.childNodes[0]);
  }

  public postProcess(xml: string, envelopeKey: string) {
    const infoProvider = (pem: any) => {
      return {
        getKeyInfo() {
          const cert = this.getCert();
          return `<X509Data><X509Certificate>${cert}</X509Certificate></X509Data>`;
        },
        getCert() {
          const certLines = pem.toString().split('\n');
          return certLines
            .filter((e: any, i: any) => i && e && e.indexOf('-----') !== 0)
            .join('');
        },
      };
    };

    const sign = new SignedXml();
    const tag = 'Mensagem'; // Esta Fixo a tag Mensagem para Assinatura
    const transforms = [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ];

    sign.addReference(
      '*', // `//*[local-name(.)='${tag}']`,  //Não segue o padrao NFe. Na tag a ser assinada nao deve ter Id.
      transforms,
      '',
      '',
      '',
      '',
      true,
    );
    sign.signingKey = this.privateKey;
    sign.canonicalizationAlgorithm =
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
    sign.keyInfoProvider = infoProvider(this.publicKey);

    // TODO: nao deveria de ter este namespace
    const xmlNode = this.getSoapMessage(xml, 'pXml').replace(
      ' xmlns="http://webservices.sef.sc.gov.br/wsDfeSiv/"',
      '',
    );

    sign.computeSignature(xmlNode, {
      location: {
        reference: `//*[local-name(.)='${tag}']`,
        action: 'after',
      },
    });

    const signedXml = sign.getSignedXml();
    const envelope = xml.replace(
      `<pXml>${xmlNode}</pXml>`,
      `<pXml><![CDATA[${signedXml}]]></pXml>`,
    );
    return envelope;
  }
}

export default WSSecurityNFe;

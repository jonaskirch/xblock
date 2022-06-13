/* eslint-disable class-methods-use-this */
import { ISecurity } from 'soap';
import { SignedXml } from 'xml-crypto';
import { DOMParser, XMLSerializer } from 'xmldom';

class WSSecurityNFe implements ISecurity {
  // foi necessario implementar um novo protoco de comunicacao, para enviar no estilo padrao nfe.
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

    const sig = new SignedXml();
    const tag = 'Mensagem';
    const transforms = [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ];

    sig.addReference(
      '*', // `//*[local-name(.)='${tag}']`,
      transforms,
      '',
      '',
      '',
      '',
      true,
    );
    sig.signingKey = this.privateKey;
    sig.canonicalizationAlgorithm =
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
    sig.keyInfoProvider = infoProvider(this.publicKey);

    const xmlNode = this.getSoapMessage(xml, 'pXml').replace(
      ' xmlns="http://webservices.sef.sc.gov.br/wsDfeSiv/"',
      '',
    );
    // console.log('xNode', xmlNode);

    sig.computeSignature(xmlNode, {
      location: {
        reference: `//*[local-name(.)='${tag}']`,
        action: 'after',
      },
    });

    const sign = sig.getSignedXml();
    // console.log('sign', sign);
    // console.log('xml', xml);

    const envelope = xml.replace(
      `<pXml>${xmlNode}</pXml>`,
      `<pXml><![CDATA[${sign}]]></pXml>`,
    );
    // console.log(envelope);
    return envelope;
  }
}

export default WSSecurityNFe;

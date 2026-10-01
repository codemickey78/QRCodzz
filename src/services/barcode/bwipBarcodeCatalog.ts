export type BwipBarcodeDefinition = {
  bcid: string;
  description: string;
  id: string;
  label: string;
  multiline?: boolean;
  placeholder: string;
  searchTerms: string[];
  twoDimensional?: boolean;
};

const barcodeCatalogInput = [
  ['auspost', 'AusPost 4 State Customer Code', 'auspost', '5912345678', 'Postal 4-state barcode for Australia Post.', ['postal', 'australia'], false],
  ['azteccode', 'Aztec Code', 'azteccode', 'Ticket payload', 'Compact two-dimensional barcode.', ['2d', 'ticket'], true],
  ['aztecrune', 'Aztec Runes', 'aztecrune', '1', 'Small Aztec rune symbol.', ['2d', 'rune'], true],
  ['bc412', 'BC412', 'bc412', 'ABC123', 'BC412 semiconductor and wafer barcode.', ['industrial'], false],
  ['coop2of5', 'COOP 2 of 5', 'coop2of5', '123456', 'Numeric COOP 2 of 5 barcode.', ['numeric'], false],
  ['channelcode', 'Channel Code', 'channelcode', '12345', 'High density numeric channel code.', ['numeric'], false],
  ['codabar', 'Codabar', 'rationalizedCodabar', 'A123456A', 'Codabar value with A-D start and stop characters.', ['library', 'blood bank'], false],
  ['codablockf', 'Codablock F', 'codablockf', 'Document record', 'Stacked Codablock F barcode.', ['stacked'], true],
  ['code11', 'Code 11', 'code11', '123456-7', 'Numeric Code 11 barcode.', ['numeric'], false],
  ['code128', 'Code 128', 'code128', 'SHIP-100042', 'High-density barcode for text and identifiers.', ['shipping', 'inventory'], false],
  ['code16k', 'Code 16K', 'code16k', 'Document record', 'Stacked Code 16K barcode.', ['stacked'], true],
  ['code25', 'Code 25', 'code2of5', '123456', 'Numeric Code 2 of 5 barcode.', ['numeric'], false],
  ['code39', 'Code 39', 'code39', 'ITEM-42', 'Alphanumeric inventory barcode.', ['inventory', 'industrial'], false],
  ['code39ext', 'Code 39 Extended', 'code39ext', 'Item #42', 'Extended ASCII Code 39 barcode.', ['inventory', 'ascii'], false],
  ['code49', 'Code 49', 'code49', 'Document record', 'Stacked Code 49 barcode.', ['stacked'], true],
  ['code93', 'Code 93', 'code93', 'ASSET-93', 'Compact printable ASCII barcode.', ['asset', 'inventory'], false],
  ['code93ext', 'Code 93 Extended', 'code93ext', 'Asset #93', 'Extended ASCII Code 93 barcode.', ['asset', 'ascii'], false],
  ['codeone', 'Code One', 'codeone', 'LOT 2026-09-25', 'Code One two-dimensional barcode.', ['2d'], true],
  ['azteccodecompact', 'Compact Aztec Code', 'azteccodecompact', 'Ticket payload', 'Compact variant of Aztec Code.', ['2d', 'compact'], true],
  ['pdf417compact', 'Compact PDF417', 'pdf417compact', 'Document record', 'Compact PDF417 stacked barcode.', ['2d', 'stacked'], true],
  ['raw', 'Custom 1D symbology', 'raw', '331132131313411122131311333213114131131221323', 'Custom raw 1D BWIPP symbology.', ['custom', 'raw'], false],
  ['daft', 'Custom 4 state symbology', 'daft', 'DAFTDAFTDAFT', 'Custom raw 4-state BWIPP symbology.', ['custom', '4-state'], false],
  ['d3aqr', 'D3 AQR (beta)', 'd3aqr', 'D3AQR payload', 'D3 AQR beta matrix barcode.', ['2d', 'beta'], true],
  ['datamatrix', 'Data Matrix', 'datamatrix', 'LOT 2026-09-25', 'Dense two-dimensional Data Matrix barcode.', ['2d', 'lot'], true],
  ['datamatrixrectangular', 'Data Matrix Rectangular', 'datamatrixrectangular', 'LOT 2026-09-25', 'Rectangular Data Matrix barcode.', ['2d', 'rectangular'], true],
  ['datamatrixrectangularextension', 'Data Matrix Rectangular Extension', 'datamatrixrectangularextension', 'LOT 2026-09-25', 'DMRE rectangular Data Matrix barcode.', ['2d', 'dmre'], true],
  ['datalogic2of5', 'Datalogic 2 of 5', 'datalogic2of5', '123456', 'Numeric Datalogic 2 of 5 barcode.', ['numeric'], false],
  ['identcode', 'Deutsche Post Identcode', 'identcode', '12345678901', 'Deutsche Post Identcode barcode.', ['postal', 'germany'], false],
  ['leitcode', 'Deutsche Post Leitcode', 'leitcode', '1234567890123', 'Deutsche Post Leitcode barcode.', ['postal', 'germany'], false],
  ['dotcode', 'DotCode', 'dotcode', '0101234567890128', 'DotCode two-dimensional barcode.', ['2d', 'dots'], true],
  ['ean13', 'EAN-13', 'ean13', '5901234123457', 'Retail EAN-13 barcode with checksum handling.', ['retail', 'gtin'], false],
  ['ean13composite', 'EAN-13 Composite', 'ean13composite', '2112345678900|(99)1234-abcd', 'EAN-13 with GS1 composite component.', ['retail', 'composite'], true],
  ['ean14', 'EAN-14', 'ean14', '(01)12345678901231', 'EAN-14 logistics barcode.', ['retail', 'logistics'], false],
  ['ean2', 'EAN-2 (2 digit addon)', 'ean2', '12', 'Two digit EAN add-on barcode.', ['addon'], false],
  ['ean5', 'EAN-5 (5 digit addon)', 'ean5', '90200', 'Five digit EAN add-on barcode.', ['addon'], false],
  ['ean8', 'EAN-8', 'ean8', '96385074', 'Compact retail EAN-8 barcode with checksum handling.', ['retail', 'gtin'], false],
  ['ean8composite', 'EAN-8 Composite', 'ean8composite', '02345673|(99)1234-abcd', 'EAN-8 with GS1 composite component.', ['retail', 'composite'], true],
  ['flattermarken', 'Flattermarken', 'flattermarken', '12345', 'Flattermarken barcode marks.', ['printing'], false],
  ['gs1_cc', 'GS1 Composite 2D Component', 'gs1_cc', '(99)1234-abcd', 'GS1 composite 2D component.', ['gs1', 'composite'], true],
  ['gs1datamatrix', 'GS1 Data Matrix', 'gs1datamatrix', '(01)09521234543213(17)260101', 'GS1 Data Matrix barcode.', ['gs1', '2d'], true],
  ['gs1datamatrixrectangular', 'GS1 Data Matrix Rectangular', 'gs1datamatrixrectangular', '(01)09521234543213(17)260101', 'GS1 rectangular Data Matrix barcode.', ['gs1', '2d'], true],
  ['databarexpanded', 'GS1 DataBar Expanded', 'databarexpanded', '(01)09521234543213(3103)000123', 'GS1 DataBar Expanded barcode.', ['gs1', 'databar'], false],
  ['databarexpandedcomposite', 'GS1 DataBar Expanded Composite', 'databarexpandedcomposite', '(01)09521234543213(3103)000123|(99)1234-abcd', 'GS1 DataBar Expanded with composite component.', ['gs1', 'composite'], true],
  ['databarexpandedstacked', 'GS1 DataBar Expanded Stacked', 'databarexpandedstacked', '(01)09521234543213(3103)000123', 'Stacked GS1 DataBar Expanded barcode.', ['gs1', 'stacked'], true],
  ['databarexpandedstackedcomposite', 'GS1 DataBar Expanded Stacked Composite', 'databarexpandedstackedcomposite', '(01)09521234543213(3103)000123|(99)1234-abcd', 'Stacked GS1 DataBar Expanded with composite component.', ['gs1', 'composite'], true],
  ['databarlimited', 'GS1 DataBar Limited', 'databarlimited', '(01)09521234543213', 'GS1 DataBar Limited barcode.', ['gs1', 'databar'], false],
  ['databarlimitedcomposite', 'GS1 DataBar Limited Composite', 'databarlimitedcomposite', '(01)09521234543213|(99)1234-abcd', 'GS1 DataBar Limited with composite component.', ['gs1', 'composite'], true],
  ['databaromni', 'GS1 DataBar Omnidirectional', 'databaromni', '(01)09521234543213', 'GS1 DataBar Omnidirectional barcode.', ['gs1', 'databar'], false],
  ['databaromnicomposite', 'GS1 DataBar Omnidirectional Composite', 'databaromnicomposite', '(01)09521234543213|(99)1234-abcd', 'GS1 DataBar Omnidirectional with composite component.', ['gs1', 'composite'], true],
  ['databarstacked', 'GS1 DataBar Stacked', 'databarstacked', '(01)09521234543213', 'GS1 DataBar Stacked barcode.', ['gs1', 'stacked'], true],
  ['databarstackedcomposite', 'GS1 DataBar Stacked Composite', 'databarstackedcomposite', '(01)09521234543213|(99)1234-abcd', 'GS1 DataBar Stacked with composite component.', ['gs1', 'composite'], true],
  ['databarstackedomni', 'GS1 DataBar Stacked Omnidirectional', 'databarstackedomni', '(01)09521234543213', 'GS1 DataBar Stacked Omnidirectional barcode.', ['gs1', 'stacked'], true],
  ['databarstackedomnicomposite', 'GS1 DataBar Stacked Omnidirectional Composite', 'databarstackedomnicomposite', '(01)09521234543213|(99)1234-abcd', 'GS1 DataBar Stacked Omnidirectional with composite component.', ['gs1', 'composite'], true],
  ['databartruncated', 'GS1 DataBar Truncated', 'databartruncated', '(01)09521234543213', 'GS1 DataBar Truncated barcode.', ['gs1', 'databar'], false],
  ['databartruncatedcomposite', 'GS1 DataBar Truncated Composite', 'databartruncatedcomposite', '(01)09521234543213|(99)1234-abcd', 'GS1 DataBar Truncated with composite component.', ['gs1', 'composite'], true],
  ['gs1dldatamatrix', 'GS1 Digital Link Data Matrix', 'gs1dldatamatrix', 'https://id.gs1.org/01/09521234543213', 'GS1 Digital Link Data Matrix barcode.', ['gs1', 'digital link'], true],
  ['gs1dlqrcode', 'GS1 Digital Link QR Code', 'gs1dlqrcode', 'https://id.gs1.org/01/09521234543213', 'GS1 Digital Link QR Code.', ['gs1', 'digital link'], true],
  ['gs1dotcode', 'GS1 DotCode', 'gs1dotcode', '(01)09521234543213(17)260101', 'GS1 DotCode barcode.', ['gs1', 'dotcode'], true],
  ['gs1northamericancoupon', 'GS1 North American Coupon', 'gs1northamericancoupon', '(8110)106141416543213500110000310123196000', 'GS1 North American Coupon barcode.', ['gs1', 'coupon'], false],
  ['gs1qrcode', 'GS1 QR Code', 'gs1qrcode', '(01)09521234543213(17)260101', 'GS1 QR Code.', ['gs1', 'qr'], true],
  ['gs1_128', 'GS1-128', 'gs1_128', '(01)09521234543213(17)260101', 'GS1-128 barcode.', ['gs1', 'code 128'], false],
  ['gs1_128composite', 'GS1-128 Composite', 'gs1_128composite', '(01)09521234543213(17)260101|(99)1234-abcd', 'GS1-128 with composite component.', ['gs1', 'composite'], true],
  ['hibcazteccode', 'HIBC Aztec Code', 'hibcazteccode', 'A123BJC5D6E71', 'HIBC Aztec Code barcode.', ['hibc', '2d'], true],
  ['hibccodablockf', 'HIBC Codablock F', 'hibccodablockf', 'A123BJC5D6E71', 'HIBC Codablock F barcode.', ['hibc', 'stacked'], true],
  ['hibccode128', 'HIBC Code 128', 'hibccode128', 'A123BJC5D6E71', 'HIBC Code 128 barcode.', ['hibc'], false],
  ['hibccode39', 'HIBC Code 39', 'hibccode39', 'A123BJC5D6E71', 'HIBC Code 39 barcode.', ['hibc'], false],
  ['hibcdatamatrix', 'HIBC Data Matrix', 'hibcdatamatrix', 'A123BJC5D6E71', 'HIBC Data Matrix barcode.', ['hibc', '2d'], true],
  ['hibcdatamatrixrectangular', 'HIBC Data Matrix Rectangular', 'hibcdatamatrixrectangular', 'A123BJC5D6E71', 'HIBC rectangular Data Matrix barcode.', ['hibc', '2d'], true],
  ['hibcmicropdf417', 'HIBC MicroPDF417', 'hibcmicropdf417', 'A123BJC5D6E71', 'HIBC MicroPDF417 barcode.', ['hibc', 'stacked'], true],
  ['hibcpdf417', 'HIBC PDF417', 'hibcpdf417', 'A123BJC5D6E71', 'HIBC PDF417 barcode.', ['hibc', 'stacked'], true],
  ['hibcqrcode', 'HIBC QR Code', 'hibcqrcode', 'A123BJC5D6E71', 'HIBC QR Code.', ['hibc', 'qr'], true],
  ['hanxin', 'Han Xin Code', 'hanxin', 'Han Xin payload', 'Han Xin two-dimensional barcode.', ['2d'], true],
  ['iata2of5', 'IATA 2 of 5', 'iata2of5', '123456', 'IATA 2 of 5 barcode.', ['numeric'], false],
  ['isbn', 'ISBN', 'isbn', '978-1-56581-231-4', 'ISBN book barcode.', ['book', 'retail'], false],
  ['ismn', 'ISMN', 'ismn', '979-0-2605-3211-3', 'ISMN music barcode.', ['music', 'retail'], false],
  ['issn', 'ISSN', 'issn', '0317-8471', 'ISSN serial publication barcode.', ['publication', 'retail'], false],
  ['itf14', 'ITF-14', 'itf14', '12345678901231', 'ITF-14 logistics barcode.', ['carton', 'logistics'], false],
  ['industrial2of5', 'Industrial 2 of 5', 'industrial2of5', '123456', 'Industrial 2 of 5 barcode.', ['numeric'], false],
  ['itf', 'Interleaved 2 of 5 (ITF)', 'interleaved2of5', '12345678', 'Interleaved two-of-five numeric barcode.', ['carton', 'numeric'], false],
  ['italianpharmacode', 'Italian Pharmacode', 'code32', '01234567', 'Italian pharmaceutical Code 32 barcode.', ['pharma'], false],
  ['japanpost', 'Japan Post 4 State Customer Code', 'japanpost', '1234567-ABCD', 'Japan Post 4-state customer barcode.', ['postal', 'japan'], false],
  ['msi', 'MSI Modified Plessey', 'msi', '123456', 'MSI Modified Plessey barcode.', ['numeric'], false],
  ['mands', 'Marks & Spencer', 'mands', '12345670', 'Marks & Spencer barcode.', ['retail'], false],
  ['matrix2of5', 'Matrix 2 of 5', 'matrix2of5', '123456', 'Matrix 2 of 5 barcode.', ['numeric'], false],
  ['maxicode', 'MaxiCode', 'maxicode', 'MaxiCode payload', 'MaxiCode two-dimensional barcode.', ['2d', 'shipping'], true],
  ['microqrcode', 'Micro QR Code', 'microqrcode', 'ABC', 'Micro QR Code.', ['2d', 'qr'], true],
  ['micropdf417', 'MicroPDF417', 'micropdf417', 'Document record', 'MicroPDF417 stacked barcode.', ['2d', 'stacked'], true],
  ['symbol', 'Miscellaneous symbols', 'symbol', 'fima', 'BWIPP miscellaneous symbol renderer.', ['symbol'], true],
  ['pdf417', 'PDF417', 'pdf417', 'Document record', 'PDF417 stacked barcode.', ['2d', 'document'], true],
  ['pharmacode', 'Pharmaceutical Binary Code', 'pharmacode', '117480', 'Pharmaceutical binary code.', ['pharma'], false],
  ['pzn', 'Pharmazentralnummer (PZN)', 'pzn', '123456', 'German PZN pharmaceutical barcode.', ['pharma', 'germany'], false],
  ['plessey', 'Plessey UK', 'plessey', '123456', 'Plessey UK barcode.', ['numeric'], false],
  ['posicode', 'PosiCode', 'posicode', 'ABC123', 'PosiCode barcode.', ['industrial'], false],
  ['qrcode', 'QR Code', 'qrcode', 'https://example.com', 'QR Code via bwip-js.', ['2d', 'qr'], true],
  ['rectangularmicroqrcode', 'Rectangular Micro QR Code (rMQR)', 'rectangularmicroqrcode', 'rMQR payload', 'Rectangular Micro QR Code.', ['2d', 'qr'], true],
  ['kix', 'Royal Dutch TPG Post KIX', 'kix', '1231FZ13XHS', 'Royal Dutch KIX postal barcode.', ['postal', 'netherlands'], false],
  ['royalmail', 'Royal Mail 4 State Customer Code', 'royalmail', 'LE28HS9Z', 'Royal Mail 4-state customer code.', ['postal', 'uk'], false],
  ['mailmark', 'Royal Mail Mailmark', 'mailmark', 'JGB 012100123412345678AB19XY1A 0             www.xyz.com', 'Royal Mail Mailmark barcode.', ['postal', 'uk'], false],
  ['sscc18', 'SSCC-18', 'sscc18', '(00)123456789012345675', 'Serial Shipping Container Code barcode.', ['gs1', 'logistics'], false],
  ['swissqrcode', 'Swiss QR Code', 'swissqrcode', 'SPC\\n0200\\n1\\nCH4431999123000889012\\nS\\nRobert Schneider AG\\nRue du Lac\\n1268\\n2501\\nBiel\\nCH\\n\\n\\n\\n\\n\\n\\n\\n1949.75\\nCHF\\nS\\nMax Muster\\nMusterstrasse\\n123\\n8000\\nSeldwyla\\nCH\\nQRR\\n210000000003139471430009017\\nOrder 123\\nEPD', 'Swiss QR-bill payload.', ['2d', 'payment'], true],
  ['telepen', 'Telepen', 'telepen', 'ABC123', 'Telepen barcode.', ['inventory'], false],
  ['telepennumeric', 'Telepen Numeric', 'telepennumeric', '12345678', 'Telepen Numeric barcode.', ['numeric'], false],
  ['pharmacode2', 'Two-track Pharmacode', 'pharmacode2', '117480', 'Two-track pharmacode barcode.', ['pharma'], false],
  ['upca', 'UPC-A', 'upca', '036000291452', 'UPC-A retail barcode with checksum handling.', ['retail', 'upc'], false],
  ['upcacomposite', 'UPC-A Composite', 'upcacomposite', '036000291452|(99)1234-abcd', 'UPC-A with composite component.', ['retail', 'composite'], true],
  ['upce', 'UPC-E', 'upce', '04210007', 'Compressed UPC-E barcode with checksum handling.', ['retail', 'upc'], false],
  ['upcecomposite', 'UPC-E Composite', 'upcecomposite', '04210007|(99)1234-abcd', 'UPC-E with composite component.', ['retail', 'composite'], true],
  ['onecode', 'USPS Intelligent Mail', 'onecode', '0123456709498765432101234567891', 'USPS Intelligent Mail barcode.', ['postal', 'usps'], false],
  ['planet', 'USPS PLANET', 'planet', '01234567890', 'USPS PLANET barcode.', ['postal', 'usps'], false],
  ['postnet', 'USPS POSTNET', 'postnet', '01234567890', 'USPS POSTNET barcode.', ['postal', 'usps'], false],
  ['ultracode', 'Ultracode', 'ultracode', 'Ultracode payload', 'Ultracode two-dimensional barcode.', ['2d'], true],
] as const;

export const bwipBarcodeCatalog: BwipBarcodeDefinition[] =
  barcodeCatalogInput.map(
    ([id, label, bcid, placeholder, description, searchTerms, twoDimensional]) => ({
      bcid,
      description,
      id,
      label,
      multiline: Boolean(twoDimensional),
      placeholder,
      searchTerms: [...searchTerms],
      twoDimensional,
    }),
  );

const bwipAliases: Record<string, string> = {
  Aztec: 'azteccode',
  Codabar: 'rationalizedCodabar',
  'Data Matrix': 'datamatrix',
  'ean-13': 'ean13',
  'ean-8': 'ean8',
  ITF: 'interleaved2of5',
  'qr-code': 'qrcode',
  'upc-a': 'upca',
  'upc-e': 'upce',
};

export const bwipFormatToBcid = bwipBarcodeCatalog.reduce<Record<string, string>>(
  (catalog, item) => ({
    ...catalog,
    [item.bcid]: item.bcid,
    [item.id]: item.bcid,
    [item.label]: item.bcid,
  }),
  bwipAliases,
);

export const bwipBcidToDefinition = bwipBarcodeCatalog.reduce<
  Record<string, BwipBarcodeDefinition>
>(
  (catalog, item) => ({
    ...catalog,
    [item.bcid]: item,
    [item.id]: item,
    [item.label]: item,
  }),
  {},
);

export const twoDimensionalBcidSet = new Set(
  bwipBarcodeCatalog
    .filter(item => item.twoDimensional)
    .map(item => item.bcid)
    .concat('qrcode'),
);

export function getBwipBarcodeDefinition(format: string) {
  return bwipBcidToDefinition[format];
}

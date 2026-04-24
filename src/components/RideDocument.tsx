import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { SRIFactura } from '../services/xmlParser';

// Register a font for better rendering (optional, using default Helvetica for now)
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 15,
  },
  companyBox: {
    flex: 1,
    border: '1pt solid #ccc',
    borderRadius: 5,
    padding: 10,
  },
  sriBox: {
    flex: 1,
    border: '1pt solid #ccc',
    borderRadius: 5,
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  barcodeContainer: {
    marginTop: 10,
    alignItems: 'center',
    padding: 5,
  },
  qrContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  legend: {
    marginTop: 20,
    fontSize: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#666',
  },
  watermarkContainer: {
    position: 'absolute',
    top: 350,
    left: 50,
    opacity: 0.15,
    transform: 'rotate(-45deg)',
    zIndex: -1,
  },
  watermarkText: {
    fontSize: 90,
    color: 'red',
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColWideHeader: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
  },
  tableColWide: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableColNarrowHeader: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
  },
  tableColNarrow: {
    width: '12.5%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableCell: {
    margin: 5,
    fontSize: 8,
  },
  tableCellRight: {
    margin: 5,
    fontSize: 8,
    textAlign: 'right',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBox: {
    width: '40%',
    border: '1pt solid #ccc',
  },
  totalsRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #ccc',
  },
  totalsLabel: {
    width: '60%',
    padding: 5,
    borderRight: '1pt solid #ccc',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  totalsValue: {
    width: '40%',
    padding: 5,
    textAlign: 'right',
    fontSize: 8,
  },
});

interface RideDocumentProps {
  factura: SRIFactura;
}

export const RideDocument: React.FC<RideDocumentProps> = ({ factura }) => {
  const isPruebas = factura.infoTributaria.ambiente === '1';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {isPruebas && (
          <View style={styles.watermarkContainer} fixed>
            <Text style={styles.watermarkText}>SIN VALIDEZ</Text>
          </View>
        )}

        <View style={styles.headerContainer}>
          {/* Company Info */}
          <View style={styles.companyBox}>
            <Text style={styles.title}>{factura.infoTributaria.razonSocial}</Text>
            <View style={styles.row}>
              <Text style={styles.bold}>Dirección Matriz: </Text>
              <Text>{factura.infoTributaria.dirMatriz}</Text>
            </View>
            <View style={styles.qrContainer}>
              <Image src={factura.visuals.qrBase64} style={{ width: 100, height: 100 }} />
            </View>
          </View>

          {/* SRI Info */}
          <View style={styles.sriBox}>
            <View style={styles.row}>
              <Text style={styles.bold}>R.U.C.: </Text>
              <Text>{factura.infoTributaria.ruc}</Text>
            </View>
            <Text style={styles.title}>FACTURA</Text>
            <View style={styles.row}>
              <Text style={styles.bold}>Fecha Emisión: </Text>
              <Text>{factura.infoFactura.fechaEmision}</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.bold}>Ambiente: </Text>
              <Text>{isPruebas ? 'PRUEBAS' : 'PRODUCCIÓN'}</Text>
            </View>
            
            <View style={styles.barcodeContainer}>
              <Text style={{ fontSize: 8, marginBottom: 4, fontFamily: 'Helvetica-Bold' }}>CLAVE DE ACCESO</Text>
              <Image src={factura.visuals.barcodeBase64} style={{ width: 250, height: 35, marginBottom: 2 }} />
              <Text style={{ fontSize: 8 }}>{factura.infoTributaria.claveAcceso}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColWideHeader}>
              <Text style={styles.tableCellHeader}>Descripción</Text>
            </View>
            <View style={styles.tableColNarrowHeader}>
              <Text style={styles.tableCellHeader}>Cant.</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Precio Unit.</Text>
            </View>
            <View style={styles.tableColNarrowHeader}>
              <Text style={styles.tableCellHeader}>Desc.</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Precio Total</Text>
            </View>
          </View>
          {factura.detalles.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableColWide}>
                <Text style={styles.tableCell}>{item.nombre}</Text>
              </View>
              <View style={styles.tableColNarrow}>
                <Text style={styles.tableCellRight}>{item.cantidad}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellRight}>{item.precioUnitario.toFixed(2)}</Text>
              </View>
              <View style={styles.tableColNarrow}>
                <Text style={styles.tableCellRight}>{item.descuento.toFixed(2)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellRight}>{item.precioTotalSinImpuesto.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>SUBTOTAL 15%</Text>
              <Text style={styles.totalsValue}>{factura.infoFactura.subtotal15.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>SUBTOTAL 0%</Text>
              <Text style={styles.totalsValue}>{factura.infoFactura.subtotal0.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>SUBTOTAL Sin Impuestos</Text>
              <Text style={styles.totalsValue}>{factura.infoFactura.totalSinImpuestos.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>PROPINA</Text>
              <Text style={styles.totalsValue}>{(factura.infoFactura.propina || 0).toFixed(2)}</Text>
            </View>
            <View style={[styles.totalsRow, { borderBottom: 'none' }]}>
              <Text style={[styles.totalsLabel, { fontSize: 10 }]}>VALOR TOTAL</Text>
              <Text style={[styles.totalsValue, { fontSize: 10, fontFamily: 'Helvetica-Bold' }]}>
                {factura.infoFactura.importeTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.legend}>Documento válido únicamente con su archivo XML</Text>
      </Page>
    </Document>
  );
};

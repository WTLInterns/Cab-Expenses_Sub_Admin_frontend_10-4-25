'use client';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { toWords } from "number-to-words";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    border: "2 solid #007BFF",
  },
  logo: {
    width: 90,
    height: 80,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  companyTextWrapper: {
    flex: 1,
    marginLeft: 20,
  },
  companyInfo: {
    fontSize: 10,
    lineHeight: 1.3,
    textAlign: "left",
  },
  doubleLineContainer: {
    marginVertical: 8,
  },
  line: {
    borderBottomWidth: 1,
    borderColor: "#000",
    marginVertical: 1,
  },
  invoiceTitleCentered: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 11,
    marginVertical: 2,
  },
  infoBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  leftInfo: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.3,
  },
  rightInfo: {
    fontSize: 9,
    textAlign: "right",
    lineHeight: 1.5,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eeeeee",
    padding: 5,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  tableAmount: {
    flex: 1,
    fontSize: 10,
    textAlign: "right",
  },
  rowDivider: {
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    marginHorizontal: 5,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  totalWords: {
    flex: 1,
    fontStyle: "italic",
  },
  totalNumber: {
    flex: 1,
    textAlign: "right",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  terms: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
  },
  signBox: {
    width: 120,
    marginTop:30,
    height: 80,
  },
});

const numberToWords = (amount) => {
  return (
    toWords(amount).replace(/\b\w/g, (l) => l.toUpperCase()) +
    " Rupees Only"
  );
};

const InvoicePDF = ({
  trip,
  companyLogo,
  invoiceNumber,
  signature,
  companyInfo,
  companyPrefix,
  companyName,
  invoiceDate
}) => {
  if (!trip || !trip.cab) return null;

  const fuelAmount = trip?.cab?.fuel?.amount || 0;
  const fastTagAmount = trip?.cab?.fastTag?.amount || 0;
  const tyreAmount = trip?.cab?.tyrePuncture?.repairAmount || 0;
  const otherAmount = trip?.cab?.otherProblems?.amount || 0;

  const subtotal = fuelAmount + fastTagAmount + tyreAmount + otherAmount;
  const gst = subtotal * 0.05;
  const totalAmount = subtotal + gst;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <Image style={styles.logo} src={companyLogo || "/placeholder.svg"} />
          <View style={styles.companyTextWrapper}>
            {companyInfo ? (
              <>
                <Text style={[styles.companyInfo, { fontWeight: "bold", fontSize: 11 }]}>
                  {companyName || "Company Name"}
                </Text>
                <Text style={styles.companyInfo}>{companyInfo}</Text>
              </>
            ) : (
              <>
                <Text style={[styles.companyInfo, { fontWeight: "bold", fontSize: 11 }]}>
                  Company Name
                </Text>
                <Text style={styles.companyInfo}>Address Line 1</Text>
                <Text style={styles.companyInfo}>City, State, Zip</Text>
                <Text style={styles.companyInfo}>Phone: 0000000000</Text>
                <Text style={styles.companyInfo}>GSTIN: XXXXXXXXXXXX</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.doubleLineContainer}>
          <View style={styles.line} />
          <Text style={styles.invoiceTitleCentered}>TAX INVOICE</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.leftInfo}>
            <Text style={{ fontWeight: "bold", color: "#007BFF" }}>
              WTL TOURISM PRIVATE LIMITED
            </Text>
            <Text>Floor No.: First Floor</Text>
            <Text>
              Office No. 09, A-Building, S No.53/2A/1, City Vista, Fountain Road, Pune
            </Text>
            <Text>State: Maharashtra - 27</Text>
            <Text>Phone: 8237257618</Text>
            <Text>GSTIN: 27AADCW8531C1ZD</Text>
          </View>
          <View style={styles.rightInfo}>
            <Text>Original for Recipient</Text>
            <Text>Invoice Number: {invoiceNumber || "RADIANT-000000"}</Text>
            <Text>Invoice Date: {invoiceDate || new Date().toLocaleDateString("en-IN")}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.tableCellHeader}>Expense Type</Text>
          <Text style={[styles.tableCellHeader, { textAlign: "right" }]}>Amount</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Fuel</Text>
          <Text style={styles.tableAmount}>{fuelAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>FastTag</Text>
          <Text style={styles.tableAmount}>{fastTagAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Tyre Puncture</Text>
          <Text style={styles.tableAmount}>{tyreAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Other Problems</Text>
          <Text style={styles.tableAmount}>{otherAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { fontWeight: "bold" }]}>GST (5%)</Text>
          <Text style={styles.tableAmount}>{gst.toFixed(2)}</Text>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.totalsRow}>
          <Text style={styles.totalWords}>
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              {numberToWords(totalAmount)}
            </Text>
          </Text>
          <Text style={styles.totalNumber}>{totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.terms}>
            <Text style={{ fontWeight: "bold" }}>Terms & Conditions:</Text>
            <Text>1. Minimum ₹500 will be charged if trip is canceled.</Text>
            <Text>2. Invoice will be cancelled if not paid in 7 days.</Text>
            <Text>3. Diesel above ₹90/ltr may incur extra charges.</Text>
            <Text>4. Payment due within 15 days of invoice date.</Text>
            <Text>5. Late payments incur 2% monthly interest.</Text>
          </View>

          <View style={styles.signBox}>
            <Text style={{ fontSize: 8, textAlign: "center", marginTop: 10 }}>
              For {companyName || "________________"}
            </Text>
            {signature && <Image style={styles.signBox} src={signature} />}
            <Text style={{ fontSize: 8, textAlign: "center", marginTop: 4 }}>
              Authorized Signatory
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
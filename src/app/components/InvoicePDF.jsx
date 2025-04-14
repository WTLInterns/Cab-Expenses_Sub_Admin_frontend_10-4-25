



import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer"
import { toWords } from "number-to-words"

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
    marginTop: 30,
    height: 80,
  },
})

const numberToWords = (amount) => {
  try {
    // Handle decimal part properly
    const integerPart = Math.floor(amount)
    return toWords(integerPart).replace(/\b\w/g, (l) => l.toUpperCase()) + " Rupees Only"
  } catch (error) {
    console.error("Error converting number to words:", error)
    return "Amount in words unavailable"
  }
}

const InvoicePDF = ({
  trip,
  cabExpense,
  companyLogo,
  invoiceNumber,
  signature,
  companyInfo,
  companyPrefix,
  companyName,
  invoiceDate,
}) => {
  if (!trip || !trip.cab) return null

  // First try to use the cabExpense data from the API if available
  let fuelAmount = 0
  let fastTagAmount = 0
  let tyreAmount = 0
  let otherAmount = 0

  if (cabExpense && cabExpense.breakdown) {
    // Use the expense data from the API
    fuelAmount = Number(cabExpense.breakdown.fuel || 0)
    fastTagAmount = Number(cabExpense.breakdown.fastTag || 0)
    tyreAmount = Number(cabExpense.breakdown.tyrePuncture || 0)
    otherAmount = Number(cabExpense.breakdown.otherProblems || 0)
  } else {
    // Fall back to calculating from the trip data
    // Safely extract amounts with fallbacks to 0
    fuelAmount = Array.isArray(trip?.cab?.fuel?.amount)
      ? trip.cab.fuel.amount.reduce((sum, amt) => sum + (Number(amt) || 0), 0)
      : Number(trip?.cab?.fuel?.amount || 0)

    fastTagAmount = Array.isArray(trip?.cab?.fastTag?.amount)
      ? trip.cab.fastTag.amount.reduce((sum, amt) => sum + (Number(amt) || 0), 0)
      : Number(trip?.cab?.fastTag?.amount || 0)

    tyreAmount = Array.isArray(trip?.cab?.tyrePuncture?.repairAmount)
      ? trip.cab.tyrePuncture.repairAmount.reduce((sum, amt) => sum + (Number(amt) || 0), 0)
      : Number(trip?.cab?.tyrePuncture?.repairAmount || 0)

    otherAmount = Array.isArray(trip?.cab?.otherProblems?.amount)
      ? trip.cab.otherProblems.amount.reduce((sum, amt) => sum + (Number(amt) || 0), 0)
      : Number(trip?.cab?.otherProblems?.amount || 0)
  }

  const subtotal = fuelAmount + fastTagAmount + tyreAmount + otherAmount
  const gst = subtotal * 0.05
  const totalAmount = subtotal + gst

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
                <Text style={[styles.companyInfo, { fontWeight: "bold", fontSize: 11 }]}>Company Name</Text>
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
            <Text style={{ fontWeight: "bold", color: "#007BFF" }}>WTL TOURISM PRIVATE LIMITED</Text>
            <Text>Floor No.: First Floor</Text>
            <Text>Office No. 09, A-Building, S No.53/2A/1, City Vista, Fountain Road, Pune</Text>
            <Text>State: Maharashtra - 27</Text>
            <Text>Phone: 8237257618</Text>
            <Text>GSTIN: 27AADCW8531C1ZD</Text>
          </View>
          <View style={styles.rightInfo}>
            <Text>Original for Recipient</Text>
            <Text>Invoice Number: {invoiceNumber || "RADIANT-000000"}</Text>
            <Text>Invoice Date: {invoiceDate || new Date().toLocaleDateString("en-IN")}</Text>
            <Text>Cab Number: {trip.cab?.cabNumber || "N/A"}</Text>
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
          <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Subtotal</Text>
          <Text style={styles.tableAmount}>{subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { fontWeight: "bold" }]}>GST (5%)</Text>
          <Text style={styles.tableAmount}>{gst.toFixed(2)}</Text>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.totalsRow}>
          <Text style={styles.totalWords}>
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>{numberToWords(totalAmount)}</Text>
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
            {signature && <Image style={styles.signBox} src={signature || "/placeholder.svg"} />}
            <Text style={{ fontSize: 8, textAlign: "center", marginTop: 4 }}>Authorized Signatory</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default InvoicePDF

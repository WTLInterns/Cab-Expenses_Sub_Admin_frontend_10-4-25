// import React from "react";
// import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// // ✅ Define Styles
// const styles = StyleSheet.create({
//   page: { padding: 30, fontSize: 12, fontFamily: "Helvetica" },
//   header: { textAlign: "center", marginBottom: 20 },
//   title: { fontSize: 18, fontWeight: "bold" },
//   section: { marginBottom: 10 },
//   table: { display: "flex", flexDirection: "column", width: "100%" },
//   row: { flexDirection: "row", borderBottom: "1 solid #ddd", padding: 5 },
//   cell: { flex: 1, textAlign: "center" },
//   total: { marginTop: 10, fontSize: 14, fontWeight: "bold", textAlign: "right" },
// });

// // ✅ Invoice Component
// const InvoicePDF = ({ trip }) => {
//   if (!trip || !trip.cab) return null;

//   const totalAmount =
//     (trip?.cab?.fuel?.amount || 0) +
//     (trip?.cab?.fastTag?.amount || 0) +
//     (trip?.cab?.tyrePuncture?.repairAmount || 0) +
//     (trip?.cab?.otherProblems?.amount || 0);

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.title}>Cab Trip Invoice</Text>
//           <Text>XYZ Cabs Pvt. Ltd.</Text>
//           <Text>123, Business Road, City, Country</Text>
//           <Text>Phone: +1234567890 | Email: contact@xyzcabs.com</Text>
//         </View>

//         {/* Trip Details */}
//         <View style={styles.section}>
//           <Text>Cab Number: {trip?.cab?.cabNumber}</Text>
//           <Text>Driver: {trip?.driver?.name || "N/A"}</Text>
//           <Text>Date: {new Date(trip?.assignedAt).toLocaleDateString()}</Text>
//           <Text>From: {trip?.cab?.location?.from} → To: {trip?.cab?.location?.to}</Text>
//           <Text>Distance: {trip?.cab?.location?.totalDistance} KM</Text>
//         </View>

//         {/* Expenses Table */}
//         <View style={styles.table}>
//           <View style={[styles.row, { backgroundColor: "#000", color: "#fff" }]}>
//             <Text style={styles.cell}>Expense Type</Text>
//             <Text style={styles.cell}>Amount (₹)</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.cell}>Fuel</Text>
//             <Text style={styles.cell}>{trip?.cab?.fuel?.amount ? `₹${trip.cab.fuel.amount}` : "N/A"}</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.cell}>FastTag</Text>
//             <Text style={styles.cell}>{trip?.cab?.fastTag?.amount ? `₹${trip.cab.fastTag.amount}` : "N/A"}</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.cell}>Tyre Puncture</Text>
//             <Text style={styles.cell}>{trip?.cab?.tyrePuncture?.repairAmount ? `₹${trip.cab.tyrePuncture.repairAmount}` : "N/A"}</Text>
//           </View>
//           <View style={styles.row}>
//             <Text style={styles.cell}>Other Problems</Text>
//             <Text style={styles.cell}>{trip?.cab?.otherProblems?.amount ? `₹${trip.cab.otherProblems.amount}` : "N/A"}</Text>
//           </View>
//         </View>

//         {/* Total */}
//         <Text style={styles.total}>Total Amount: ₹{totalAmount.toFixed(2)}</Text>
//       </Page>
//     </Document>
//   );
// };

// export default InvoicePDF;

import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

// Define Styles
const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 12, fontFamily: "Helvetica", border: "2 solid black" },
    headerContainer: { 
      flexDirection: "row", 
      alignItems: "center", 
      marginBottom: 20, 
      borderBottom: "2 solid black", 
      paddingBottom: 10,
      backgroundColor: "#f2f2f2", 
      padding: 15, 
      borderRadius: 5,
    },
    logo: { width: 73, height: 70, marginRight: 15 },
    companyDetails: { flex: 1 },
    companyName: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: "#003366" },
    companyAddress: { fontSize: 12, color: "#000" }, // Changed color to black
    section: { 
      marginBottom: 15, 
      padding: 10, 
      borderBottom: "1 solid #ddd", 
      backgroundColor: "#f2f2f2", 
      borderRadius: 5 
    },
    tripDetailsText: { fontSize: 13, fontWeight: "bold", color: "#333", marginBottom: 3 },
    table: { width: "100%", marginTop: 10, border: "1 solid #1D2951" },
    row: { flexDirection: "row", borderBottom: "1 solid #ddd", padding: 8, backgroundColor: "#f9f9f9" },
    headerRow: { backgroundColor: "#333333", color: "#000", fontWeight: "bold" },
    cell: { flex: 1, textAlign: "center", fontSize: 12 },
    total: { marginTop: 15, fontSize: 14, fontWeight: "bold", textAlign: "right", borderTop: "2 solid black", paddingTop: 5 },
});

// Invoice Component
const InvoicePDF = ({ trip }) => {
  if (!trip || !trip.cab) return null;

  const totalAmount =
    (trip?.cab?.fuel?.amount || 0) +
    (trip?.cab?.fastTag?.amount || 0) +
    (trip?.cab?.tyrePuncture?.repairAmount || 0) +
    (trip?.cab?.otherProblems?.amount || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Image style={styles.logo} src="https://media.licdn.com/dms/image/v2/D4D03AQGliPQEWM90Ag/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1732192083386?e=2147483647&v=beta&t=jZaZ72VS6diSvadKUEgQAOCd_0OKpVbeP44sEOrh-Og" />
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>WTL Tourism Pvt. Ltd</Text>
            <Text style={styles.companyAddress}>
              123, Business Road, City, Country, +1234567890, contact@xyzcabs.com
            </Text>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text>Cab Number: {trip?.cab?.cabNumber}</Text>
          <Text>Driver: {trip?.driver?.name || "N/A"}</Text>
          <Text>Date: {new Date(trip?.assignedAt).toLocaleDateString()}</Text>           
          <Text>From: {trip?.cab?.location?.from} → To: {trip?.cab?.location?.to}</Text>
          <Text>Distance: {trip?.cab?.location?.totalDistance} KM</Text>
        </View>
        
        {/* Expenses Table */}
        <View style={styles.table}>
          <View style={[styles.row, { backgroundColor: "#333333", color: "#fff" }]}>
            <Text style={styles.cell}>Expense Type</Text>
            <Text style={styles.cell}>Amount (₹)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>Fuel</Text>
            <Text style={styles.cell}>{trip?.cab?.fuel?.amount ? `₹${trip.cab.fuel.amount}` : "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>FastTag</Text>
            <Text style={styles.cell}>{trip?.cab?.fastTag?.amount ? `₹${trip.cab.fastTag.amount}` : "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>Tyre Puncture</Text>
            <Text style={styles.cell}>{trip?.cab?.tyrePuncture?.repairAmount ? `₹${trip.cab.tyrePuncture.repairAmount}` : "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>Other Problems</Text>
            <Text style={styles.cell}>{trip?.cab?.otherProblems?.amount ? `₹${trip.cab.otherProblems.amount}` : "N/A"}</Text>
          </View>
        </View>

        {/* Total */}
        <Text style={styles.total}>Total Amount: ₹{totalAmount.toFixed(2)}</Text>
      </Page>
    </Document>
  );
};

export default InvoicePDF;

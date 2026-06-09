'use client';

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff' },
  title: { fontSize: 24, marginBottom: 20, color: '#0ea5e9', fontWeight: 'bold' },
  header: { fontSize: 18, marginTop: 15, marginBottom: 10, color: '#0f172a', fontWeight: 'semibold' },
  text: { fontSize: 11, marginBottom: 8, lineHeight: 1.5, color: '#334155' },
  findingCard: { marginBottom: 12, padding: 10, backgroundColor: '#f8fafc', borderRadius: 8 },
  findingTitle: { fontSize: 13, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
  metaText: { fontSize: 9, color: '#64748b', marginBottom: 3 },
  badge: { fontSize: 9, fontWeight: 'bold', marginBottom: 5 },
  hr: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginVertical: 15 },
});

interface PDFReportProps {
  result: any;
  imagePreview: string;
  scanId: string;
  date: string;
}

export const PDFReport = ({ result, imagePreview, scanId, date }: PDFReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>MedScan AI Clinical Report</Text>
      <Text style={styles.metaText}>Report ID: {scanId}</Text>
      <Text style={styles.metaText}>Date: {date}</Text>
      <Text style={styles.metaText}>AI Engine: GPT-4 Vision</Text>
      
      <View style={styles.hr} />
      
      {imagePreview && (
        <Image src={imagePreview} style={{ width: '100%', height: 'auto', marginVertical: 15 }} />
      )}
      
      <Text style={styles.header}>Clinical Summary</Text>
      <Text style={styles.text}>{result.summary}</Text>
      
      <Text style={styles.header}>Findings ({result.findings.length})</Text>
      {result.findings.map((finding: any, idx: number) => (
        <View key={idx} style={styles.findingCard}>
          <Text style={styles.findingTitle}>{finding.label}</Text>
          <Text style={styles.metaText}>Region: {finding.region}</Text>
          <Text style={styles.metaText}>Severity: {finding.severity.toUpperCase()}</Text>
          <Text style={styles.metaText}>Confidence: {finding.confidence}%</Text>
          <Text style={styles.text}>{finding.notes}</Text>
        </View>
      ))}
      
      <Text style={styles.header}>Recommendation</Text>
      <Text style={styles.text}>{result.recommendation}</Text>
      
      <View style={styles.hr} />
      <Text style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center' }}>
        AI pre-screening only - consult a licensed physician for clinical decisions
      </Text>
    </Page>
  </Document>
);
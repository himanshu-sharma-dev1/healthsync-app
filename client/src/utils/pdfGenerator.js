// PDF Generation Utility for Prescriptions
import { jsPDF } from 'jspdf';

/**
 * Generate prescription PDF
 * @param {object} prescription - Prescription data
 * @returns {jsPDF} - PDF document
 */
export const generatePrescriptionPDF = (prescription) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors
    const primaryColor = [14, 165, 233]; // Sky blue
    const textColor = [30, 41, 59];
    const mutedColor = [100, 116, 139];
    const accentColor = [16, 185, 129]; // Green

    // Header with gradient-like effect
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('HealthSync', 20, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Digital Prescription', 20, 28);

    // Prescription ID and date
    doc.setFontSize(9);
    doc.text(`ID: ${prescription.id || 'RX-' + Date.now()}`, pageWidth - 55, 18);
    doc.text(`Date: ${prescription.date || new Date().toLocaleDateString()}`, pageWidth - 55, 26);

    // Reset text color
    doc.setTextColor(...textColor);

    // Doctor info section
    let yPos = 52;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIBING PHYSICIAN', 20, yPos);

    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(prescription.doctor || 'Dr. Sarah Johnson', 20, yPos);

    yPos += 5;
    doc.setTextColor(...mutedColor);
    doc.setFontSize(9);
    doc.text(prescription.specialty || 'General Physician', 20, yPos);
    doc.text('License: MED-2024-XXXXX', 20, yPos + 4);

    // Patient info
    doc.setTextColor(...textColor);
    let patientY = 52;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT', pageWidth - 70, patientY);

    patientY += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(prescription.patient || 'Patient', pageWidth - 70, patientY);

    // Divider
    yPos = 80;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);

    // Chief Complaint
    yPos += 10;
    if (prescription.chiefComplaint) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('CHIEF COMPLAINT', 20, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.setFontSize(9);
        const ccLines = doc.splitTextToSize(prescription.chiefComplaint, pageWidth - 40);
        doc.text(ccLines, 20, yPos);
        yPos += ccLines.length * 4 + 8;
    }

    // Diagnosis
    if (prescription.diagnosis) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentColor);
        doc.text('DIAGNOSIS', 20, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.setFontSize(9);
        const diagLines = doc.splitTextToSize(prescription.diagnosis, pageWidth - 40);
        doc.text(diagLines, 20, yPos);
        yPos += diagLines.length * 4 + 8;
    }

    // Medications
    if (prescription.medications && prescription.medications.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('PRESCRIBED MEDICATIONS', 20, yPos);
        yPos += 8;

        doc.setFontSize(9);

        prescription.medications.forEach((med, idx) => {
            if (med.name && yPos < pageHeight - 60) {
                // Medication box
                doc.setFillColor(245, 247, 250);
                doc.roundedRect(20, yPos - 3, pageWidth - 40, 16, 2, 2, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...textColor);
                doc.text(`${idx + 1}. ${med.name}`, 25, yPos + 3);

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...mutedColor);
                const details = `${med.dosage || ''} | ${med.frequency || ''} | ${med.duration || ''}`;
                doc.text(details, 25, yPos + 10);

                yPos += 20;
            }
        });
        yPos += 3;
    }

    // Lab Tests
    if (prescription.labTests && yPos < pageHeight - 50) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('RECOMMENDED LAB TESTS', 20, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.setFontSize(9);
        doc.text(prescription.labTests, 20, yPos);
        yPos += 10;
    }

    // Advice - with page overflow check
    if (prescription.advice && yPos < pageHeight - 50) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('INSTRUCTIONS & ADVICE', 20, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.setFontSize(9);

        // Word wrap for advice
        const lines = doc.splitTextToSize(prescription.advice, pageWidth - 40);
        const maxLines = Math.min(lines.length, 4); // Limit lines to prevent overflow
        doc.text(lines.slice(0, maxLines), 20, yPos);
        yPos += maxLines * 4 + 8;
    }

    // Follow-up
    if (prescription.followUpDays && yPos < pageHeight - 45) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('FOLLOW-UP', 20, yPos);

        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);
        doc.setFontSize(9);
        doc.text(`Schedule follow-up in ${prescription.followUpDays} days`, 20, yPos);
    }

    // Footer - fixed position at bottom
    const footerY = pageHeight - 25;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(20, footerY, pageWidth - 20, footerY);

    doc.setFontSize(7);
    doc.setTextColor(...mutedColor);
    doc.text('This is a digitally generated prescription from HealthSync Telehealth Platform.', 20, footerY + 6);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, footerY + 11);

    // Digital signature
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text('[Digitally Verified]', pageWidth - 55, footerY + 8);

    return doc;
};

/**
 * Download prescription as PDF
 */
export const downloadPrescriptionPDF = (prescription) => {
    const doc = generatePrescriptionPDF(prescription);
    const fileName = `HealthSync_Prescription_${prescription.id || Date.now()}.pdf`;
    doc.save(fileName);
};

/**
 * Demo prescription data for testing
 */
export const demoPrescription = {
    id: 'RX-2026-001',
    date: 'Jan 17, 2026',
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Internal Medicine',
    patient: 'Demo Patient',
    chiefComplaint: 'Persistent headache and fatigue for the past week',
    diagnosis: 'Tension-type headache with mild dehydration',
    medications: [
        { name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Every 6 hours as needed', duration: '5 days' },
        { name: 'Vitamin B Complex', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' },
        { name: 'ORS Sachets', dosage: '1 sachet in 1L water', frequency: 'Twice daily', duration: '3 days' }
    ],
    labTests: 'Complete Blood Count (CBC), Blood Sugar Fasting',
    advice: 'Drink 8-10 glasses of water daily. Limit screen time. Get 7-8 hours of sleep. Reduce caffeine. Practice stress management.',
    followUpDays: 7
};

export default {
    generatePrescriptionPDF,
    downloadPrescriptionPDF,
    demoPrescription
};

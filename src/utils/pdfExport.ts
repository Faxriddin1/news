import { jsPDF } from 'jspdf';
import { DailyDigest } from '../types.ts';

export function exportDigestToPdf(digest: DailyDigest) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  // Header band
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Brand Name & Tagline
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AI PULSE — INTELLIGENCE DIGEST', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text(`Daily Executive AI Briefing • ${digest.dateStr}`, margin, 18);
  doc.text(`Report ID: ${digest.id}`, pageWidth - margin - 45, 18);

  // Emerald accent line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 27, pageWidth, 2, 'F');

  cursorY = 38;

  // Headline
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const headlineLines = doc.splitTextToSize(digest.headline, contentWidth);
  doc.text(headlineLines, margin, cursorY);
  cursorY += headlineLines.length * 6 + 6;

  // Section 1: Executive Summary
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, cursorY, contentWidth, 8, 1.5, 1.5, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('EXECUTIVE OVERVIEW', margin + 4, cursorY + 5.5);
  cursorY += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  digest.executiveSummary.forEach((bullet) => {
    if (cursorY > pageHeight - 30) {
      doc.addPage();
      cursorY = 20;
    }
    const bulletLines = doc.splitTextToSize(`• ${bullet}`, contentWidth - 6);
    doc.text(bulletLines, margin + 4, cursorY);
    cursorY += bulletLines.length * 5 + 3;
  });

  cursorY += 4;

  // Section 2: Key Breakthroughs
  if (cursorY > pageHeight - 40) {
    doc.addPage();
    cursorY = 20;
  }

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, cursorY, contentWidth, 8, 1.5, 1.5, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('KEY BREAKTHROUGHS & INDUSTRY DEVELOPMENTS', margin + 4, cursorY + 5.5);
  cursorY += 14;

  digest.keyHighlights.forEach((item, index) => {
    if (cursorY > pageHeight - 45) {
      doc.addPage();
      cursorY = 20;
    }

    // Card frame
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, cursorY, contentWidth, 24, 1.5, 1.5, 'FD');

    // Category badge
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(margin + 4, cursorY + 3, 24, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(item.category.slice(0, 12).toUpperCase(), margin + 6, cursorY + 6.8);

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const titleLines = doc.splitTextToSize(`${index + 1}. ${item.title}`, contentWidth - 40);
    doc.text(titleLines[0] || item.title, margin + 31, cursorY + 7);

    // Summary
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const sumLines = doc.splitTextToSize(item.summary, contentWidth - 10);
    doc.text(sumLines.slice(0, 2), margin + 4, cursorY + 13);

    // Source & Impact
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.text(`Source: ${item.source}  |  Impact: ${item.impact || 'High Industry Relevance'}`, margin + 4, cursorY + 21);

    cursorY += 28;
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('AI Pulse • Automated Daily Telegram Bot Digest & News Monitor', margin, pageHeight - 7);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 18, pageHeight - 7);
  }

  // Trigger download
  const cleanDate = digest.dateStr.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`AIPulse_Digest_${cleanDate}.pdf`);
}

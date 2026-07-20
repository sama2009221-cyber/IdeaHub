import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class IdeaHubTheme {
  // Deep Space Dark Mode (Premium SaaS Look)
  static const Color bgCanvas = Color(0xFF09090B); // Very dark gray/black
  static const Color bgSurface = Color(0xFF18181B); // Slightly lighter for cards
  static const Color bgSurfaceRaised = Color(0xFF27272A);
  static const Color borderSubtle = Color(0xFF3F3F46);

  static const Color accent = Color(0xFF6366F1); // Indigo
  static const Color accentHover = Color(0xFF4F46E5);
  static const Color accentSoft = Color(0x266366F1);

  static const Color textPrimary = Color(0xFFFAFAFA); // Off-white
  static const Color textSecondary = Color(0xFFA1A1AA); // Muted gray
  static const Color textMuted = Color(0xFF71717A);

  static const Color inputBg = Color(0xFF18181B);
  static const Color inputText = Color(0xFFFAFAFA);
  static const Color inputPlaceholder = Color(0xFF71717A);

  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color aiAccent = Color(0xFFA855F7); // Purple for AI

  static ThemeData get themeData {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgCanvas,
      colorScheme: const ColorScheme.dark(
        primary: accent,
        secondary: aiAccent,
        surface: bgSurface,
        background: bgCanvas,
        error: danger,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgCanvas,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: accent),
        shape: Border(bottom: BorderSide(color: borderSubtle, width: 1)),
        titleTextStyle: TextStyle(color: textPrimary, fontSize: 20, fontWeight: FontWeight.bold),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bgSurface,
        selectedItemColor: accent,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      cardTheme: CardThemeData(
        color: bgSurface,
        elevation: 4,
        shadowColor: Colors.black.withOpacity(0.4),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderSubtle, width: 1),
        ),
        margin: const EdgeInsets.only(bottom: 16),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.cairo(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
          elevation: 2,
          shadowColor: accent.withOpacity(0.5),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: inputBg,
        hintStyle: GoogleFonts.cairo(color: inputPlaceholder),
        labelStyle: GoogleFonts.cairo(
          color: textSecondary,
          fontSize: 12,
          fontWeight: FontWeight.w500,
          letterSpacing: 0,
        ),
        floatingLabelBehavior: FloatingLabelBehavior.always,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: accent, width: 2),
        ),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.tajawal(color: textPrimary, fontWeight: FontWeight.bold),
        displayMedium: GoogleFonts.tajawal(color: textPrimary, fontWeight: FontWeight.bold),
        displaySmall: GoogleFonts.tajawal(color: textPrimary, fontWeight: FontWeight.bold),
        headlineLarge: GoogleFonts.tajawal(color: textPrimary, fontWeight: FontWeight.bold),
        headlineMedium: GoogleFonts.tajawal(color: textPrimary, fontWeight: FontWeight.bold),
        headlineSmall: GoogleFonts.tajawal(color: textPrimary, fontWeight: FontWeight.bold),
        titleLarge: GoogleFonts.tajawal(color: textPrimary, fontWeight: FontWeight.bold, fontSize: 24),
        titleMedium: GoogleFonts.tajawal(color: textPrimary, fontWeight: FontWeight.w600, fontSize: 18),
        titleSmall: GoogleFonts.cairo(color: textSecondary, fontWeight: FontWeight.w500, fontSize: 14),
        bodyLarge: GoogleFonts.cairo(color: textPrimary, fontSize: 16),
        bodyMedium: GoogleFonts.cairo(color: textPrimary, fontSize: 14),
        bodySmall: GoogleFonts.cairo(color: textSecondary, fontSize: 12),
        labelLarge: GoogleFonts.cairo(color: textPrimary, fontWeight: FontWeight.w500),
      ),
    );
  }

  static TextStyle get monoTextStyle {
    return GoogleFonts.cairo(
      color: textPrimary,
      fontWeight: FontWeight.w500,
    );
  }
}

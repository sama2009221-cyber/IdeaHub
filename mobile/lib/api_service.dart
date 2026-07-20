import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // ─── Base URL ─────────────────────────────────────────────────────────────
  // For Android emulator use: http://10.0.2.2:8000/api
  // For physical device use your machine's local IP: http://192.168.x.x:8000/api
  // For web/Chrome testing use: http://localhost:8000/api
  static const String baseUrl = 'http://10.0.2.2:8000/api';

  // ─── Token Management ─────────────────────────────────────────────────────

  static Future<void> saveTokens(String access, String refresh) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', access);
    await prefs.setString('refresh_token', refresh);
  }

  static Future<String?> getAccessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  static Future<void> clearTokens() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('access_token');
    await prefs.remove('refresh_token');
    await prefs.remove('user_role');
    await prefs.remove('username');
  }

  // ─── Auth Headers ─────────────────────────────────────────────────────────

  static Future<Map<String, String>> _authHeaders() async {
    final token = await getAccessToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ─── User Profile ─────────────────────────────────────────────────────────

  static Future<void> fetchUserProfile() async {
    try {
      final headers = await _authHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/users/me/'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_role', data['role'] ?? 'employee');
        await prefs.setString('username', data['username'] ?? '');
      }
    } catch (e) {
      // Silently fail — user profile is non-critical
    }
  }

  // ─── Authentication ────────────────────────────────────────────────────────

  static Future<String?> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await saveTokens(data['access'], data['refresh']);
        await fetchUserProfile();
        return null; // null = success
      } else {
        final data = jsonDecode(response.body);
        return data['detail']?.toString() ?? 'فشل تسجيل الدخول. تحقق من بياناتك.';
      }
    } catch (e) {
      return 'خطأ في الشبكة: $e';
    }
  }

  static Future<String?> register(
    String username,
    String password,
    String email,
    String companyName,
    String role,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
          'email': email,
          'company_name': companyName,
          'role': role,
        }),
      );

      if (response.statusCode == 201) {
        // Auto-login after successful registration
        return await login(username, password);
      } else {
        try {
          final data = jsonDecode(response.body);
          if (data is Map && data.isNotEmpty) {
            final firstKey = data.keys.first;
            final firstError = data[firstKey];
            if (firstError is List && firstError.isNotEmpty) {
              return '$firstKey: ${firstError[0]}';
            }
            return firstError.toString();
          }
        } catch (_) {}
        return 'فشل التسجيل. الرمز: ${response.statusCode}';
      }
    } catch (e) {
      return 'خطأ في الشبكة: $e';
    }
  }

  // ─── Ideas ────────────────────────────────────────────────────────────────

  static Future<List<dynamic>> fetchIdeas() async {
    final headers = await _authHeaders();
    final token = await getAccessToken();
    if (token == null) throw Exception('يرجى تسجيل الدخول أولاً');

    final response = await http.get(
      Uri.parse('$baseUrl/ideas/'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('فشل تحميل الأفكار. الرمز: ${response.statusCode}');
    }
  }

  /// Submit a new idea with all optional details.
  /// Returns null on success, or an error message string on failure.
  static Future<String?> submitIdea({
    required String title,
    required String description,
    String problem = '',
    String approach = '',
    String impact = '',
    String category = 'تقنية',
  }) async {
    final token = await getAccessToken();
    if (token == null) return 'يرجى تسجيل الدخول أولاً';

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ideas/'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'title': title,
          'description': description,
          'problem': problem,
          'approach': approach,
          'impact': impact,
          'category': category,
          'status': 'submitted',
        }),
      );

      if (response.statusCode == 201) {
        return null; // Success
      } else {
        try {
          final data = jsonDecode(response.body);
          if (data is Map) {
            // Return first validation error
            for (final entry in data.entries) {
              final val = entry.value;
              if (val is List && val.isNotEmpty) {
                return '${entry.key}: ${val[0]}';
              }
              return '${entry.key}: $val';
            }
          }
        } catch (_) {}
        return 'فشل الإرسال. الرمز: ${response.statusCode}';
      }
    } catch (e) {
      return 'خطأ في الشبكة: $e';
    }
  }

  // ─── Evaluations ──────────────────────────────────────────────────────────

  static Future<bool> submitEvaluation(
    String ideaId,
    int numericScore,
    String feedbackText,
  ) async {
    final token = await getAccessToken();
    if (token == null) return false;
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ideas/$ideaId/evaluate/'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'numeric_score': numericScore,
          'feedback_text': feedbackText,
        }),
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // ─── AI Chat (RAG) ────────────────────────────────────────────────────────

  /// Ask a question about all accessible ideas (global RAG chat).
  static Future<String> chatWithAI(String question) async {
    final token = await getAccessToken();
    if (token == null) return 'يرجى تسجيل الدخول أولاً.';
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ideas/rag_chat/'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'question': question}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['answer'] ?? 'لم أتلق ردًا من المساعد الذكي.';
      }
      return 'خطأ من الخادم: ${response.statusCode}';
    } catch (e) {
      return 'خطأ في الشبكة: $e';
    }
  }

  /// Ask a question about a specific idea (per-idea RAG chat).
  static Future<String> chatAboutIdea(String ideaId, String message) async {
    final token = await getAccessToken();
    if (token == null) return 'يرجى تسجيل الدخول أولاً.';
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ideas/$ideaId/chat/'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'message': message}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['reply'] ?? 'لم أتلق ردًا.';
      }
      return 'خطأ من الخادم: ${response.statusCode}';
    } catch (e) {
      return 'خطأ في الشبكة: $e';
    }
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  static Future<List<dynamic>> fetchComments(String ideaId) async {
    final headers = await _authHeaders();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/ideas/$ideaId/comments/'),
        headers: headers,
      );
      if (response.statusCode == 200) return jsonDecode(response.body);
    } catch (_) {}
    return [];
  }

  static Future<bool> addComment(String ideaId, String text) async {
    final token = await getAccessToken();
    if (token == null) return false;
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/ideas/$ideaId/comments/'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'text': text}),
      );
      return response.statusCode == 201;
    } catch (_) {
      return false;
    }
  }
}

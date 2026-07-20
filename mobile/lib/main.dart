import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'theme.dart';
import 'api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  runApp(const IdeaHubApp());
}

class IdeaHubApp extends StatelessWidget {
  const IdeaHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'IdeaHub',
      debugShowCheckedModeBanner: false,
      theme: IdeaHubTheme.themeData,
      builder: (context, child) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: child!,
        );
      },
      home: FutureBuilder<String?>(
        future: ApiService.getAccessToken(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              backgroundColor: IdeaHubTheme.bgCanvas,
              body: Center(child: CircularProgressIndicator()),
            );
          }
          if (snapshot.hasData && snapshot.data != null && snapshot.data!.isNotEmpty) {
            return const MainScaffold();
          }
          return const LandingScreen();
        },
      ),
    );
  }
}

// ==========================================
// 1. Landing Screen (Mobile Home)
// ==========================================
class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Glow
          Positioned(
            top: -100,
            left: MediaQuery.of(context).size.width / 2 - 200,
            child: Container(
              width: 400,
              height: 400,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [IdeaHubTheme.accentSoft, Colors.transparent],
                  stops: [0.0, 0.7],
                ),
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo & Brand
                  Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8),
                          image: const DecorationImage(
                            image: AssetImage('assets/logo.png'),
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'IdeaHub',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const Spacer(),
                  // Hero Content
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    margin: const EdgeInsets.symmetric(horizontal: 40),
                    decoration: BoxDecoration(
                      color: IdeaHubTheme.bgSurface,
                      border: Border.all(color: IdeaHubTheme.borderSubtle),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('✨', style: TextStyle(fontSize: 16)),
                        const SizedBox(width: 8),
                        Text('متاح الآن للجميع', style: TextStyle(color: IdeaHubTheme.aiAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),
                  Text(
                    'حيث تصبح الأفكار العظيمة\nحقيقة.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                      height: 1.1,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'المنصة الحديثة لفرق المنتجات والهندسة لاقتراح وتقييم وتنفيذ أفضل الأفكار.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: IdeaHubTheme.textSecondary,
                      height: 1.5,
                    ),
                  ),
                  const Spacer(),
                  // CTA
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const MainScaffold()),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 20),
                    ),
                    child: const Text('ابدأ الابتكار ←', style: TextStyle(fontSize: 18)),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ==========================================
// 2. Main Scaffold (Tabs)
// ==========================================
class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _currentIndex = 1; // Start on Dashboard

  List<Widget> get _screens => [
    AuthScreen(
      onLoginSuccess: () => setState(() => _currentIndex = 1),
    ),
    const DashboardScreen(),
    const Center(child: Text("صندوق الوارد")),
    const SubmitIdeaScreen(), // NEW: Inspiring Submit Screen
    const ChatScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.login), label: 'تسجيل الدخول'),
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'لوحة القيادة'),
          BottomNavigationBarItem(icon: Icon(Icons.inbox), label: 'الوارد'),
          BottomNavigationBarItem(icon: Icon(Icons.add_circle_outline), label: 'إضافة'),
          BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline), label: 'الدردشة'),
        ],
      ),
    );
  }
}

// ==========================================
// 3. Submit Idea Screen (Fully Functional)
// ==========================================
class SubmitIdeaScreen extends StatefulWidget {
  const SubmitIdeaScreen({super.key});

  @override
  State<SubmitIdeaScreen> createState() => _SubmitIdeaScreenState();
}

class _SubmitIdeaScreenState extends State<SubmitIdeaScreen> {
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _problemController = TextEditingController();
  final _approachController = TextEditingController();
  final _impactController = TextEditingController();
  String _category = 'تقنية';
  bool _isSubmitting = false;

  final List<String> _categories = ['تقنية', 'تشغيل', 'تسويق', 'منتج', 'موارد بشرية', 'أخرى'];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _problemController.dispose();
    _approachController.dispose();
    _impactController.dispose();
    super.dispose();
  }

  void _submit() async {
    final title = _titleController.text.trim();
    final description = _descriptionController.text.trim();

    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('❗ يرجى إدخال عنوان الفكرة')),
      );
      return;
    }
    if (description.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('❗ يرجى إدخال وصف الفكرة')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final error = await ApiService.submitIdea(
      title: title,
      description: description,
      problem: _problemController.text.trim(),
      approach: _approachController.text.trim(),
      impact: _impactController.text.trim(),
      category: _category,
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (error == null) {
      // Clear all fields on success
      _titleController.clear();
      _descriptionController.clear();
      _problemController.clear();
      _approachController.clear();
      _impactController.clear();
      setState(() => _category = 'تقنية');

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ تم إرسال فكرتك ويجري تقييمها بالذكاء الاصطناعي!'),
          backgroundColor: Color(0xFF10B981),
          duration: Duration(seconds: 4),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ خطأ: $error'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  Widget _buildField({
    required TextEditingController controller,
    required String hint,
    int maxLines = 1,
    TextStyle? style,
  }) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      style: style,
      decoration: InputDecoration(
        hintText: hint,
        border: InputBorder.none,
        enabledBorder: InputBorder.none,
        focusedBorder: InputBorder.none,
        filled: false,
        contentPadding: EdgeInsets.zero,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Stack(
        children: [
          // Subtle glow background
          Positioned(
            top: -50,
            right: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [IdeaHubTheme.accentSoft, Colors.transparent],
                  stops: [0.0, 0.7],
                ),
              ),
            ),
          ),
          SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 24),
                Text(
                  'ما هي فكرتك الكبيرة التالية؟',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'شارك رؤيتك. سيقيّمها الذكاء الاصطناعي تلقائيًا عبر Groq AI.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: IdeaHubTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 32),

                // Category Selector
                DropdownButtonFormField<String>(
                  value: _category,
                  decoration: InputDecoration(
                    labelText: 'التصنيف',
                    filled: true,
                    fillColor: IdeaHubTheme.bgSurface,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  items: _categories
                      .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                      .toList(),
                  onChanged: (val) => setState(() => _category = val ?? _category),
                ),
                const SizedBox(height: 16),

                // Main Idea Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: IdeaHubTheme.bgSurface,
                    border: Border.all(color: IdeaHubTheme.borderSubtle),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildField(
                        controller: _titleController,
                        hint: 'عنوان الفكرة...',
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const Divider(color: IdeaHubTheme.borderSubtle, height: 28),
                      _buildField(
                        controller: _descriptionController,
                        hint: 'صف فكرتك بالتفصيل...',
                        maxLines: 5,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Optional detail fields
                _buildDetailCard(
                  icon: Icons.search,
                  label: 'المشكلة المراد حلها',
                  hint: 'ما هي المشكلة التي تحاول حلها؟ لماذا هذا مهم؟',
                  controller: _problemController,
                ),
                const SizedBox(height: 12),
                _buildDetailCard(
                  icon: Icons.build_circle_outlined,
                  label: 'الحل المقترح / النهج',
                  hint: 'كيف ستعالج هذه المشكلة؟ ما هي خطوات التنفيذ؟',
                  controller: _approachController,
                ),
                const SizedBox(height: 12),
                _buildDetailCard(
                  icon: Icons.trending_up,
                  label: 'التأثير المتوقع',
                  hint: 'ما هي الفائدة على الشركة؟ ما هي مؤشرات النجاح؟',
                  controller: _impactController,
                ),
                const SizedBox(height: 20),

                // AI Tip
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: IdeaHubTheme.aiAccent.withOpacity(0.08),
                    border: Border.all(color: IdeaHubTheme.aiAccent.withOpacity(0.25)),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.auto_awesome, color: IdeaHubTheme.aiAccent, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'نصيحة: كلما ملأت حقول المشكلة والنهج والتأثير، كلما حصلت على درجات AI أفضل!',
                          style: TextStyle(
                            color: IdeaHubTheme.aiAccent,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),

                // Submit Button
                _isSubmitting
                    ? const Center(child: CircularProgressIndicator())
                    : ElevatedButton.icon(
                        onPressed: _submit,
                        icon: const Icon(Icons.rocket_launch),
                        label: const Text('إرسال لتقييم الذكاء الاصطناعي ✨'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 18),
                        ),
                      ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailCard({
    required IconData icon,
    required String label,
    required String hint,
    required TextEditingController controller,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: IdeaHubTheme.bgSurface,
        border: Border.all(color: IdeaHubTheme.borderSubtle),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: IdeaHubTheme.textSecondary, size: 16),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  color: IdeaHubTheme.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '(اختياري)',
                style: TextStyle(color: IdeaHubTheme.textSecondary.withOpacity(0.5), fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: controller,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: hint,
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              filled: false,
              contentPadding: EdgeInsets.zero,
              hintStyle: const TextStyle(fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}

// ==========================================
// 4. Placeholder Login
// ==========================================
class AuthScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;
  const AuthScreen({super.key, required this.onLoginSuccess});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLogin = true;
  String? _selectedRole;
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _companyController = TextEditingController();
  bool _isLoading = false;

  void _submit() async {
    setState(() => _isLoading = true);
    String? errorMessage;
    if (_isLogin) {
      errorMessage = await ApiService.login(_usernameController.text, _passwordController.text);
    } else {
      errorMessage = await ApiService.register(
        _usernameController.text, 
        _passwordController.text, 
        _emailController.text, 
        _companyController.text, 
        _selectedRole ?? 'employee'
      );
    }
    
    if (!mounted) return;
    setState(() => _isLoading = false);
    
    if (errorMessage == null) {
      widget.onLoginSuccess();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                width: 64,
                height: 64,
                margin: const EdgeInsets.only(bottom: 24),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  image: const DecorationImage(
                    image: AssetImage('assets/logo.png'),
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              Text(
                _isLogin ? 'مرحباً بعودتك' : 'إنشاء حساب',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                _isLogin ? 'قم بتسجيل الدخول للمتابعة إلى IdeaHub' : 'انضم إلى فريقك في IdeaHub',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: IdeaHubTheme.textSecondary,
                    ),
              ),
              const SizedBox(height: 48),
              TextField(
                controller: _usernameController,
                decoration: const InputDecoration(
                  labelText: 'اسم المستخدم',
                ),
              ),
              if (!_isLogin) ...[
                const SizedBox(height: 24),
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'البريد الإلكتروني (اختياري)',
                  ),
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: _companyController,
                  decoration: const InputDecoration(
                    labelText: 'اسم الشركة',
                  ),
                ),
                const SizedBox(height: 24),
                DropdownButtonFormField<String>(
                  decoration: const InputDecoration(labelText: 'دورك'),
                  value: _selectedRole,
                  items: const [
                    DropdownMenuItem(value: 'employee', child: Text('موظف')),
                    DropdownMenuItem(value: 'manager', child: Text('مدير قسم')),
                    DropdownMenuItem(value: 'owner', child: Text('مالك / مدير تنفيذي')),
                  ],
                  onChanged: (val) {
                    setState(() {
                      _selectedRole = val;
                    });
                  },
                ),
              ],
              const SizedBox(height: 24),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'كلمة المرور',
                ),
              ),
              const SizedBox(height: 48),
              _isLoading ? const Center(child: CircularProgressIndicator()) : ElevatedButton(
                onPressed: _submit,
                child: Text(_isLogin ? 'تسجيل الدخول' : 'التسجيل'),
              ),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () {
                  setState(() {
                    _isLogin = !_isLogin;
                  });
                },
                child: Text(
                  _isLogin ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب بالفعل؟ سجل الدخول",
                  style: const TextStyle(color: IdeaHubTheme.accent),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ==========================================
// 5. Dashboard Screen
// ==========================================
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<dynamic> _ideas = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadIdeas();
  }

  void _loadIdeas() async {
    try {
      final ideas = await ApiService.fetchIdeas();
      setState(() {
        _ideas = ideas;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_ideas.isEmpty) {
      return const Center(child: Text("لم يتم العثور على أفكار"));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _ideas.length,
      itemBuilder: (context, index) {
        final idea = _ideas[index];
        return Card(
          color: IdeaHubTheme.bgSurface,
          margin: const EdgeInsets.only(bottom: 16),
          child: ListTile(
            title: Text(idea['title'] ?? 'بدون عنوان', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(idea['category'] ?? ''),
            trailing: Text(idea['status'] ?? ''),
            onTap: () {
              Navigator.push(context, MaterialPageRoute(
                builder: (context) => IdeaDetailScreen(idea: idea)
              ));
            },
          ),
        );
      },
    );
  }
}

class IdeaDetailScreen extends StatefulWidget {
  final Map<String, dynamic> idea;
  const IdeaDetailScreen({super.key, required this.idea});

  @override
  State<IdeaDetailScreen> createState() => _IdeaDetailScreenState();
}

class _IdeaDetailScreenState extends State<IdeaDetailScreen> {
  String? _userRole;
  int _starRating = 0; // 0 to 5
  int _numericScore = 0; // 0 to 10
  final TextEditingController _feedbackController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadRole();
  }

  Future<void> _loadRole() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userRole = prefs.getString('user_role') ?? 'employee';
    });
  }

  Future<void> _submitEvaluation() async {
    final text = _feedbackController.text.trim();
    if (_numericScore == 0 || text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("الرجاء تقديم تقييم وملاحظات.")));
      return;
    }
    
    final success = await ApiService.submitEvaluation(widget.idea['id'], _numericScore, text);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("تم إرسال التقييم الاستراتيجي!")));
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("فشل إرسال التقييم.")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.idea['title'] ?? 'التفاصيل')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("الفئة: ${widget.idea['category']}", style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 16),
            Text(widget.idea['description'] ?? 'لم يتم تقديم وصف.'),
            const SizedBox(height: 32),
            if (_userRole == 'employee')
              const Text("التقييمات مقتصرة على المدراء والملاك.", style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic))
            else ...[
              const Text("تقييمك", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              const Text("التقييم بالنجوم (الانطباع العام)"),
              Row(
                children: List.generate(5, (index) {
                  return IconButton(
                    icon: Icon(
                      index < _starRating ? Icons.star : Icons.star_border,
                      color: Colors.amber,
                      size: 32,
                    ),
                    onPressed: () {
                      setState(() {
                        _starRating = index + 1;
                        _numericScore = _starRating * 2;
                      });
                    },
                  );
                }),
              ),
              const SizedBox(height: 16),
              Text("الدرجة الرقمية (1-10): $_numericScore", style: const TextStyle(fontWeight: FontWeight.bold)),
              Slider(
                value: _numericScore.toDouble(),
                min: 0,
                max: 10,
                divisions: 10,
                label: _numericScore.toString(),
                activeColor: IdeaHubTheme.accent,
                onChanged: (val) {
                  setState(() {
                    _numericScore = val.toInt();
                    _starRating = (_numericScore / 2).ceil();
                  });
                },
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _feedbackController,
                decoration: const InputDecoration(
                  labelText: 'الملاحظات المهنية',
                  hintText: 'شارك رؤيتك الاستراتيجية للمساعدة في دفع هذه الفكرة إلى الأمام!',
                ),
                maxLines: 4,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _submitEvaluation,
                style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
                child: const Text("إرسال التقييم الاستراتيجي"),
              )
            ]
          ],
        ),
      ),
    );
  }
}

// ==========================================
// 6. Chat Screen
// ==========================================
class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, String>> _messages = [];
  bool _isLoading = false;

  void _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'sender': 'user', 'text': text});
      _isLoading = true;
    });
    _controller.clear();

    final response = await ApiService.chatWithAI(text);
    
    if (!mounted) return;
    setState(() {
      _messages.add({'sender': 'ai', 'text': response});
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            width: double.infinity,
            color: IdeaHubTheme.bgSurface,
            child: const Text("المساعد الذكي", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg['sender'] == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerLeft : Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: isUser ? IdeaHubTheme.accent : IdeaHubTheme.bgSurface,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      msg['text']!,
                      style: TextStyle(color: isUser ? Colors.white : IdeaHubTheme.textPrimary),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isLoading)
            const Padding(
               padding: EdgeInsets.all(8.0),
              child: CircularProgressIndicator(),
            ),
          Container(
            padding: const EdgeInsets.all(16),
            color: IdeaHubTheme.bgSurface,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: "اسأل عن أفكارك...",
                      border: InputBorder.none,
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: IdeaHubTheme.accent),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}

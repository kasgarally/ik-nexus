/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Arabic app messages
 */
export default {
  brand: 'Nexus GovRN',
  themeToggle: 'تبديل المظهر',
  nav: {
    home: 'الرئيسية',
    filesTest: 'اختبار الملفات',
    listsTest: 'اختبار القوائم',
    workspace: 'مع السياق',
    signin: 'تسجيل الدخول',
  },
  listsTest: {
    title: 'اختبار القوائم',
    body: 'محررات الإعداد تكتب عبر lists.insert / update / remove. بطاقة الإدخال هي نموذج مخاطر لاحق: يعرض v-select العنوان حسب اللغة ويخزّن الرمز.',
    credentials: 'سجّل الدخول بـ {email} / {password} (مسؤول تجريبي محلي).',
    setupHint: 'أضف أو عدّل أو احذف عناصر هذا listKey. الصفوف غير النشطة تبقى هنا وتختفي من v-select.',
    setupCategory: 'إعداد: demo.category',
    setupLikelihood: 'إعداد: demo.likelihood',
    captureTitle: 'نموذج الإدخال (v-select)',
    captureHint: 'غيّر اللغة من الشريط. تتغير التسميات وتبقى الرموز.',
    category: 'الفئة',
    likelihood: 'الاحتمال',
    selected: 'الرموز المختارة: {category} / {likelihood}',
  },
  filesTest: {
    title: 'اختبار الملفات',
    body: 'أربع صيغ. الاستبدال يرفع الملف الجديد أولاً ثم يحذف السابق. المعرض يفتح عرضاً مكبراً.',
    oneDocTitle: '1. مستند واحد',
    oneDocHint: 'حقل بدبوس الورق لـ PDF وOffice وtxt وcsv. يظهر الاسم والرابط أسفل الحقل بدون معاينة صورة.',
    oneAvatarTitle: '2. صورة رمزية',
    oneAvatarHint: 'انقر الصورة (أو الدائرة الفارغة) لاختيار صورة. الشكل والحجم بالبكسل خصائص.',
    manyDocTitle: '3. مستندات متعددة',
    manyDocHint: 'أضف عدة مستندات. تبقى في قائمة.',
    manyImagesTitle: '4. معرض صور',
    manyImagesHint: 'أضف عدة صور. انقر المصغّر لفتح العرض المكبر.',
  },
  home: {
    title: 'مرحباً',
    body: 'تأتي التخطيطات من route.meta.layout. الرئيسية تستخدم تخطيط الويب بعرض واحد. مساحة العمل تضيف لوحة سياق. تسجيل الدخول يستخدم تخطيط المصادقة.',
    openWorkspace: 'فتح مساحة العمل',
    signin: 'تسجيل الدخول',
    vuetifyChrome: 'واجهة Vuetify (الجدول الفارغ يستخدم كتالوج $vuetify)',
    tableName: 'الاسم',
    tableStatus: 'الحالة',
  },
  auth: {
    title: 'تسجيل الدخول',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    submit: 'دخول',
    signOut: 'تسجيل الخروج',
    signedIn: 'مسجّل الدخول كـ {email}.',
    demoHint: "المسؤول التجريبي المحلي هو admin{'@'}localhost / admin.",
    back: 'العودة إلى التطبيق',
  },
  context1: {
    title: 'السياق 1',
    body: 'المكوّن الأول الذي يستضيفه Context.vue.',
  },
  context2: {
    title: 'السياق 2',
    body: 'المكوّن الثاني الذي يستضيفه Context.vue.',
  },
  footer: 'INTELLEKTRA © 2026',
}

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.benefits": "Benefits",
    "nav.courses": "Courses",
    "nav.howItWorks": "How It Works",
    "nav.faq": "FAQ",
    "nav.getCard": "GET YOUR CARD",

    // Hero
    "hero.location": "PUERTO RICO · 15 PARTNER COURSES",
    "hero.playMore": "Play More.",
    "hero.payLess": "Pay Less.",
    "hero.description": "One membership unlocks up to 25% off green fees at Puerto Rico's finest courses — from TPC Dorado Beach to Royal Isabela.",
    "hero.stats.courses": "PARTNER COURSES",
    "hero.stats.savings": "MAX SAVINGS",
    "hero.stats.price": "PER YEAR",
    "hero.cta": "GET YOUR CARD — $199/YR",
    "hero.viewCourses": "VIEW ALL COURSES",

    // Benefits
    "benefits.title": "Why Join Links Golf?",
    "benefits.benefit1.title": "Instant Access",
    "benefits.benefit1.desc": "Play immediately at all 15 partner courses with your digital pass.",
    "benefits.benefit2.title": "Unbeatable Savings",
    "benefits.benefit2.desc": "Save up to $200 per year with 25% discounts on green fees.",
    "benefits.benefit3.title": "No Blackout Dates",
    "benefits.benefit3.desc": "Play whenever you want—weekdays, weekends, holidays.",
    "benefits.benefit4.title": "Digital Pass",
    "benefits.benefit4.desc": "Photo-verified, non-transferable ID. No physical card needed.",

    // Courses
    "courses.title": "Our Network",
    "courses.subtitle": "15 courses across Puerto Rico. All included.",
    "courses.viewDirectory": "View full course directory →",
    "courses.filter.all": "ALL",
    "courses.filter.resort": "RESORT",
    "courses.filter.club": "CLUB",

    // How It Works
    "howItWorks.title": "From sign-up to first tee in minutes.",
    "howItWorks.step1": "Sign Up",
    "howItWorks.step1Desc": "Provide your details and upload a selfie.",
    "howItWorks.step2": "Get Your Card",
    "howItWorks.step2Desc": "Digital pass appears instantly in your wallet.",
    "howItWorks.step3": "Play",
    "howItWorks.step3Desc": "Show your pass at any partner course and enjoy your discount.",

    // Pricing
    "pricing.title": "Start playing more today.",
    "pricing.subtitle": "Unlock every major course in Puerto Rico. Pays for itself in as few as 3–4 rounds.",
    "pricing.price": "$199",
    "pricing.period": "/year",
    "pricing.residentOnly": "PUERTO RICO RESIDENTS ONLY",
    "pricing.details": "DETAILS",
    "pricing.payment": "PAYMENT",
    "pricing.digitalId": "DIGITAL ID",
    "pricing.playerDetails": "Player Details",
    "pricing.firstName": "First Name",
    "pricing.lastName": "Last Name",
    "pricing.phone": "Phone",
    "pricing.email": "Email Address",
    "pricing.address": "Address",
    "pricing.verificationPhoto": "Verification Photo",
    "pricing.photoRequired": "Required: Front-facing. Used for Digital ID only.",
    "pricing.takeUploadPhoto": "Take or Upload Photo",
    "pricing.continuePayment": "CONTINUE TO PAYMENT",
    "pricing.payNow": "PAY $199 & GET MY CARD",
    "pricing.cardNumber": "Card Number",
    "pricing.expiry": "EXPIRY",
    "pricing.cvv": "CVV",
    "pricing.nameOnCard": "Name on Card",
    "pricing.terms": "Terms of Service",
    "pricing.privacy": "Privacy Policy",
    "pricing.agree": "By continuing, you agree to our",
    "pricing.success": "Welcome to Links Golf!",
    "pricing.successDesc": "Your membership is active. Add your digital pass to your wallet and start playing.",
    "pricing.addAppleWallet": "🍎 Add to Apple Wallet",
    "pricing.addGoogleWallet": "🤖 Add to Google Wallet",
    "pricing.goToDashboard": "GO TO MY DASHBOARD",
    "pricing.checkEmail": "Check your email for membership details and course information.",

    // FAQ
    "faq.title": "Common questions.",
    "faq.q1": "What is Links Golf Membership?",
    "faq.a1": "Your all-in-one membership to premium golf across Puerto Rico. Instant access to exclusive discounts of every partner course, a digital wallet pass, and a verified photo ID — no physical card needed.",
    "faq.q2": "Who can join?",
    "faq.a2": "Puerto Rico residents only. You'll need a valid Puerto Rico ID or proof of residency.",
    "faq.q3": "Do I need to download an app?",
    "faq.a3": "No. Your membership lives in your phone's native wallet (Apple Wallet or Google Pay). Just show your pass at the course.",
    "faq.q4": "How do I use it at the course?",
    "faq.a4": "Open your wallet, show your Links Golf pass to the pro shop, and enjoy your discount. It's that simple.",
    "faq.q5": "What if I lose my phone?",
    "faq.a5": "Your pass is tied to your account. Log in from any device and re-add it to your wallet.",
    "faq.q6": "Is the membership transferable?",
    "faq.a6": "No. Your photo-verified pass is non-transferable and tied to your identity.",
    "faq.q7": "When does my membership renew?",
    "faq.a7": "Your membership renews annually on the anniversary of your sign-up date. You'll receive a renewal reminder 30 days before expiration.",
    "faq.stillHaveQuestions": "Still have questions?",
    "faq.contactUs": "Contact us at",

    // Footer
    "footer.benefits": "Benefits",
    "footer.ourNetwork": "Our Network",
    "footer.howItWorks": "How It Works",
    "footer.getYourCard": "Get Your Card",
    "footer.faq": "FAQ",
    "footer.contactUs": "Contact Us",
    "footer.email": "info@linksgolfpr.com",
    "footer.copyright": "© 2026 Links Golf. All rights reserved.",

    // Dashboard
    "dashboard.welcome": "Welcome back,",
    "dashboard.memberSince": "Member since",
    "dashboard.renewalDate": "Renewal Date",
    "dashboard.courseAccess": "Course Access",
    "dashboard.courses": "courses",
    "dashboard.support": "Support",
    "dashboard.downloadPass": "Download Pass",
    "dashboard.copyNumber": "Copy Number",
    "dashboard.accountDetails": "Account Details",
    "dashboard.fullName": "Full Name",
    "dashboard.phone": "Phone",
    "dashboard.email": "Email",
    "dashboard.logout": "Logout",

    // Login
    "login.title": "Welcome Back",
    "login.subtitle": "Sign in to access your membership and dashboard.",
    "login.email": "Email Address",
    "login.password": "Password",
    "login.signIn": "SIGN IN",
    "login.noAccount": "Don't have an account?",
    "login.signUp": "Sign up here",
    "login.forgotPassword": "Forgot password?",
  },
  es: {
    // Navigation
    "nav.benefits": "Beneficios",
    "nav.courses": "Cursos",
    "nav.howItWorks": "Cómo Funciona",
    "nav.faq": "Preguntas",
    "nav.getCard": "OBTÉN TU TARJETA",

    // Hero
    "hero.location": "PUERTO RICO · 15 CAMPOS ASOCIADOS",
    "hero.playMore": "Juega Más.",
    "hero.payLess": "Paga Menos.",
    "hero.description": "Una membresía te da acceso a descuentos de hasta 25% en los mejores campos de Puerto Rico — desde TPC Dorado Beach hasta Royal Isabela.",
    "hero.stats.courses": "CAMPOS ASOCIADOS",
    "hero.stats.savings": "AHORROS MÁXIMOS",
    "hero.stats.price": "POR AÑO",
    "hero.cta": "OBTÉN TU TARJETA — $199/AÑO",
    "hero.viewCourses": "VER TODOS LOS CAMPOS",

    // Benefits
    "benefits.title": "¿Por Qué Unirse a Links Golf?",
    "benefits.benefit1.title": "Acceso Instantáneo",
    "benefits.benefit1.desc": "Juega inmediatamente en los 15 campos asociados con tu pase digital.",
    "benefits.benefit2.title": "Ahorros Incomparables",
    "benefits.benefit2.desc": "Ahorra hasta $200 por año con descuentos del 25% en tarifas de green.",
    "benefits.benefit3.title": "Sin Fechas Bloqueadas",
    "benefits.benefit3.desc": "Juega cuando quieras — entre semana, fines de semana, días festivos.",
    "benefits.benefit4.title": "Pase Digital",
    "benefits.benefit4.desc": "ID verificado con foto, no transferible. No se necesita tarjeta física.",

    // Courses
    "courses.title": "Nuestra Red",
    "courses.subtitle": "15 campos en Puerto Rico. Todos incluidos.",
    "courses.viewDirectory": "Ver directorio completo de campos →",
    "courses.filter.all": "TODOS",
    "courses.filter.resort": "RESORT",
    "courses.filter.club": "CLUB",

    // How It Works
    "howItWorks.title": "Del registro al primer golpe en minutos.",
    "howItWorks.step1": "Regístrate",
    "howItWorks.step1Desc": "Proporciona tus datos y carga una selfie.",
    "howItWorks.step2": "Obtén Tu Tarjeta",
    "howItWorks.step2Desc": "El pase digital aparece instantáneamente en tu billetera.",
    "howItWorks.step3": "Juega",
    "howItWorks.step3Desc": "Muestra tu pase en cualquier campo asociado y disfruta tu descuento.",

    // Pricing
    "pricing.title": "Comienza a jugar más hoy.",
    "pricing.subtitle": "Desbloquea todos los campos principales de Puerto Rico. Se paga por sí solo en 3-4 rondas.",
    "pricing.price": "$199",
    "pricing.period": "/año",
    "pricing.residentOnly": "SOLO RESIDENTES DE PUERTO RICO",
    "pricing.details": "DETALLES",
    "pricing.payment": "PAGO",
    "pricing.digitalId": "ID DIGITAL",
    "pricing.playerDetails": "Detalles del Jugador",
    "pricing.firstName": "Nombre",
    "pricing.lastName": "Apellido",
    "pricing.phone": "Teléfono",
    "pricing.email": "Correo Electrónico",
    "pricing.address": "Dirección",
    "pricing.verificationPhoto": "Foto de Verificación",
    "pricing.photoRequired": "Requerido: De frente. Se usa solo para ID Digital.",
    "pricing.takeUploadPhoto": "Tomar o Cargar Foto",
    "pricing.continuePayment": "CONTINUAR AL PAGO",
    "pricing.payNow": "PAGAR $199 Y OBTÉN MI TARJETA",
    "pricing.cardNumber": "Número de Tarjeta",
    "pricing.expiry": "VENCIMIENTO",
    "pricing.cvv": "CVV",
    "pricing.nameOnCard": "Nombre en la Tarjeta",
    "pricing.terms": "Términos de Servicio",
    "pricing.privacy": "Política de Privacidad",
    "pricing.agree": "Al continuar, aceptas nuestros",
    "pricing.success": "¡Bienvenido a Links Golf!",
    "pricing.successDesc": "Tu membresía está activa. Agrega tu pase digital a tu billetera y comienza a jugar.",
    "pricing.addAppleWallet": "🍎 Agregar a Apple Wallet",
    "pricing.addGoogleWallet": "🤖 Agregar a Google Wallet",
    "pricing.goToDashboard": "IR A MI PANEL",
    "pricing.checkEmail": "Revisa tu correo electrónico para detalles de membresía e información de campos.",

    // FAQ
    "faq.title": "Preguntas frecuentes.",
    "faq.q1": "¿Qué es la Membresía Links Golf?",
    "faq.a1": "Tu membresía todo en uno para golf premium en Puerto Rico. Acceso instantáneo a descuentos exclusivos en todos los campos asociados, un pase de billetera digital e ID de foto verificada — sin tarjeta física necesaria.",
    "faq.q2": "¿Quién puede unirse?",
    "faq.a2": "Solo residentes de Puerto Rico. Necesitarás una ID válida de Puerto Rico o comprobante de residencia.",
    "faq.q3": "¿Necesito descargar una aplicación?",
    "faq.a3": "No. Tu membresía vive en la billetera nativa de tu teléfono (Apple Wallet o Google Pay). Solo muestra tu pase en el campo.",
    "faq.q4": "¿Cómo lo uso en el campo?",
    "faq.a4": "Abre tu billetera, muestra tu pase Links Golf a la pro shop y disfruta tu descuento. Es así de simple.",
    "faq.q5": "¿Qué pasa si pierdo mi teléfono?",
    "faq.a5": "Tu pase está vinculado a tu cuenta. Inicia sesión desde cualquier dispositivo y vuelve a agregarlo a tu billetera.",
    "faq.q6": "¿Es la membresía transferible?",
    "faq.a6": "No. Tu pase verificado con foto es no transferible y está vinculado a tu identidad.",
    "faq.q7": "¿Cuándo se renueva mi membresía?",
    "faq.a7": "Tu membresía se renueva anualmente en el aniversario de tu fecha de registro. Recibirás un recordatorio de renovación 30 días antes del vencimiento.",
    "faq.stillHaveQuestions": "¿Aún tienes preguntas?",
    "faq.contactUs": "Contáctanos en",

    // Footer
    "footer.benefits": "Beneficios",
    "footer.ourNetwork": "Nuestra Red",
    "footer.howItWorks": "Cómo Funciona",
    "footer.getYourCard": "Obtén Tu Tarjeta",
    "footer.faq": "Preguntas",
    "footer.contactUs": "Contáctanos",
    "footer.email": "info@linksgolfpr.com",
    "footer.copyright": "© 2026 Links Golf. Todos los derechos reservados.",

    // Dashboard
    "dashboard.welcome": "Bienvenido de vuelta,",
    "dashboard.memberSince": "Miembro desde",
    "dashboard.renewalDate": "Fecha de Renovación",
    "dashboard.courseAccess": "Acceso a Campos",
    "dashboard.courses": "campos",
    "dashboard.support": "Soporte",
    "dashboard.downloadPass": "Descargar Pase",
    "dashboard.copyNumber": "Copiar Número",
    "dashboard.accountDetails": "Detalles de la Cuenta",
    "dashboard.fullName": "Nombre Completo",
    "dashboard.phone": "Teléfono",
    "dashboard.email": "Correo Electrónico",
    "dashboard.logout": "Cerrar Sesión",

    // Login
    "login.title": "Bienvenido de Vuelta",
    "login.subtitle": "Inicia sesión para acceder a tu membresía y panel.",
    "login.email": "Correo Electrónico",
    "login.password": "Contraseña",
    "login.signIn": "INICIAR SESIÓN",
    "login.noAccount": "¿No tienes cuenta?",
    "login.signUp": "Regístrate aquí",
    "login.forgotPassword": "¿Olvidaste tu contraseña?",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language") as Language | null;
      if (saved && (saved === "en" || saved === "es")) {
        return saved;
      }
    }
    return "en";
  });

  // Save to localStorage whenever language changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

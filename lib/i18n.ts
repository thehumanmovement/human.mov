export type Lang = 'en' | 'es'

const translations = {
  en: {
    // Header
    headingLine1: 'The Human',
    headingLine2: 'Movement.',
    // Form step
    placeholderName: 'Full name *',
    placeholderEmail: 'Email *',
    placeholderZip: 'Zip code (optional)',
    buttonJoin: 'Join the Movement',
    buttonJoinLoading: 'One moment...',
    // Verify email step
    checkInbox: 'Check your inbox.',
    sentCode: 'We sent a 6-digit code to',
    codePlaceholder: '000000',
    verifyEmail: 'Verify email',
    verifying: 'Verifying...',
    goBack: 'Go back',
    // Phone step
    emailVerified: 'Email verified.',
    nowPhone: 'Now, your phone.',
    phonePlaceholder: '+1 (555) 000-0000',
    sendCode: 'Send verification code',
    sendingCode: 'Sending code...',
    // Verify phone step
    almostThere: 'Almost there.',
    textedCode: 'We texted a code to',
    verifyPhone: 'Verify phone',
    differentNumber: 'Use a different number',
    // Welcome step
    welcomeTo: 'Welcome to',
    theHuman: 'The Human',
    movement: 'Movement.',
    moreSoon: 'More soon',
    // API error messages
    errorNameRequired: 'Full name is required',
    errorEmailRequired: 'Email is required',
    // Email template
    emailSubject: 'Your verification code',
    emailHeading: 'The Human Movement',
    emailBody: 'Your verification code:',
    emailExpiry: 'This code expires in 10 minutes.',
    // SMS
    smsBody: 'The Human Movement — your code is {code}',
  },
  es: {
    headingLine1: 'El Movimiento',
    headingLine2: 'Humano.',
    placeholderName: 'Nombre completo *',
    placeholderEmail: 'Correo electrónico *',
    placeholderZip: 'Código postal (opcional)',
    buttonJoin: 'Únete al Movimiento',
    buttonJoinLoading: 'Un momento...',
    checkInbox: 'Revisa tu bandeja.',
    sentCode: 'Enviamos un código de 6 dígitos a',
    codePlaceholder: '000000',
    verifyEmail: 'Verificar correo',
    verifying: 'Verificando...',
    goBack: 'Volver',
    emailVerified: 'Correo verificado.',
    nowPhone: 'Ahora, tu teléfono.',
    phonePlaceholder: '+1 (555) 000-0000',
    sendCode: 'Enviar código de verificación',
    sendingCode: 'Enviando código...',
    almostThere: 'Ya casi.',
    textedCode: 'Enviamos un código a',
    verifyPhone: 'Verificar teléfono',
    differentNumber: 'Usar otro número',
    welcomeTo: 'Bienvenido a',
    theHuman: 'El Movimiento',
    movement: 'Humano.',
    moreSoon: 'Próximamente',
    errorNameRequired: 'El nombre completo es obligatorio',
    errorEmailRequired: 'El correo electrónico es obligatorio',
    emailSubject: 'Tu código de verificación',
    emailHeading: 'El Movimiento Humano',
    emailBody: 'Tu código de verificación:',
    emailExpiry: 'Este código caduca en 10 minutos.',
    smsBody: 'El Movimiento Humano — tu código es {code}',
  },
} as const

export type TranslationKey = keyof typeof translations['en']

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang][key]
}

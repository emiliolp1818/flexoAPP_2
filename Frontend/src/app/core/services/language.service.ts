import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Language = 'es' | 'en' | 'pt' | 'fr' | 'de';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private currentLanguage = signal<Language>('es');


  private readonly LANGUAGE_KEY = 'flexoapp_language';


  public readonly availableLanguages: LanguageInfo[] = [
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' }
  ];


  private translations: { [key: string]: { [key: string]: string } } = {

    'es': {

      'nav.dashboard': 'Panel de Control',
      'nav.machines': 'Máquinas',
      'nav.designs': 'Diseños',
      'nav.orders': 'Pedidos',
      'nav.reports': 'Reportes',
      'nav.settings': 'Configuraciones',
      'nav.profile': 'Perfil',
      'nav.logout': 'Cerrar Sesión',


      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.add': 'Agregar',
      'common.search': 'Buscar',
      'common.filter': 'Filtrar',
      'common.export': 'Exportar',
      'common.import': 'Importar',
      'common.refresh': 'Actualizar',
      'common.close': 'Cerrar',
      'common.yes': 'Sí',
      'common.no': 'No',
      'common.loading': 'Cargando...',
      'common.error': 'Error',
      'common.success': 'Éxito',
      'common.warning': 'Advertencia',
      'common.info': 'Información',
      'common.online': 'En línea',


      'settings.title': 'Configuraciones del Sistema',
      'settings.users': 'Usuarios',
      'settings.adjustments': 'Ajustes',
      'settings.permissions': 'Permisos',
      'settings.system': 'Sistema',


      'profile.title': 'Mi Perfil',
      'profile.personalInfo': 'Información Personal',
      'profile.changePassword': 'Cambiar Contraseña',
      'profile.activityHistory': 'Historial de Actividad',


      'theme.light': 'Claro',
      'theme.dark': 'Oscuro',
      'theme.auto': 'Automático',


      'message.saved': 'Guardado correctamente',
      'message.deleted': 'Eliminado correctamente',
      'message.error': 'Ha ocurrido un error',
      'message.confirm': '¿Estás seguro?'
    },


    'en': {

      'nav.dashboard': 'Dashboard',
      'nav.machines': 'Machines',
      'nav.designs': 'Designs',
      'nav.orders': 'Orders',
      'nav.reports': 'Reports',
      'nav.settings': 'Settings',
      'nav.profile': 'Profile',
      'nav.logout': 'Logout',


      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.import': 'Import',
      'common.refresh': 'Refresh',
      'common.close': 'Close',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.warning': 'Warning',
      'common.info': 'Information',
      'common.online': 'Online',


      'settings.title': 'System Settings',
      'settings.users': 'Users',
      'settings.adjustments': 'Adjustments',
      'settings.permissions': 'Permissions',
      'settings.system': 'System',


      'profile.title': 'My Profile',
      'profile.personalInfo': 'Personal Information',
      'profile.changePassword': 'Change Password',
      'profile.activityHistory': 'Activity History',


      'theme.light': 'Light',
      'theme.dark': 'Dark',
      'theme.auto': 'Automatic',


      'message.saved': 'Saved successfully',
      'message.deleted': 'Deleted successfully',
      'message.error': 'An error occurred',
      'message.confirm': 'Are you sure?'
    },


    'pt': {

      'nav.dashboard': 'Painel de Controle',
      'nav.machines': 'Máquinas',
      'nav.designs': 'Designs',
      'nav.orders': 'Pedidos',
      'nav.reports': 'Relatórios',
      'nav.settings': 'Configurações',
      'nav.profile': 'Perfil',
      'nav.logout': 'Sair',


      'common.save': 'Salvar',
      'common.cancel': 'Cancelar',
      'common.delete': 'Excluir',
      'common.edit': 'Editar',
      'common.add': 'Adicionar',
      'common.search': 'Buscar',
      'common.filter': 'Filtrar',
      'common.export': 'Exportar',
      'common.import': 'Importar',
      'common.refresh': 'Atualizar',
      'common.close': 'Fechar',
      'common.yes': 'Sim',
      'common.no': 'Não',
      'common.loading': 'Carregando...',
      'common.error': 'Erro',
      'common.success': 'Sucesso',
      'common.warning': 'Aviso',
      'common.info': 'Informação',


      'settings.title': 'Configurações do Sistema',
      'settings.users': 'Usuários',
      'settings.adjustments': 'Ajustes',
      'settings.permissions': 'Permissões',
      'settings.system': 'Sistema',


      'profile.title': 'Meu Perfil',
      'profile.personalInfo': 'Informações Pessoais',
      'profile.changePassword': 'Alterar Senha',
      'profile.activityHistory': 'Histórico de Atividades',


      'theme.light': 'Claro',
      'theme.dark': 'Escuro',
      'theme.auto': 'Automático',


      'message.saved': 'Salvo com sucesso',
      'message.deleted': 'Excluído com sucesso',
      'message.error': 'Ocorreu um erro',
      'message.confirm': 'Tem certeza?'
    },


    'fr': {

      'nav.dashboard': 'Tableau de Bord',
      'nav.machines': 'Machines',
      'nav.designs': 'Designs',
      'nav.orders': 'Commandes',
      'nav.reports': 'Rapports',
      'nav.settings': 'Paramètres',
      'nav.profile': 'Profil',
      'nav.logout': 'Déconnexion',


      'common.save': 'Enregistrer',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.add': 'Ajouter',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.export': 'Exporter',
      'common.import': 'Importer',
      'common.refresh': 'Actualiser',
      'common.close': 'Fermer',
      'common.yes': 'Oui',
      'common.no': 'Non',
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès',
      'common.warning': 'Avertissement',
      'common.info': 'Information',


      'settings.title': 'Paramètres du Système',
      'settings.users': 'Utilisateurs',
      'settings.adjustments': 'Ajustements',
      'settings.permissions': 'Permissions',
      'settings.system': 'Système',


      'profile.title': 'Mon Profil',
      'profile.personalInfo': 'Informations Personnelles',
      'profile.changePassword': 'Changer le Mot de Passe',
      'profile.activityHistory': 'Historique des Activités',


      'theme.light': 'Clair',
      'theme.dark': 'Sombre',
      'theme.auto': 'Automatique',


      'message.saved': 'Enregistré avec succès',
      'message.deleted': 'Supprimé avec succès',
      'message.error': 'Une erreur s\'est produite',
      'message.confirm': 'Êtes-vous sûr?'
    },


    'de': {

      'nav.dashboard': 'Dashboard',
      'nav.machines': 'Maschinen',
      'nav.designs': 'Designs',
      'nav.orders': 'Bestellungen',
      'nav.reports': 'Berichte',
      'nav.settings': 'Einstellungen',
      'nav.profile': 'Profil',
      'nav.logout': 'Abmelden',


      'common.save': 'Speichern',
      'common.cancel': 'Abbrechen',
      'common.delete': 'Löschen',
      'common.edit': 'Bearbeiten',
      'common.add': 'Hinzufügen',
      'common.search': 'Suchen',
      'common.filter': 'Filtern',
      'common.export': 'Exportieren',
      'common.import': 'Importieren',
      'common.refresh': 'Aktualisieren',
      'common.close': 'Schließen',
      'common.yes': 'Ja',
      'common.no': 'Nein',
      'common.loading': 'Laden...',
      'common.error': 'Fehler',
      'common.success': 'Erfolg',
      'common.warning': 'Warnung',
      'common.info': 'Information',


      'settings.title': 'Systemeinstellungen',
      'settings.users': 'Benutzer',
      'settings.adjustments': 'Anpassungen',
      'settings.permissions': 'Berechtigungen',
      'settings.system': 'System',


      'profile.title': 'Mein Profil',
      'profile.personalInfo': 'Persönliche Informationen',
      'profile.changePassword': 'Passwort Ändern',
      'profile.activityHistory': 'Aktivitätsverlauf',


      'theme.light': 'Hell',
      'theme.dark': 'Dunkel',
      'theme.auto': 'Automatisch',


      'message.saved': 'Erfolgreich gespeichert',
      'message.deleted': 'Erfolgreich gelöscht',
      'message.error': 'Ein Fehler ist aufgetreten',
      'message.confirm': 'Sind Sie sicher?'
    }
  };

  constructor(private http: HttpClient) {

    this.loadSavedLanguage();
  }


  getLanguage(): Language {
    return this.currentLanguage();
  }


  setLanguage(language: Language): void {
    console.log(`🌍 Cambiando idioma a: ${language}`);
    this.currentLanguage.set(language);


    localStorage.setItem(this.LANGUAGE_KEY, language);


    document.documentElement.lang = language;

    console.log(`✅ Idioma aplicado: ${language}`);
  }


  private loadSavedLanguage(): void {
    const savedLanguage = localStorage.getItem(this.LANGUAGE_KEY) as Language;
    if (savedLanguage && ['es', 'en', 'pt', 'fr', 'de'].includes(savedLanguage)) {
      this.currentLanguage.set(savedLanguage);
      document.documentElement.lang = savedLanguage;
      console.log(`✅ Idioma cargado desde localStorage: ${savedLanguage}`);
    } else {

      this.currentLanguage.set('es');
      document.documentElement.lang = 'es';
      console.log(`ℹ️ Usando idioma por defecto: es`);
    }
  }


  translate(key: string): string {
    const language = this.currentLanguage();
    const translation = this.translations[language]?.[key];

    if (!translation) {
      console.warn(`⚠️ Traducción no encontrada: ${key} (${language})`);
      return key;
    }

    return translation;
  }


  translateWithParams(key: string, params: { [key: string]: string }): string {
    let translation = this.translate(key);


    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });

    return translation;
  }


  async syncWithSystemConfig(configLanguage: string): Promise<void> {
    const language = configLanguage as Language;
    if (['es', 'en', 'pt', 'fr', 'de'].includes(language)) {
      this.setLanguage(language);
    }
  }


  getCurrentLanguageInfo(): LanguageInfo | undefined {
    return this.availableLanguages.find(lang => lang.code === this.currentLanguage());
  }


  getCurrentLanguageName(): string {
    return this.getCurrentLanguageInfo()?.nativeName || 'Español';
  }
}

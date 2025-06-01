// English Language Pack
export default {
  // Application
  app: {
    name: 'Database Management System',
    version: 'Version 1.0.0',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
  },

  // Database Connection
  database: {
    connection: {
      title: 'Connect to Server',
      serverType: 'Server type:',
      serverName: 'Server name:',
      authentication: 'Authentication:',
      username: 'Username:',
      password: 'Password:',
      rememberPassword: 'Remember password',
      connect: 'Connect',
      cancel: 'Cancel',
      options: 'Options >>',
      help: 'Help',
      connecting: 'Connecting...',
      connectionSuccess: 'Connection successful',
      connectionFailed: 'Connection failed',
      testConnection: 'Test Connection',
      refresh: 'Refresh',
    },

    types: {
      databaseEngine: 'Database Engine',
      analysisServices: 'Analysis Services',
      reportingServices: 'Reporting Services',
      integrationServices: 'Integration Services',
    },

    auth: {
      windowsAuth: 'Windows Authentication',
      sqlServerAuth: 'SQL Server Authentication',
      azureActiveDirectory: 'Azure Active Directory',
    },
  },

  // Main Application
  main: {
    title: 'Main Dashboard',
    welcome: 'Welcome to Database Management System',
    menu: {
      dashboard: 'Dashboard',
      tables: 'Tables',
      queries: 'Queries',
      reports: 'Reports',
      settings: 'Settings',
      help: 'Help',
      logout: 'Logout',
    },
  },

  // Settings
  settings: {
    title: 'Settings',
    general: 'General',
    appearance: 'Appearance',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    advanced: 'Advanced',
    save: 'Save',
    reset: 'Reset',
    apply: 'Apply',

    themes: {
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
      windowsClassic: 'Windows Classic',
    },

    languages: {
      arabic: 'العربية',
      english: 'English',
    },
  },

  // Common UI Elements
  ui: {
    buttons: {
      ok: 'OK',
      cancel: 'Cancel',
      yes: 'Yes',
      no: 'No',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      finish: 'Finish',
      retry: 'Retry',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      import: 'Import',
      print: 'Print',
    },

    messages: {
      confirmDelete: 'Are you sure you want to delete?',
      unsavedChanges: 'You have unsaved changes',
      operationSuccess: 'Operation completed successfully',
      operationFailed: 'Operation failed',
      noDataFound: 'No data found',
      loading: 'Loading...',
      processing: 'Processing...',
      pleaseWait: 'Please wait...',
    },

    validation: {
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      invalidPassword: 'Invalid password',
      passwordMismatch: 'Passwords do not match',
      minLength: 'Minimum {min} characters',
      maxLength: 'Maximum {max} characters',
      invalidFormat: 'Invalid format',
    },
  },

  // Error Messages
  errors: {
    network: 'Network error',
    server: 'Server error',
    database: 'Database error',
    authentication: 'Authentication error',
    authorization: 'Access denied',
    notFound: 'Not found',
    timeout: 'Connection timeout',
    unknown: 'Unknown error',
  },

  // Date and Time
  datetime: {
    now: 'Now',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    thisYear: 'This year',
    lastYear: 'Last year',
  },
};

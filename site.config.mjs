export const siteConfig = {
  name: 'Harrison Appiah',
  siteUrl: 'https://harrisonappiah.dev',
  locale: 'en_US',
  title: 'Harrison Appiah | Computer Scientist & Software Engineer',
  description: 'Computer scientist and software engineer building thoughtful web applications, AI-enabled tools, and creative technology experiences.',
  socialImage: '/social-preview.svg',
  themeColor: '#03040a',
  jobTitle: 'Software Engineer',
  areasOfExpertise: [
    'Computer science',
    'Software engineering',
    'Artificial intelligence',
    'Web development',
    'Creative technology',
  ],
}

export const absoluteUrl = (path = '/') => new URL(path, siteConfig.siteUrl).toString()

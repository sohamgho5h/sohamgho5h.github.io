import { FaLinkedin, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export const companies = [
  { name: 'Microsoft', logo: '/images/companies/microsoft.png' },
  { name: 'Salesforce', logo: '/images/companies/salesforce.svg' },
  { name: 'PwC', logo: '/images/companies/pwc.svg' },
  { name: 'Disney', logo: '/images/companies/disney.png' },
  { name: 'Mitsubishi', logo: '/images/companies/mitsubishi.png' },
  { name: 'IIM Calcutta', logo: '/images/companies/iim-calcutta.png' },
];

export const ANIMATION_DURATION = 200;
export const STAGGER_DELAY = 50;
export const INITIAL_DELAY = 10;

export const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/sohamgho5h',
    Icon: FaLinkedin
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/sohamgho5h',
    Icon: FaInstagram
  },
  {
    name: 'X',
    url: 'https://x.com/sohamgho5h',
    Icon: FaXTwitter
  }
]; 
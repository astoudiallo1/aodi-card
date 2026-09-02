type IconProps = {
  className?: string;
};

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.52 3.48A11.78 11.78 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.86 11.86 0 0 0 5.76 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44ZM12.06 21.15h-.01a9.86 9.86 0 0 1-5.02-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.82 9.82 0 0 1-1.5-5.23c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.03 6.96 2.89a9.78 9.78 0 0 1 2.88 6.96c0 5.43-4.42 9.85-9.83 9.85Zm5.4-7.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.6 3.8c.4-.4 1-.5 1.5-.3l2.2 1c.5.2.8.7.8 1.3l-.2 2.1c0 .4-.2.8-.6 1L9 10.2a12.2 12.2 0 0 0 4.8 4.8l1.3-1.3c.3-.4.7-.6 1.1-.6l2.1-.2c.6 0 1.1.3 1.3.8l1 2.2c.2.5.1 1.1-.3 1.5l-1.3 1.3c-.4.4-1 .6-1.6.5C10.8 18.4 5.6 13.2 4.8 7.7c-.1-.6.1-1.2.5-1.6L6.6 3.8Z"
      />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4.2 7.2 12 12.4l7.8-5.2" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="16.8" cy="7.2" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SnapchatIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3.2c2.9 0 5.1 2.1 5.1 5.3 0 1.3-.2 2.2.4 3.1.3.4.7.6 1.2.7.3 0 .5.3.4.6-.1.4-.6.6-1.1.8-.3.1-.5.3-.5.6 0 .5.6 1 1.3 1.4.4.2.5.6.3.9-.2.4-.7.5-1.2.4-.3 0-.5.1-.6.3-.2.4.1 1 .5 1.5.3.4.1.9-.3 1.1-1.3.5-2.5-.2-3.5.2-1 .4-1.5 1.3-2.4 1.3s-1.4-.9-2.4-1.3c-1-.4-2.2.3-3.5-.2-.4-.2-.6-.7-.3-1.1.4-.5.7-1.1.5-1.5-.1-.2-.3-.3-.6-.3-.5.1-1 0-1.2-.4-.2-.3-.1-.7.3-.9.7-.4 1.3-.9 1.3-1.4 0-.3-.2-.5-.5-.6-.5-.2-1-.4-1.1-.8 0-.3.1-.6.4-.6.5-.1.9-.3 1.2-.7.6-.9.4-1.8.4-3.1 0-3.2 2.2-5.3 5.1-5.3Z" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14.6 3.2v10.1c0 2.1-1.7 3.8-3.8 3.8S7 15.4 7 13.3s1.7-3.8 3.8-3.8c.3 0 .5 0 .8.1V12c-.2-.1-.5-.2-.8-.2-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8V3.2h2c.4 2.3 2 4 4.3 4.4v2.1c-2.1-.3-3.9-1.4-5.1-3.1V3.2h-1.2Z" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14.2 21V12.8h2.8l.4-3.2h-3.2V7.6c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H8.1v3.2h2.7V21h3.4Z" />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.6 9.2H3.9V20h2.7V9.2ZM5.2 4C4.3 4 3.6 4.7 3.6 5.6S4.3 7.2 5.2 7.2 6.8 6.5 6.8 5.6 6.1 4 5.2 4ZM20.1 13.3c0-3.1-1.6-4.5-3.8-4.5-1.8 0-2.6 1-3 1.7V9.2H10.6c0 1.2 0 10.8 0 10.8h2.7v-6c0-.3 0-.7.1-1 .3-.7.9-1.5 2-1.5 1.4 0 2 1.1 2 2.7V20h2.7v-6.7Z" />
    </svg>
  );
}

export function WebsiteIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M4.4 12h15.2M12 4c2.2 2.3 3.4 5 3.4 8s-1.2 5.7-3.4 8c-2.2-2.3-3.4-5-3.4-8s1.2-5.7 3.4-8Z" />
    </svg>
  );
}

export function ContactIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <circle cx="12" cy="10" r="2.2" />
      <path d="M8.2 16.2c.8-1.4 2.1-2 3.8-2s3 .6 3.8 2" />
    </svg>
  );
}

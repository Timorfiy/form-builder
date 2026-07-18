export type IconName =
  | 'heading'
  | 'paragraph'
  | 'divider'
  | 'text'
  | 'textarea'
  | 'mail'
  | 'phone'
  | 'link'
  | 'hash'
  | 'calendar'
  | 'chevronDown'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'star'
  | 'plus'
  | 'trash'
  | 'copy'
  | 'arrowUp'
  | 'arrowDown'
  | 'export'
  | 'import'
  | 'undo'
  | 'redo'
  | 'eye'
  | 'build'
  | 'grip'
  | 'x'
  | 'check'
  | 'github'
  | 'sparkle'
  | 'send'

const PATHS: Record<IconName, React.ReactNode> = {
  heading: (
    <>
      <path d="M6 5v14M18 5v14M6 12h12" />
    </>
  ),
  paragraph: (
    <>
      <path d="M4 6h16M4 11h16M4 16h10" />
    </>
  ),
  divider: <path d="M4 12h16" />,
  text: (
    <>
      <rect x="4" y="7" width="16" height="10" rx="2.5" />
      <path d="M8 12h5" />
    </>
  ),
  textarea: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path d="M8 9.5h8M8 13h5" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
      <path d="m5 8 7 5 7-5" />
    </>
  ),
  phone: (
    <path d="M8.2 4.5 9.8 8a1.5 1.5 0 0 1-.6 1.9l-1.2.8a12.6 12.6 0 0 0 5.3 5.3l.8-1.2a1.5 1.5 0 0 1 1.9-.6l3.5 1.6a1.5 1.5 0 0 1 .9 1.7l-.5 2A1.5 1.5 0 0 1 18.4 21 15.5 15.5 0 0 1 3 5.6a1.5 1.5 0 0 1 1.4-1.5l2-.5a1.5 1.5 0 0 1 1.8.9Z" />
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 6 .4l2.2-2.2a4 4 0 0 0-5.6-5.6l-1.3 1.2" />
      <path d="M14 10a4 4 0 0 0-6-.4l-2.2 2.2a4 4 0 0 0 5.6 5.6l1.3-1.2" />
    </>
  ),
  hash: <path d="M9 4 7 20M17 4l-2 16M4.5 9h16M3.5 15h16" />,
  calendar: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2.5" />
      <path d="M4 10.5h16M8.5 3.5V7M15.5 3.5V7" />
    </>
  ),
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  radio: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  checkbox: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="3.5" />
      <path d="m8.5 12.2 2.4 2.4 4.6-5" />
    </>
  ),
  toggle: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="5" />
      <circle cx="16" cy="12" r="2.6" fill="currentColor" stroke="none" />
    </>
  ),
  star: (
    <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V5.3A1.3 1.3 0 0 1 10.8 4h2.4a1.3 1.3 0 0 1 1.3 1.3V7" />
      <path d="M6.5 7 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5.5 15h-.3A1.2 1.2 0 0 1 4 13.8V5.2A1.2 1.2 0 0 1 5.2 4h8.6a1.2 1.2 0 0 1 1.2 1.2v.3" />
    </>
  ),
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  export: (
    <>
      <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" />
      <path d="M4.5 14v4A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-4" />
    </>
  ),
  import: (
    <>
      <path d="M12 3.5V15M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4.5 14v4A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-4" />
    </>
  ),
  undo: <path d="M8.5 6.5 5 10l3.5 3.5M5 10h9a5 5 0 0 1 0 10h-2.5" />,
  redo: <path d="m15.5 6.5 3.5 3.5-3.5 3.5M19 10h-9a5 5 0 0 0 0 10h2.5" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  build: (
    <>
      <path d="M14.7 6.3a4.3 4.3 0 0 0-5.6 5.6L4 17l3 3 5.1-5.1a4.3 4.3 0 0 0 5.6-5.6l-2.8 2.8-2.5-.5-.5-2.5 2.8-2.8Z" />
    </>
  ),
  grip: (
    <>
      <circle cx="9" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  github: (
    <path d="M12 3a9 9 0 0 0-2.8 17.6c.4.1.6-.2.6-.4v-1.5c-2.5.5-3-1-3-1-.4-1-1-1.3-1-1.3-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.7.8 0-.6.3-1 .6-1.3-2-.2-4-1-4-4.4 0-1 .3-1.7.9-2.4-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.4.9a8.3 8.3 0 0 1 4.4 0c1.7-1.1 2.4-.9 2.4-.9.5 1.2.2 2.1.1 2.3.6.7.9 1.4.9 2.4 0 3.4-2 4.2-4 4.4.3.3.6.8.6 1.7v2.5c0 .2.2.5.6.4A9 9 0 0 0 12 3Z" />
  ),
  sparkle: (
    <path d="M12 4c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5ZM19 15.5c.3 1.7 1.2 2.6 2.9 2.9-1.7.3-2.6 1.2-2.9 2.9-.3-1.7-1.2-2.6-2.9-2.9 1.7-.3 2.6-1.2 2.9-2.9Z" />
  ),
  send: <path d="M20 4 10.5 13.5M20 4l-6 16.5-3.5-7-7-3.5L20 4Z" />,
}

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.5,
  className,
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  )
}

import { communicationChannels, personalInfo, profile } from '@/data/content'

function ChannelMark({ channel }: { channel: (typeof communicationChannels)[number] }) {
  if (channel.id === 'github') return <span className="communication-footer__mark communication-footer__mark--github" aria-hidden="true">GH</span>
  if (channel.id === 'linkedin') return <span className="communication-footer__mark communication-footer__mark--linkedin" aria-hidden="true">in</span>
  if (channel.id === 'twitter') return <span className="communication-footer__mark communication-footer__mark--twitter" aria-hidden="true">X</span>

  return (
    <svg className="communication-footer__mark communication-footer__mark--email" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Persistent end-of-site contact surface built from the portfolio contact data. */
export function CommunicationFooter() {
  return (
    <footer className="communication-footer" aria-label="Contact details">
      <div className="communication-footer__inner">
        <div className="communication-footer__identity">
          <span className="communication-footer__eyebrow">COMMUNICATION NODES</span>
          <strong>{personalInfo.name}</strong>
          <span>{personalInfo.title}</span>
        </div>

        <nav className="communication-footer__links" aria-label="Contact channels">
          {communicationChannels.map((channel) => (
            <a
              key={channel.id}
              href={channel.url}
              target={channel.id === 'email' ? undefined : '_blank'}
              rel={channel.id === 'email' ? undefined : 'noopener noreferrer'}
              aria-label={`${channel.label}: ${channel.handle}`}
            >
              <ChannelMark channel={channel} />
              <span>{channel.label}</span>
              <small>{channel.handle}</small>
            </a>
          ))}
        </nav>

        <div className="communication-footer__meta">
          <span>{personalInfo.location}</span>
          <span className="communication-footer__available">
            <i aria-hidden="true" />
            {profile.availability === 'open' ? 'Available for collaboration' : profile.availability}
          </span>
        </div>
      </div>
    </footer>
  )
}

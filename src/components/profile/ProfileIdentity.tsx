import type { PublicProfile } from "@/types/profile";

function getInitials(profile: PublicProfile): string {
  const first = profile.firstName.trim().charAt(0);
  const last = profile.lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || profile.displayName.charAt(0).toUpperCase();
}

export function ProfileIdentity({ profile }: { profile: PublicProfile }) {
  const initials = getInitials(profile);

  return (
    <div className="flex flex-col items-center px-6 text-center">
      <div className="relative -mt-14">
        <div className="rounded-full bg-gradient-to-br from-aodi-gold-light via-aodi-gold to-aodi-gold-dark p-[2px] shadow-lg">
          <div className="rounded-full bg-aodi-cream p-1">
            {profile.profilePhoto ? (
              // Photo fournie par la base : URL libre (upload / CDN plus tard).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profilePhoto}
                alt={profile.displayName}
                className="h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-aodi-violet-900">
                <span className="font-display text-3xl tracking-[0.12em] text-aodi-gold-light">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <h1 className="mt-5 font-display text-[2rem] font-semibold leading-tight tracking-wide text-aodi-violet-900">
        {profile.displayName}
      </h1>

      {profile.jobTitle ? (
        <p className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-aodi-gold-dark">
          {profile.jobTitle}
        </p>
      ) : null}

      {profile.company ? (
        <p className="mt-1.5 text-sm text-aodi-violet-700/80">{profile.company}</p>
      ) : null}

      {profile.bio ? (
        <p className="mt-4 max-w-[20rem] text-sm leading-relaxed text-aodi-violet-800/75">
          {profile.bio}
        </p>
      ) : null}
    </div>
  );
}

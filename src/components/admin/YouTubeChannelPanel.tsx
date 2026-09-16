/* eslint-disable @next/next/no-img-element */
import { isYouTubeConfigured, YOUTUBE_VIDEO_LIMIT, type YouTubeChannelConfig, type YouTubeFeed } from "@/lib/youtube";
import { isYouTubeSaveStatus, youtubeStatusMessages, type YouTubeSaveStatus, type YouTubeStatusTone } from "@/lib/youtube-admin";

/**
 * Panneau admin partage "Chaine YouTube" : saisie d'un lien/@handle, chaine resolue, apercu des dernieres
 * videos synchronisees, retrait. Le formulaire poste `youtubeChannelUrl` vers `action` (valeur vide = retrait).
 * Utilisable pour n'importe quelle cible portant un `YouTubeChannelConfig` (section de profil, artiste...).
 */

const TONES: Record<YouTubeStatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-aodi-violet-100 bg-white text-aodi-violet-700",
};

type YouTubeChannelPanelProps = {
  action: string;
  config: YouTubeChannelConfig;
  feed: YouTubeFeed | null;
  status?: string | null;
  title?: string;
  description?: string;
  messageOverrides?: Partial<Record<YouTubeSaveStatus, string>>;
  unavailableHint?: string;
  className?: string;
};

function YouTubeSyncStatus({ config, feed, unavailableHint }: { config: YouTubeChannelConfig; feed: YouTubeFeed | null; unavailableHint: string }) {
  if (feed) {
    return (
      <div className="mt-4 rounded-lg border border-aodi-violet-100 bg-white p-4">
        <p className="text-sm font-semibold text-aodi-violet-900">
          {feed.videos.length === 0 ? "Aucune video publique trouvee sur cette chaine." : `${feed.videos.length} video${feed.videos.length > 1 ? "s" : ""} synchronisee${feed.videos.length > 1 ? "s" : ""}`}
          <span className="ml-2 text-xs font-medium text-aodi-violet-700/60">({feed.source === "api" ? "API YouTube" : "flux public YouTube"} - cache 30 min)</span>
        </p>
        {feed.videos.length > 0 ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {feed.videos.map((video) => (
              <li key={video.videoId} className="flex items-center gap-3 rounded-lg bg-[#FBF8F1] p-2">
                <img src={video.thumbnail} alt="" className="h-12 w-20 shrink-0 rounded object-cover" />
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="line-clamp-2 text-xs font-semibold text-aodi-violet-900 hover:text-aodi-gold-dark">{video.title}</a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (!config.youtubeChannelId && !isYouTubeConfigured()) {
    return <p className={`mt-4 rounded-lg border px-4 py-3 text-sm ${TONES.warning}`}>Ce lien @handle ne peut pas encore etre synchronise : ajoute YOUTUBE_API_KEY cote serveur puis clique sur Enregistrer.</p>;
  }

  return <p className={`mt-4 rounded-lg border px-4 py-3 text-sm ${TONES.warning}`}>Synchronisation YouTube indisponible pour le moment. {unavailableHint}</p>;
}

export function YouTubeChannelPanel({
  action,
  config,
  feed,
  status,
  title = "Chaine YouTube",
  description = `Colle une seule fois le lien de la chaine : les ${YOUTUBE_VIDEO_LIMIT} dernieres videos publiques sont recuperees automatiquement et affichees sur le profil public.`,
  messageOverrides,
  unavailableHint = "Le profil public affiche le contenu de repli en attendant.",
  className = "mt-6",
}: YouTubeChannelPanelProps) {
  const message = isYouTubeSaveStatus(status) ? { tone: youtubeStatusMessages[status].tone, text: messageOverrides?.[status] ?? youtubeStatusMessages[status].text } : null;
  const channelTitle = feed?.channel.title ?? config.youtubeChannelTitle;
  const channelHandle = feed?.channel.handle ?? config.youtubeHandle;
  const channelUrl = feed?.channel.url ?? config.youtubeChannelUrl;

  return (
    <section className={`${className} rounded-lg border border-aodi-violet-100 bg-[#FBF8F1]/90 p-5 shadow-sm`}>
      <h2 className="font-display text-2xl font-semibold text-aodi-violet-900">{title}</h2>
      <p className="mt-1 text-sm text-aodi-violet-700/70">{description}</p>

      {message ? <p className={`mt-4 rounded-lg border px-4 py-3 text-sm font-semibold ${TONES[message.tone]}`}>{message.text}</p> : null}

      <form action={action} method="post" className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-aodi-violet-700/60">Lien de la chaine</span>
          <input name="youtubeChannelUrl" type="text" inputMode="url" autoComplete="off" defaultValue={config.youtubeChannelUrl ?? ""} placeholder="https://youtube.com/@artiste" className="mt-1 w-full rounded-lg border border-aodi-violet-100 bg-white px-3 py-2 text-sm outline-none focus:border-aodi-gold focus:ring-2 focus:ring-aodi-gold/20" />
          <span className="mt-1 block text-xs text-aodi-violet-700/60">Exemple : https://youtube.com/@artiste ou https://youtube.com/channel/UC...</span>
        </label>
        <button type="submit" className="rounded-lg bg-aodi-violet-900 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-aodi-violet-800">Enregistrer</button>
      </form>

      {channelUrl ? (
        <div className="mt-5 rounded-lg bg-white px-4 py-4 text-sm text-aodi-violet-800 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-emerald-700">&#10003; Chaine configuree</p>
              {channelTitle ? <p className="mt-1 text-base font-bold text-aodi-violet-900">{channelTitle}</p> : null}
              {channelHandle ? <p className="mt-0.5 text-aodi-violet-700/75">@{channelHandle}</p> : null}
              {config.youtubeChannelId ? <p className="mt-1 text-xs text-aodi-violet-700/55">ID : {config.youtubeChannelId}</p> : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <a href={channelUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-aodi-violet-200 bg-white px-3 py-2 text-xs font-semibold text-aodi-violet-900 hover:border-aodi-gold">Voir la chaine</a>
              <form action={action} method="post">
                <input type="hidden" name="youtubeChannelUrl" value="" />
                <button type="submit" className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">Retirer</button>
              </form>
            </div>
          </div>
          <YouTubeSyncStatus config={config} feed={feed} unavailableHint={unavailableHint} />
        </div>
      ) : null}
    </section>
  );
}

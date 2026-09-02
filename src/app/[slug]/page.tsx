import { InactiveProfile } from "@/components/profile/InactiveProfile";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { lookupProfileBySlug } from "@/lib/profiles";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await lookupProfileBySlug(slug);

  if (result.status !== "found") {
    return { title: "Profil introuvable" };
  }

  const description =
    [result.profile.jobTitle, result.profile.company].filter(Boolean).join(" · ") ||
    `Profil AODI Card de ${result.profile.displayName}`;

  return {
    title: result.profile.displayName,
    description,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const result = await lookupProfileBySlug(slug);

  if (result.status === "missing") {
    notFound();
  }

  return (
    <main className="bogolan-page md:flex md:min-h-dvh md:items-center md:justify-center md:px-4 md:py-10">
      {result.status === "inactive" ? (
        <InactiveProfile />
      ) : (
        <ProfileCard profile={result.profile} />
      )}
    </main>
  );
}

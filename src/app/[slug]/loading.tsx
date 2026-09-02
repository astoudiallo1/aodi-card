export default function ProfileLoading() {
  return (
    <main className="bogolan-page md:flex md:min-h-dvh md:items-center md:justify-center md:px-4 md:py-10">
      <div className="mx-auto min-h-dvh w-full max-w-[430px] overflow-hidden bg-[#FBF8F1] md:min-h-[640px] md:rounded-[2rem] md:shadow-card">
        <div className="bogolan-header h-40" />
        <div className="flex flex-col items-center px-6">
          <div className="-mt-12 h-28 w-28 rounded-full bg-aodi-cream-dark" />
          <div className="mt-6 h-7 w-48 rounded-full bg-aodi-violet-100" />
          <div className="mt-3 h-3 w-40 rounded-full bg-aodi-gold/30" />
        </div>
      </div>
    </main>
  );
}
